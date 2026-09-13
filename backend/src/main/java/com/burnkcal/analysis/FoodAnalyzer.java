package com.burnkcal.analysis;

public interface FoodAnalyzer {
    AnalysisResult analyze(byte[] image, String contentType, String note);
}
