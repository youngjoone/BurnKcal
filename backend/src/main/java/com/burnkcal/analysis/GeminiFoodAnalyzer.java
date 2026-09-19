package com.burnkcal.analysis;

import java.io.IOException;
import com.burnkcal.ai.GeminiClient;
import java.net.URI;
import java.net.http.HttpClient;
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
    private final GeminiClient client;
    private final String prompt;
    private final String textPrompt;
    private final JsonNode schema;

    @Autowired
    public GeminiFoodAnalyzer(@Value("${burnkcal.gemini.api-key}") String apiKey,
            @Value("${burnkcal.gemini.model}") String model, ObjectMapper mapper) {
        this(apiKey, model, mapper, HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build(),
                URI.create("https://generativelanguage.googleapis.com/v1beta/"), Duration.ofSeconds(25));
    }

    // Package-private endpoint injection keeps tests offline without exposing a production override.
    GeminiFoodAnalyzer(String apiKey, String model, ObjectMapper mapper, HttpClient client, URI base, Duration timeout) {
        this.client = new GeminiClient(apiKey, model, mapper, client, base, timeout);
        try {
            this.prompt = new ClassPathResource("gemini/analysis-prompt.txt").getContentAsString(StandardCharsets.UTF_8);
            this.textPrompt = new ClassPathResource("gemini/text-analysis-prompt.txt").getContentAsString(StandardCharsets.UTF_8);
            this.schema = mapper.readTree(new ClassPathResource("gemini/analysis-schema.json").getContentAsString(StandardCharsets.UTF_8));
        } catch (IOException exception) {
            throw new IllegalStateException("Gemini 분석 설정 파일을 읽을 수 없습니다.", exception);
        }
    }

    @Override
    public AnalysisResult analyze(byte[] image, String contentType, String note) {
        return requestAnalysis(prompt, List.of(
                Map.of("inlineData", Map.of("mimeType", contentType, "data", Base64.getEncoder().encodeToString(image))),
                Map.of("text", "음식 설명 (비어 있을 수 있음): " + note)), true);
    }

    @Override
    public AnalysisResult analyzeText(String foodName, String portion) {
        return requestAnalysis(textPrompt, List.of(Map.of("text", "음식 이름: " + foodName + "\n먹은 양: " + portion)), false);
    }

    private AnalysisResult requestAnalysis(String systemPrompt, List<?> parts, boolean photo) {
        return parseResponse(client.generate(systemPrompt, schema, parts, 0.2, 4096), photo);
    }

    private AnalysisResult parseResponse(JsonNode result, boolean photo) {
        try {
            String status = string(result, "status", 20);
            if ("not_food".equals(status)) {
                throw failure(HttpStatus.UNPROCESSABLE_CONTENT, photo ? "음식을 찾지 못했어요. 음식이 보이는 사진을 선택해 주세요." : "음식 이름을 확인하지 못했어요. 먹은 음식 이름을 입력해 주세요.");
            }
            if ("uncertain".equals(status)) {
                throw failure(HttpStatus.UNPROCESSABLE_CONTENT, photo ? "음식을 구분하기 어려워요. 밝은 곳에서 전체가 보이도록 다시 찍어 주세요." : "어떤 음식인지 구분하기 어려워요. 재료나 조리 방법을 조금 더 적어 주세요.");
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
            notices.add(photo ? "사진으로 추정한 값입니다. 실제 음식의 양·조리법·소스에 따라 달라질 수 있어요." : "음식 이름과 일반적인 분량으로 AI가 추정한 값이에요. 실제 음식이나 검증된 평균 영양값과 다를 수 있어요.");
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
