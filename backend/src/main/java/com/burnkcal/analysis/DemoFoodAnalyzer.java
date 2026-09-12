package com.burnkcal.analysis;

import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "burnkcal.analysis-mode", havingValue = "demo")
public class DemoFoodAnalyzer implements FoodAnalyzer {
    @Override
    public AnalysisResult analyze(byte[] image, String note) {
        var items = List.of(
                new AnalysisResult.FoodItem("밥", "1공기 (예시)", 300),
                new AnalysisResult.FoodItem("닭고기", "1인분 (예시)", 250),
                new AnalysisResult.FoodItem("반찬", "소량 (예시)", 100));
        int totalKcal = items.stream().mapToInt(AnalysisResult.FoodItem::kcal).sum();
        return new AnalysisResult(
                "demo", "샘플 식사", totalKcal,
                new AnalysisResult.CalorieRange(500, 800),
                items,
                List.of("AI 연결 전 데모입니다. 사진과 설명에 관계없이 같은 예시 결과를 반환합니다.",
                        "표시된 칼로리와 범위는 화면 확인용이며 실제 음식의 영양 정보가 아닙니다."));
    }
}
