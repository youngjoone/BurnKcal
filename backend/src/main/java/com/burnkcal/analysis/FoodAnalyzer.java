package com.burnkcal.analysis;

public interface FoodAnalyzer {
    AnalysisResult analyze(byte[] image, String contentType, String note);
    AnalysisResult analyzeText(String foodName, String portion);
}
