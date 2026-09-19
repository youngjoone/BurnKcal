package com.burnkcal.recommendation;
import com.burnkcal.ai.GeminiClient;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.*;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import static org.assertj.core.api.Assertions.*;

class GeminiRecipeRecommenderTests {
    private final JsonMapper mapper = JsonMapper.builder().build();
    private HttpServer server;
    private GeminiRecipeRecommender recommender;
    private volatile JsonNode context;
    private volatile String body;
    private static final String RECIPE = """
      {"recipes":[{"name":"닭고기 밥","minutes":20,"allergens":[],
       "ingredients":[{"name":"닭가슴살","amount":"100g"},{"name":"밥","amount":"150g"}],
       "steps":["닭고기를 충분히 익히고 밥과 담아요."],
       "nutrition":{"kcal":500,"proteinG":35,"carbsG":55,"fatG":16}}]}
      """;
    @BeforeEach void start() throws Exception {
        body = RECIPE;
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            JsonNode request = mapper.readTree(exchange.getRequestBody().readAllBytes());
            context = mapper.readTree(request.at("/contents/0/parts/0/text").asText());
            byte[] bytes = mapper.writeValueAsString(Map.of("candidates", List.of(Map.of("finishReason", "STOP", "content", Map.of("parts", List.of(Map.of("text", body))))))).getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, bytes.length);
            try (var output = exchange.getResponseBody()) { output.write(bytes); }
            exchange.close();
        });
        server.start();
        recommender = new GeminiRecipeRecommender(new GeminiClient("test-key", "test-model", mapper, HttpClient.newHttpClient(), URI.create("http://127.0.0.1:"+server.getAddress().getPort()+"/"), Duration.ofSeconds(3)), mapper);
    }
    @AfterEach void stop() { server.stop(0); }
    private RecommendationRequest input(int remaining, List<String> allergens, String excluded) {
        return new RecommendationRequest(1650, remaining, new RecommendationRequest.Preferences(allergens, excluded, 30), List.of());
    }
    @Test void generatesNutritionAndSendsOnlyDerivedTargetAndPreferences() {
        var result = recommender.recommend(input(600, List.of("생선"), "오이"));
        assertThat(result.mode()).isEqualTo("ai");
        assertThat(result.recipes()).hasSize(1);
        assertThat(result.recipes().get(0).source()).isEqualTo("ai");
        assertThat(result.recipes().get(0).nutrition().proteinG()).isEqualTo(35);
        assertThat(context.path("remainingKcal").asInt()).isEqualTo(600);
        assertThat(context.path("preferences").path("allergens").get(0).asText()).isEqualTo("생선");
        assertThat(context.has("currentKg")).isFalse();
        assertThat(context.has("heightCm")).isFalse();
    }
    @Test void lowRemainderKeepsANormalMealAndExplainsTheLimit() {
        var result = recommender.recommend(input(200, List.of(), ""));
        assertThat(context.path("minMealKcal").asInt()).isEqualTo(400);
        assertThat(context.path("maxMealKcal").asInt()).isEqualTo(650);
        assertThat(result.notice()).contains("넘을 수");
    }
    @Test void rejectsHiddenAllergensEvenWhenTheModelOmitsAllergenLabels() {
        body = RECIPE.replace("닭가슴살", "마요네즈");
        assertStatus(422, input(600, List.of("달걀"), ""));
    }
    @Test void excludesNamedIngredientsAndPreviouslyShownMenus() {
        assertStatus(422, input(600, List.of(), "닭가슴살"));
        assertStatus(422, new RecommendationRequest(1650, 600, new RecommendationRequest.Preferences(List.of(), "", 30), List.of("닭고기 밥")));
    }
    @Test void rejectsInvalidNutritionAndBudgetViolations() {
        for (String candidate : List.of(RECIPE.replace("\"kcal\":500", "\"kcal\":900"), RECIPE.replace("\"proteinG\":35", "\"proteinG\":-1"), RECIPE.replace("\"fatG\":16", "\"fatG\":90"), RECIPE.replace("\"minutes\":20", "\"minutes\":60"))) {
            body = candidate;
            assertStatus(502, input(600, List.of(), ""));
        }
    }
    @Test void emptyCandidatesNeverBypassPreferences() {
        body = "{\"recipes\":[]}";
        assertStatus(422, input(600, List.of(), ""));
    }
    private void assertStatus(int expected, RecommendationRequest request) {
        var error = catchThrowableOfType(() -> recommender.recommend(request), ResponseStatusException.class);
        assertThat(error.getStatusCode().value()).isEqualTo(expected);
    }
}
