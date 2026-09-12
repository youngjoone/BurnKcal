# 백엔드 작업 규칙

- Java 17 호환 코드, Spring Boot, Maven Wrapper를 사용합니다.
- `AnalysisController`는 HTTP 입력 검증을, `FoodAnalyzer` 구현은 분석을 담당합니다.
- 새 AI 공급자는 `FoodAnalyzer` 구현으로 추가합니다. SDK·프롬프트를 컨트롤러에 넣지 않습니다.
- JPEG/PNG의 MIME뿐 아니라 실제 이미지가 읽히는지도 검증합니다.
- 오류는 적절한 HTTP 상태와 `{ "message": "..." }`로 반환합니다.
- 사진은 영구 저장하지 않습니다. 인증·호출 제한 없는 현재 서버는 로컬 개발용입니다.
- 규약을 바꾸면 `AnalysisApiTests`, 모바일 결과 검증기, `docs/API.md`를 함께 수정합니다.
- 검증: 이 디렉터리에서 `./mvnw test`. 업로드 용량 제한은 실제 HTTP 검사도 수행합니다.
