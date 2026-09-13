package com.burnkcal.health;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    private final String mode;

    public HealthController(@Value("${burnkcal.analysis-mode}") String mode) {
        this.mode = mode;
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "burnkcal", "analysisMode", "gemini".equals(mode) ? "ai" : "demo");
    }
}
