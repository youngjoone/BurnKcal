package com.burnkcal.recommendation;

import com.burnkcal.ai.GeminiClient;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
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
@ConditionalOnProperty(name="burnkcal.analysis-mode", havingValue="gemini")
public class GeminiRecipeRecommender {
    private final GeminiClient client;
    private final ObjectMapper mapper;
    private final String prompt;
    private final JsonNode schema;
    // A conservative text check supplements the model's declared allergens. It cannot identify all labels or cross-contact.
    private static final Map<String, List<String>> ALLERGEN_WORDS = Map.of(
        "달걀", List.of("달걀", "계란", "마요네즈", "egg"), "우유", List.of("우유", "치즈", "버터", "요거트", "요구르트", "크림", "milk", "cheese"),
        "대두", List.of("대두", "두부", "콩", "간장", "된장", "고추장", "soy", "tofu"), "밀", List.of("밀가루", "빵", "국수", "라면", "소면", "우동", "파스타", "간장", "고추장", "wheat"),
        "생선", List.of("생선", "참치", "연어", "고등어", "멸치", "가다랑어", "액젓", "fish"), "갑각류", List.of("새우", "꽃게", "게살", "대게", "랍스터", "shrimp", "crab"),
        "조개류", List.of("조개", "바지락", "홍합", "전복", "굴", "가리비", "clam"), "땅콩", List.of("땅콩", "peanut"),
        "견과류", List.of("견과", "아몬드", "호두", "캐슈", "피스타치오", "잣", "almond", "walnut"), "참깨", List.of("참깨", "깨", "참기름", "sesame"));

    @Autowired
    public GeminiRecipeRecommender(@Value("${burnkcal.gemini.api-key}") String key, @Value("${burnkcal.gemini.model}") String model, ObjectMapper mapper) {
        this(new GeminiClient(key, model, mapper), mapper);
    }
    GeminiRecipeRecommender(GeminiClient client, ObjectMapper mapper) {
        this.client = client; this.mapper = mapper;
        try {
            prompt = new ClassPathResource("gemini/recipe-prompt.txt").getContentAsString(StandardCharsets.UTF_8);
            schema = mapper.readTree(new ClassPathResource("gemini/recipe-schema.json").getContentAsString(StandardCharsets.UTF_8));
        } catch (IOException e) { throw new IllegalStateException("추천 설정 파일을 읽을 수 없습니다.", e); }
    }
    public RecommendationResult recommend(RecommendationRequest input) {
        input.validated();
        var context = Map.of("dailyTargetKcal", input.dailyTargetKcal(), "remainingKcal", input.remainingKcal(),
                "minMealKcal", 400, "maxMealKcal", input.maxMealKcal(), "preferences", input.preferences(), "avoidNames", input.avoidNames());
        JsonNode output = client.generate(prompt, schema, List.of(Map.of("text", mapper.writeValueAsString(context))), 0.7, 8192);
        try {
            JsonNode candidates = output.path("recipes");
            if (!candidates.isArray() || candidates.size() > 3) throw invalid();
            var recipes = new ArrayList<RecommendationResult.Recipe>();
            var names = new HashSet<String>();
            for (JsonNode recipe : candidates) {
                String name = string(recipe, "name", 100);
                int minutes = integer(recipe, "minutes", 1, input.preferences().maxMinutes());
                var allergens = strings(recipe.path("allergens"), 0, 10, 20);
                if (allergens.stream().anyMatch(a -> !RecommendationRequest.ALLERGENS.contains(a))) throw invalid();
                var steps = strings(recipe.path("steps"), 1, 8, 500);
                JsonNode rawIngredients = recipe.path("ingredients");
                if (!rawIngredients.isArray() || rawIngredients.isEmpty() || rawIngredients.size() > 20) throw invalid();
                var ingredients = new ArrayList<RecommendationResult.Ingredient>();
                for (JsonNode item : rawIngredients) ingredients.add(new RecommendationResult.Ingredient(string(item, "name", 100), string(item, "amount", 100)));
                JsonNode n = recipe.path("nutrition");
                int kcal = integer(n, "kcal", 400, input.maxMealKcal());
                double protein = number(n, "proteinG", 150), carbs = number(n, "carbsG", 200), fat = number(n, "fatG", 100);
                if (Math.abs(protein * 4 + carbs * 4 + fat * 9 - kcal) > Math.max(80, kcal * 0.2)) throw invalid();
                String text = normalize(name + ingredients + steps);
                boolean excluded = allergens.stream().anyMatch(input.preferences().allergens()::contains)
                    || input.preferences().allergens().stream().anyMatch(a -> ALLERGEN_WORDS.get(a).stream().anyMatch(w -> text.contains(normalize(w))))
                    || java.util.Arrays.stream(input.preferences().excludedIngredients().split("[,，\\n]"))
                        .map(GeminiRecipeRecommender::normalize).filter(w -> !w.isEmpty()).anyMatch(text::contains);
                if (excluded || !names.add(normalize(name)) || input.avoidNames().stream().map(GeminiRecipeRecommender::normalize).anyMatch(normalize(name)::equals)) continue;
                recipes.add(new RecommendationResult.Recipe(UUID.randomUUID().toString(), "ai", name, minutes, allergens,
                    ingredients, steps, new RecommendationResult.Nutrition(kcal, protein, carbs, fat)));
            }
            if (recipes.isEmpty()) throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, "제외 재료와 조건에 맞는 메뉴를 찾지 못했어요. 조건을 확인하거나 다시 추천받아 주세요.");
            return new RecommendationResult("ai", List.copyOf(recipes), input.remainingKcal() < 400
                ? "남은 칼로리에 억지로 맞춰 끼니를 줄이지 않아요. 잔여량을 넘을 수 있는 일반적인 한 끼를 추천했어요."
                : "프로필의 하루 목표·남은 칼로리·제외 재료·조리 시간을 반영해 새로 추천했어요.");
        } catch (ResponseStatusException e) { throw e; } catch (RuntimeException e) { throw invalid(); }
    }
    private static String normalize(String value) { return value.replaceAll("\\s+", "").toLowerCase(Locale.ROOT); }
    private String string(JsonNode node, String key, int max) {
        var n = node.path(key); if (!n.isTextual() || n.asText().isBlank() || n.asText().length() > max) throw invalid(); return n.asText().trim();
    }
    private List<String> strings(JsonNode node, int min, int max, int length) {
        if (!node.isArray() || node.size() < min || node.size() > max) throw invalid();
        var result = new ArrayList<String>();
        for (var n : node) { if (!n.isTextual() || n.asText().isBlank() || n.asText().length() > length) throw invalid(); result.add(n.asText().trim()); }
        return List.copyOf(result);
    }
    private int integer(JsonNode node, String key, int min, int max) {
        var n = node.path(key); if (!n.isIntegralNumber() || !n.canConvertToInt() || n.asInt() < min || n.asInt() > max) throw invalid(); return n.asInt();
    }
    private double number(JsonNode node, String key, double max) {
        var n = node.path(key); if (!n.isNumber() || !Double.isFinite(n.asDouble()) || n.asDouble() < 0 || n.asDouble() > max) throw invalid(); return n.asDouble();
    }
    private ResponseStatusException invalid() { return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "추천 결과의 열량·영양정보·조리 조건을 확인하지 못했어요. 다시 추천받아 주세요."); }
}
