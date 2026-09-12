package com.burnkcal.analysis;

import java.util.List;

public record AnalysisResult(
        String mode,
        String title,
        int totalKcal,
        CalorieRange range,
        List<FoodItem> items,
        List<String> notices) {
    public record CalorieRange(int min, int max) {}
    public record FoodItem(String name, String portion, int kcal) {}
}
