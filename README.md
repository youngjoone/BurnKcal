# BurnKcal

음식 사진을 촬영하거나 선택해 대략적인 칼로리를 확인하는 모바일 앱입니다.

**Gemini 사진 분석을 연결했습니다.** 기본 실행은 데모이며 서버의 `.env`에서 Gemini 모드를 설정하면 실제 분석을 사용합니다.

## 지금 가능한 기능

- 사진 촬영·앨범 선택 → 사진 확인·설명 입력 → 서버 업로드 → 음식별 분석 결과
- JPEG 정규화·크기 조절, 입력 검증, 로딩·오류·재시도
- 개발 서버 연결 확인
- 한 사진의 음식별 이름·추정량·칼로리 카드와 총합 표시 (데모 또는 Gemini 실제 분석)

Gemini는 음식 아님·판별 불가·인증·한도·시간 초과를 오류로 안내합니다. 로그인, 기록 DB, 사진 영구 저장, 하루 목표·레시피 추천은 아직 없습니다.

## 구성

| 위치 | 기술 | 역할 |
| --- | --- | --- |
| `mobile/` | React Native · Expo SDK 57 · TypeScript | 아이폰/Android 앱과 웹 미리보기 |
| `backend/` | Java 17 · Spring Boot 4.1.1 · Maven | 사진 수신·검증·분석 서비스 |
| `docs/` | Markdown | 기능별 책임·API 규약·실행·검증 안내 |
| `scripts/`, `.github/workflows/` | Shell · GitHub Actions | 로컬과 CI에서 같은 검증 실행 |

## 빠른 시작

Node.js 22.13 이상과 Java 17 이상이 필요합니다. 터미널 두 개를 사용합니다.

서버:

```sh
cd backend
./mvnw spring-boot:run
```

실제 AI를 사용하려면 [서버 설정](backend/README.md)에 따라 `backend/.env`를 작성합니다. 키는 서버에만 둡니다.

앱:

```sh
cd mobile
npm ci
cp .env.example .env
npm run web
```

Mac에서 [웹 미리보기](http://localhost:8081)와 [서버 상태](http://localhost:8080/api/health)를 확인합니다.

- **Mac 가상 아이폰:** Xcode와 iOS 런타임 설치 후 `mobile/`에서 `npm run ios`.
- **실제 아이폰:** `.env`의 API 주소를 Mac 내부 IP로 바꾸고 `npm start` → Expo Go로 QR 스캔.
- 코드를 저장하면 화면이 갱신됩니다. 카메라·권한은 실제 아이폰에서 확인합니다.

처음 앱을 개발한다면 [Xcode·아이폰 연결 가이드](docs/LOCAL_DEVELOPMENT.md)를 먼저 읽어 주세요.

## 문서 지도

| 문서 | 답하는 질문 |
| --- | --- |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | 기능별 역할과 수정할 파일은 어디인가? |
| [API](docs/API.md) | 앱과 서버는 어떤 데이터를 주고받는가? |
| [LOCAL_DEVELOPMENT](docs/LOCAL_DEVELOPMENT.md) | Xcode·시뮬레이터·아이폰에서 어떻게 실행하는가? |
| [TESTING](docs/TESTING.md) | 무엇을 검증하면 변경을 완료할 수 있는가? |
| [ROADMAP](docs/ROADMAP.md) | 무엇이 구현됐고 Gemini 연결은 언제 하는가? |
| [PRODUCT_STRATEGY](docs/PRODUCT_STRATEGY.md) | 기존 앱과의 격차를 무엇부터 줄이고 어떻게 차별화할 것인가? |
| [AGENTS](AGENTS.md) | 개발 에이전트는 어떤 규칙으로 작업하는가? |

## 검증

`mobile/` 의존성 설치 후 루트에서 실행합니다.

```sh
./scripts/check.sh
```

서버 테스트, 모바일 타입·계약·포맷 검사, iOS/웹 JS 번들을 검증합니다.
GitHub push와 PR에서도 같은 검증을 실행합니다. 네이티브 기기 검증은 별도로 수행합니다.

## 개발 원칙

- AI API 키는 서버에서만 보관합니다. `EXPO_PUBLIC_*`는 앱에 공개되는 값입니다.
- 비밀 값과 로컬 설정은 `.env` 또는 환경 변수로 관리하고 커밋하지 않습니다.
- 앱과 서버를 독립적으로 실행할 수 있도록 구성합니다.
- 실행 가능한 단위로 작은 커밋을 만듭니다.
