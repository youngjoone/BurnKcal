package com.burnkcal;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AnalysisApiTests {
    @Autowired
    MockMvc mvc;

    private MockMultipartFile photo() throws Exception {
        var bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "jpg", bytes);
        return new MockMultipartFile("image", "meal.jpg", "image/jpeg", bytes.toByteArray());
    }

    @Test
    void healthExposesDemoMode() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.analysisMode").value("demo"));
    }

    @Test
    void validPhotoReturnsExplicitDemoContract() throws Exception {
        mvc.perform(multipart("/api/analyze").file(photo()).param("note", "밥 반 공기"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mode").value("demo"))
                .andExpect(jsonPath("$.totalKcal").value(650))
                .andExpect(jsonPath("$.range.min").value(500))
                .andExpect(jsonPath("$.range.max").value(800))
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.notices").isNotEmpty());
    }

    @Test
    void missingPhotoReturnsReadableError() throws Exception {
        mvc.perform(multipart("/api/analyze"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isString());
    }

    @Test
    void emptyPhotoIsRejected() throws Exception {
        mvc.perform(multipart("/api/analyze")
                        .file(new MockMultipartFile("image", "empty.jpg", "image/jpeg", new byte[0])))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nonImageContentTypeIsRejected() throws Exception {
        mvc.perform(multipart("/api/analyze")
                        .file(new MockMultipartFile("image", "notes.txt", "text/plain", "hello".getBytes())))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    void fakeJpegIsRejected() throws Exception {
        mvc.perform(multipart("/api/analyze")
                        .file(new MockMultipartFile("image", "fake.jpg", "image/jpeg", "not a photo".getBytes())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void longNoteIsRejected() throws Exception {
        mvc.perform(multipart("/api/analyze").file(photo()).param("note", "가".repeat(301)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void localWebPreviewOriginIsAllowed() throws Exception {
        mvc.perform(options("/api/analyze").header("Origin", "http://localhost:8081")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8081"));
    }

    @Test
    void unknownWebOriginIsRejected() throws Exception {
        mvc.perform(options("/api/analyze").header("Origin", "https://example.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }
}
