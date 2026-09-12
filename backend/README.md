# BurnKcal API

Java 17 이상이 필요합니다. Maven은 포함된 Wrapper가 설치합니다.

```sh
./mvnw spring-boot:run
```

- `GET /api/health`: 실행 상태와 데모 모드 확인
- `POST /api/analyze`: multipart `image`(JPEG/PNG, 최대 5MB, 1,600만 화소), 선택 `note`(최대 300자)
- 정상 결과: `mode`, `title`, `totalKcal`, `range: { min, max }`, `items: [{ name, portion, kcal }]`, `notices`
- 잘못된 입력: 400, 지원하지 않는 MIME: 415, 업로드 용량 초과: 413. 오류 본문: `{ "message": "..." }`

```sh
curl http://localhost:8080/api/health
curl -F 'image=@/absolute/path/meal.jpg' -F 'note=밥 반 공기' http://localhost:8080/api/analyze
./mvnw test
```

## 현재 동작

`DemoFoodAnalyzer`가 모든 유효한 사진에 같은 예시 데이터를 반환합니다.
실제 음식 판별, 칼로리 추정, 설명 반영은 아직 구현하지 않았습니다.
사진은 AI나 외부 서비스에 전송하지 않고 영구 저장하지 않습니다.
멀티파트 처리는 프레임워크의 요청 임시 파일을 사용할 수 있습니다.
실제 AI 연결은 `FoodAnalyzer`의 새 구현으로 추가할 수 있습니다.

## 로컬 연결

기본 주소는 `0.0.0.0:8080`입니다. 같은 Wi-Fi의 아이폰에서 Mac의 내부 IP로 접근할 수 있습니다.
이 서버는 인증 없는 로컬 개발용입니다. 외부 공개 배포 전 인증과 호출 제한을 추가해야 합니다.
웹 미리보기 CORS는 기본적으로 `http://localhost:8081`, `http://127.0.0.1:8081`만 허용합니다.

설정은 환경 변수로 바꿉니다. Spring Boot는 `.env` 파일을 자동으로 읽지 않습니다.

```sh
SERVER_PORT=8082 ./mvnw spring-boot:run
ALLOWED_ORIGINS=http://localhost:8081,http://192.168.0.10:8081 ./mvnw spring-boot:run
```
