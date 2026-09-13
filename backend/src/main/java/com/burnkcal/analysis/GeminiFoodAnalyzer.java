package com.burnkcal.analysis;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@ConditionalOnProperty(name = "burnkcal.analysis-mode", havingValue = "gemini")
public class GeminiFoodAnalyzer implements FoodAnalyzer {
    private final String apiKey;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final URI endpoint;
    private final Duration timeout;
    private final String prompt;
    private final JsonNode schema;

    @Autowired
    public GeminiFoodAnalyzer(@Value("${burnkcal.gemini.api-key}") String apiKey,
            @Value("${burnkcal.gemini.model}") String model, ObjectMapper mapper) {
        this(apiKey, model, mapper, HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build(),
                URI.create("https://generativelanguage.googleapis.com/v1beta/"), Duration.ofSeconds(25));
    }

    // Package-private endpoint injection keeps tests offline without exposing a production override.
    GeminiFoodAnalyzer(String apiKey, String model, ObjectMapper mapper, HttpClient client, URI base, Duration timeout) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini 모드에는 GEMINI_API_KEY가 필요합니다. backend/.env를 확인하세요.");
        }
        if (!model.matches("[a-zA-Z0-9._-]+")) {
            throw new IllegalStateException("GEMINI_MODEL 형식이 올바르지 않습니다.");
        }
        this.apiKey = apiKey.trim();
        this.mapper = mapper;
        this.client = client;
        this.endpoint = base.resolve("models/" + model + ":generateContent");
        this.timeout = timeout;
        try {
            this.prompt = new ClassPathResource("gemini/analysis-prompt.txt").getContentAsString(StandardCharsets.UTF_8);
            this.schema = mapper.readTree(new ClassPathResource("gemini/analysis-schema.json").getContentAsString(StandardCharsets.UTF_8));
        } catch (IOException exception) {
            throw new IllegalStateException("Gemini 분석 설정 파일을 읽을 수 없습니다.", exception);
        }
    }

    @Override
    public AnalysisResult analyze(byte[] image, String contentType, String note) {
        var payload = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", prompt))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(
                        Map.of("inlineData", Map.of("mimeType", contentType, "data", Base64.getEncoder().encodeToString(image))),
                        Map.of("text", "음식 설명 (비어 있을 수 있음): " + note)))),
                "generationConfig", Map.of("responseMimeType", "application/json", "responseJsonSchema", schema,
                        "maxOutputTokens", 4096, "temperature", 0.2));
        try {
            var request = HttpRequest.newBuilder(endpoint).timeout(timeout)
                    .header("Content-Type", "application/json").header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload))).build();
            var response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() == 429) {
                throw failure(HttpStatus.TOO_MANY_REQUESTS, "AI 호출 한도에 도달했어요. 잠시 후 다시 시도해 주세요.");
            }
            if (response.statusCode() == 401 || response.statusCode() == 403) {
                throw failure(HttpStatus.SERVICE_UNAVAILABLE, "AI 서버 인증을 확인해야 해요. 서버의 Gemini 키와 권한을 확인해 주세요.");
            }
            if (response.statusCode() != 200) {
                throw failure(HttpStatus.BAD_GATEWAY, "AI 분석을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.");
            }
            return parseResponse(response.body());
        } catch (HttpTimeoutException exception) {
            throw failure(HttpStatus.GATEWAY_TIMEOUT, "AI 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw failure(HttpStatus.SERVICE_UNAVAILABLE, "AI 요청이 중단됐어요. 다시 시도해 주세요.");
        } catch (IOException exception) {
            throw failure(HttpStatus.BAD_GATEWAY, "AI 서비스에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.");
        }
    }

    private AnalysisResult parseResponse(String body) {
        try {
            JsonNode envelope = mapper.readTree(body);
            JsonNode candidate = envelope.path("candidates").path(0);
            if (!"STOP".equals(candidate.path("finishReason").asText())) {
                throw invalidResponse();
            }
            var text = new StringBuilder();
            for (JsonNode part : candidate.path("content").path("parts")) {
                if (!part.path("thought").asBoolean(false) && part.path("text").isTextual()) {
                    text.append(part.path("text").asText());
                }
            }
            JsonNode result = mapper.readTree(text.toString());
            String status = string(result, "status", 20);
            if ("not_food".equals(status)) {
                throw failure(HttpStatus.UNPROCESSABLE_CONTENT, "음식을 찾지 못했어요. 음식이 보이는 사진을 선택해 주세요.");
            }
            if ("uncertain".equals(status)) {
                throw failure(HttpStatus.UNPROCESSABLE_CONTENT, "음식을 구분하기 어려워요. 밝은 곳에서 전체가 보이도록 다시 찍어 주세요.");
            }
            if (!"food".equals(status) || !result.path("items").isArray()
                    || result.path("items").isEmpty() || result.path("items").size() > 20) {
                throw invalidResponse();
            }
            var items = new ArrayList<AnalysisResult.FoodItem>();
            int total = 0;
            int minimum = 0;
            int maximum = 0;
            for (JsonNode item : result.path("items")) {
                int kcal = calories(item, "kcal");
                int min = calories(item, "minKcal");
                int max = calories(item, "maxKcal");
                if (min > kcal || kcal > max) throw invalidResponse();
                items.add(new AnalysisResult.FoodItem(string(item, "name", 100), string(item, "portion", 200), kcal));
                total += kcal;
                minimum += min;
                maximum += max;
            }
            if (!result.path("notices").isArray() || result.path("notices").size() > 8) throw invalidResponse();
            var notices = new ArrayList<String>();
            notices.add("사진으로 추정한 값입니다. 실제 음식의 양·조리법·소스에 따라 달라질 수 있어요.");
            for (JsonNode notice : result.path("notices")) {
                if (!notice.isTextual() || notice.asText().length() > 500) throw invalidResponse();
                if (!notice.asText().isBlank()) notices.add(notice.asText());
            }
            return new AnalysisResult("ai", string(result, "title", 100), total,
                    new AnalysisResult.CalorieRange(minimum, maximum), List.copyOf(items), List.copyOf(notices));
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            // Never propagate provider bodies, photo data, or credentials to the app/logs.
            throw invalidResponse();
        }
    }

    private String string(JsonNode parent, String field, int maxLength) {
        JsonNode value = parent.path(field);
        if (!value.isTextual() || value.asText().isBlank() || value.asText().length() > maxLength) throw invalidResponse();
        return value.asText().trim();
    }

    private int calories(JsonNode parent, String field) {
        JsonNode value = parent.path(field);
        if (!value.isIntegralNumber() || !value.canConvertToInt() || value.asInt() < 0 || value.asInt() > 10_000) {
            throw invalidResponse();
        }
        return value.asInt();
    }

    private ResponseStatusException invalidResponse() {
        return failure(HttpStatus.BAD_GATEWAY, "AI 결과 형식을 확인하지 못했어요. 다시 시도해 주세요.");
    }

    private ResponseStatusException failure(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }
}
