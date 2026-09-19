package com.burnkcal.recommendation;

import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public record RecommendationRequest(int dailyTargetKcal, int remainingKcal, Preferences preferences, List<String> avoidNames) {
    public static final Set<String> ALLERGENS = Set.of("달걀", "우유", "대두", "밀", "생선", "갑각류", "조개류", "땅콩", "견과류", "참깨");
    public record Preferences(List<String> allergens, String excludedIngredients, int maxMinutes) {}
    public RecommendationRequest validated() {
        if (dailyTargetKcal < 1500 || dailyTargetKcal > 4000 || remainingKcal > dailyTargetKcal || remainingKcal < -4_000_000
                || preferences == null || preferences.allergens == null || preferences.allergens.size() > 10
                || preferences.allergens.stream().anyMatch(a -> a == null || !ALLERGENS.contains(a))
                || preferences.excludedIngredients == null || preferences.excludedIngredients.length() > 200
                || !Set.of(15, 30, 60).contains(preferences.maxMinutes)
                || avoidNames == null || avoidNames.size() > 3 || avoidNames.stream().anyMatch(n -> n == null || n.isBlank() || n.length() > 100)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "목표와 제외 재료·조리 시간 설정을 확인해 주세요.");
        }
        return this;
    }
    public int maxMealKcal() { return remainingKcal < 400 ? 650 : Math.min(remainingKcal, 700); }
}
