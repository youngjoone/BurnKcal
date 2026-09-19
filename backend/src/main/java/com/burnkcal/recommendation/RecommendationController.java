package com.burnkcal.recommendation;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
@RestController
public class RecommendationController {
    private final ObjectProvider<GeminiRecipeRecommender> recommender;
    public RecommendationController(ObjectProvider<GeminiRecipeRecommender> recommender) { this.recommender = recommender; }
    @PostMapping(value="/api/recommendations", consumes=MediaType.APPLICATION_JSON_VALUE)
    public RecommendationResult recommend(@RequestBody RecommendationRequest request) {
        request.validated();
        var service = recommender.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "실시간 추천에는 Gemini 모드가 필요해요. 기본 레시피를 확인해 주세요.");
        return service.recommend(request);
    }
}
