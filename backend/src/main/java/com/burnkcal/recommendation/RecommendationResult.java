package com.burnkcal.recommendation;
import java.util.List;
public record RecommendationResult(String mode, List<Recipe> recipes, String notice) {
    public record Recipe(String id, String source, String name, int minutes, List<String> allergens,
            List<Ingredient> ingredients, List<String> steps, Nutrition nutrition) {}
    public record Ingredient(String name, String amount) {}
    public record Nutrition(int kcal, double proteinG, double carbsG, double fatG) {}
}
