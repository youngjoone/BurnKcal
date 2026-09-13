package com.burnkcal.analysis;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.*;

class GeminiFoodAnalyzerTests {
    private final JsonMapper mapper = JsonMapper.builder().build();
    private HttpServer server;
    private GeminiFoodAnalyzer analyzer;
    private volatile int status = 200;
    private volatile String response;
    private volatile JsonNode requestBody;
    private volatile String authHeader;
    private volatile String requestPath;

    private static final String FOOD = """
            {"status":"food","title":"한 끼","items":[
              {"name":"밥","portion":"1공기 약 200g","kcal":300,"minKcal":250,"maxKcal":350},
              {"name":"닭고기","portion":"약 100g","kcal":200,"minKcal":150,"maxKcal":250}
            ],"notices":["소스는 확인하기 어려워요."]}
            """;

    @BeforeEach
    void setUp() throws Exception {
        response = envelope(FOOD);
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            authHeader = exchange.getRequestHeaders().getFirst("x-goog-api-key");
            requestPath = exchange.getRequestURI().toString();
            requestBody = mapper.readTree(exchange.getRequestBody().readAllBytes());
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, bytes.length);
            try (var output = exchange.getResponseBody()) { output.write(bytes); }
            exchange.close();
        });
        server.start();
        analyzer = client("test-only-key", Duration.ofSeconds(3));
    }

    private GeminiFoodAnalyzer client(String key, Duration timeout) {
        return new GeminiFoodAnalyzer(key, "gemini-3.1-flash-lite", mapper, HttpClient.newHttpClient(),
                URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/"), timeout);
    }

    @AfterEach
    void stop() { server.stop(0); }

    private String envelope(String text) {
        return mapper.writeValueAsString(Map.of("candidates", List.of(Map.of(
                "finishReason", "STOP", "content", Map.of("parts", List.of(Map.of("text", text)))))));
    }

    @Test
    void sendsImageAndNoteAndDerivesTotalsFromEveryFood() {
        var result = analyzer.analyze(new byte[]{1, 2, 3}, "image/png", "밥 반 공기");
        assertThat(result.mode()).isEqualTo("ai");
        assertThat(result.items()).hasSize(2);
        assertThat(result.totalKcal()).isEqualTo(500);
        assertThat(result.range()).isEqualTo(new AnalysisResult.CalorieRange(400, 600));
        assertThat(result.notices()).anyMatch(n -> n.contains("추정"));
        assertThat(requestBody.at("/contents/0/parts/0/inlineData/mimeType").asText()).isEqualTo("image/png");
        assertThat(requestBody.at("/contents/0/parts/0/inlineData/data").asText()).isEqualTo("AQID");
        assertThat(requestBody.at("/contents/0/parts/1/text").asText()).contains("밥 반 공기");
        assertThat(authHeader).isEqualTo("test-only-key");
        assertThat(requestPath).doesNotContain("test-only-key", "key=");
    }

    @Test
    void rejectsNonFoodInsteadOfShowingZeroCalories() {
        response = envelope("{\"status\":\"not_food\",\"title\":\"사진\",\"items\":[],\"notices\":[]}");
        assertStatus(422);
    }

    @Test
    void asksForNewPhotoWhenUncertain() {
        response = envelope("{\"status\":\"uncertain\",\"title\":\"흐림\",\"items\":[],\"notices\":[]}");
        assertStatus(422);
    }

    @Test
    void rejectsInvalidNumbersAndInvertedRanges() {
        for (String body : List.of(FOOD.replace("\"kcal\":300", "\"kcal\":-1"),
                FOOD.replace("\"minKcal\":250", "\"minKcal\":999"),
                FOOD.replace("\"kcal\":300", "\"kcal\":300.5"))) {
            response = envelope(body);
            assertStatus(502);
        }
    }

    @Test
    void rejectsMalformedOrTruncatedProviderOutput() {
        for (String body : List.of("not json", "{}", envelope("not json"),
                envelope(FOOD).replace("STOP", "MAX_TOKENS"))) {
            response = body;
            assertStatus(502);
        }
    }

    @Test
    void mapsQuotaAndAuthErrorsWithoutLeakingProviderMessages() {
        response = "{\"error\":\"test-only-key private upstream text\"}";
        for (int code : List.of(401, 403, 429, 500)) {
            status = code;
            var error = catchThrowableOfType(() -> analyzer.analyze(new byte[]{1}, "image/jpeg", ""), ResponseStatusException.class);
            assertThat(error.getStatusCode().value()).isEqualTo(code == 429 ? 429 : code == 500 ? 502 : 503);
            assertThat(error.getReason()).doesNotContain("test-only-key", "upstream");
        }
    }

    @Test
    void requiresKeyWhenGeminiModeIsSelected() {
        assertThatThrownBy(() -> client("", Duration.ofSeconds(1)))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("GEMINI_API_KEY");
    }

    private void assertStatus(int expected) {
        var error = catchThrowableOfType(() -> analyzer.analyze(new byte[]{1}, "image/jpeg", ""), ResponseStatusException.class);
        assertThat(error.getStatusCode().value()).isEqualTo(expected);
    }
}
