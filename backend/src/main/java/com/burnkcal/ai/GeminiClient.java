package com.burnkcal.ai;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** Server-only transport shared by photo, food-name and recipe generation. */
public final class GeminiClient {
    private final String key;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final URI endpoint;
    private final Duration timeout;

    public GeminiClient(String key, String model, ObjectMapper mapper) {
        this(key, model, mapper, HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build(),
                URI.create("https://generativelanguage.googleapis.com/v1beta/"), Duration.ofSeconds(25));
    }

    public GeminiClient(String key, String model, ObjectMapper mapper, HttpClient client, URI base, Duration timeout) {
        if (key == null || key.isBlank()) throw new IllegalStateException("Gemini 모드에는 GEMINI_API_KEY가 필요합니다. backend/.env를 확인하세요.");
        if (!model.matches("[a-zA-Z0-9._-]+")) throw new IllegalStateException("GEMINI_MODEL 형식이 올바르지 않습니다.");
        this.key = key.trim(); this.mapper = mapper; this.client = client;
        this.endpoint = base.resolve("models/" + model + ":generateContent"); this.timeout = timeout;
    }

    public JsonNode generate(String prompt, JsonNode schema, List<?> parts, double temperature, int maxTokens) {
        var payload = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", prompt))),
                "contents", List.of(Map.of("role", "user", "parts", parts)),
                "generationConfig", Map.of("responseMimeType", "application/json", "responseJsonSchema", schema,
                        "maxOutputTokens", maxTokens, "temperature", temperature));
        try {
            var request = HttpRequest.newBuilder(endpoint).timeout(timeout)
                    .header("Content-Type", "application/json").header("x-goog-api-key", key)
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload))).build();
            var response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            int status = response.statusCode();
            if (status == 429) throw error(HttpStatus.TOO_MANY_REQUESTS, "AI 호출 한도에 도달했어요. 잠시 후 다시 시도해 주세요.");
            if (status == 401 || status == 403) throw error(HttpStatus.SERVICE_UNAVAILABLE, "AI 서버 인증을 확인해야 해요. 서버의 Gemini 키와 권한을 확인해 주세요.");
            if (status != 200) throw error(HttpStatus.BAD_GATEWAY, "AI 요청을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.");
            JsonNode candidate = mapper.readTree(response.body()).path("candidates").path(0);
            if (!"STOP".equals(candidate.path("finishReason").asText())) throw invalid();
            var text = new StringBuilder();
            for (JsonNode part : candidate.path("content").path("parts")) {
                if (!part.path("thought").asBoolean(false) && part.path("text").isTextual()) text.append(part.path("text").asText());
            }
            return mapper.readTree(text.toString());
        } catch (HttpTimeoutException exception) {
            throw error(HttpStatus.GATEWAY_TIMEOUT, "AI 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw error(HttpStatus.SERVICE_UNAVAILABLE, "AI 요청이 중단됐어요. 다시 시도해 주세요.");
        } catch (IOException exception) {
            throw error(HttpStatus.BAD_GATEWAY, "AI 서비스에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.");
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw invalid();
        }
    }
    private ResponseStatusException invalid() { return error(HttpStatus.BAD_GATEWAY, "AI 결과 형식을 확인하지 못했어요. 다시 시도해 주세요."); }
    private ResponseStatusException error(HttpStatus status, String message) { return new ResponseStatusException(status, message); }
}
