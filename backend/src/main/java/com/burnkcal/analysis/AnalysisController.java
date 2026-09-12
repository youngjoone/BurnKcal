package com.burnkcal.analysis;

import java.io.IOException;
import java.util.Set;
import javax.imageio.ImageIO;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AnalysisController {
    private final FoodAnalyzer analyzer;

    public AnalysisController(FoodAnalyzer analyzer) {
        this.analyzer = analyzer;
    }

    @PostMapping(value = "/api/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AnalysisResult analyze(
            @RequestPart("image") MultipartFile image,
            @RequestParam(defaultValue = "") String note) throws IOException {
        if (image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "사진을 선택해 주세요.");
        }
        if (!Set.of("image/jpeg", "image/png").contains(
                image.getContentType() == null ? "" : image.getContentType())) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "JPEG 또는 PNG 사진을 보내 주세요.");
        }
        if (note.length() > 300) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "음식 설명은 300자 이내로 입력해 주세요.");
        }
        validateImage(image);
        return analyzer.analyze(image.getBytes(), note.trim());
    }

    private void validateImage(MultipartFile image) throws IOException {
        try (var input = ImageIO.createImageInputStream(image.getInputStream())) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw invalidImage();
            }
            var reader = readers.next();
            try {
                reader.setInput(input);
                String format = reader.getFormatName();
                boolean matches = (format.equalsIgnoreCase("JPEG") && "image/jpeg".equals(image.getContentType()))
                        || (format.equalsIgnoreCase("PNG") && "image/png".equals(image.getContentType()));
                long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                if (!matches || pixels <= 0 || pixels > 16_000_000 || reader.read(0) == null) {
                    throw invalidImage();
                }
            } catch (IOException | IllegalArgumentException exception) {
                throw invalidImage();
            } finally {
                reader.dispose();
            }
        }
    }

    private ResponseStatusException invalidImage() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "사진을 읽을 수 없어요. 1,600만 화소 이하의 JPEG 또는 PNG를 선택해 주세요.");
    }
}
