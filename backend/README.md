# BurnKcal API

Java 17 이상이 필요합니다. Maven은 포함된 Wrapper가 설치합니다.

```sh
./mvnw spring-boot:run
```

- `GET /api/health`: 실행 상태와 분석 모드(`demo` 또는 `ai`) 확인. 키 인증 검사는 실제 분석 요청에서 수행합니다.
- `POST /api/analyze`: multipart `image`(JPEG/PNG, 최대 5MB, 1,600만 화소), 선택 `note`(최대 300자)
- 정상 결과: `mode`, `title`, `totalKcal`, `range: { min, max }`, `items: [{ name, portion, kcal }]`, `notices`
- 잘못된 입력: 400, 지원하지 않는 MIME: 415, 업로드 용량 초과: 413. 오류 본문: `{ "message": "..." }`

```sh
curl http://localhost:8080/api/health
curl -F 'image=@/absolute/path/meal.jpg' -F 'note=밥 반 공기' http://localhost:8080/api/analyze
./mvnw test
```

## 현재 동작

기본값은 `DemoFoodAnalyzer`이며 모든 유효한 사진에 같은 예시 데이터를 반환합니다.
Gemini 연결은 `backend/`에서 `.env.example`을 `.env`로 복사하고
`BURNKCAL_ANALYSIS_MODE=gemini`, `GEMINI_API_KEY`, `GEMINI_MODEL`을 설정한 뒤 서버를 다시 시작합니다.
이미 `.env`가 있다면 덮어쓰지 않습니다. 키는 앱 환경 변수에 넣지 않습니다.
Gemini 모드에서는 사진과 설명을 Google로 전송해 음식별 칼로리를 추정합니다.
음식 아님·판별 불가는 422, 한도 초과는 429, 잘못된 AI 응답은 502,
인증 문제는 503, AI 시간 초과는 504를 반환합니다. 데모로 조용히 대체하지 않습니다.
서버는 사진·설명·키·AI 원문을 기록하거나 영구 저장하지 않습니다.
멀티파트 처리는 프레임워크의 요청 임시 파일을 사용할 수 있습니다.
실제 AI 연결은 `FoodAnalyzer`의 새 구현으로 추가할 수 있습니다.

## 로컬 연결

기본 주소는 `0.0.0.0:8080`입니다. 같은 Wi-Fi의 아이폰에서 Mac의 내부 IP로 접근할 수 있습니다.
이 서버는 인증 없는 로컬 개발용입니다. 외부 공개 배포 전 인증과 호출 제한을 추가해야 합니다.
웹 미리보기 CORS는 기본적으로 `http://localhost:8081`, `http://127.0.0.1:8081`만 허용합니다.

설정은 환경 변수로 바꿉니다. 이 프로젝트는 `spring.config.import`로 실행 디렉터리의
`.env`를 명시적으로 읽습니다. `KEY=value` 형식이며 `export`나 따옴표를 붙이지 않습니다.

```sh
SERVER_PORT=8082 ./mvnw spring-boot:run
ALLOWED_ORIGINS=http://localhost:8081,http://192.168.0.10:8081 ./mvnw spring-boot:run
```
