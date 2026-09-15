# BurnKcal

음식 사진을 분석하고, 하루 목표와 날짜별 식사 기록을 관리하는 모바일 앱입니다.

**Gemini 사진 분석을 연결했습니다.** 기본 실행은 데모이며 서버의 `.env`에서 Gemini 모드를 설정하면 실제 분석을 사용합니다.

## 지금 가능한 기능

- 첫 실행에 키·현재/목표 체중·나이·활동량 등록 → 하루 목표 확인·저장. 이후 설정에서 수정
- 오늘의 목표·섭취량·남은 칼로리, 사진 촬영·앨범 바로 접근
- Gemini로 한 사진 안의 음식별 이름·양·칼로리와 총합 분석
- 음식 이름·먹은 양·칼로리 수정, 절반/배수 조정, 누락 음식 추가·삭제 후 확정 저장
- 월별 달력에서 날짜별 기록·총합 확인. 지난 날짜에 사진 또는 직접 입력으로 식사 추가
- 식사 수정·삭제·복구, 중복 저장 방지, 앱 재실행 후 기록 유지
- 남은 칼로리·제외 재료·조리 시간에 맞춘 레시피 추천과 재료·조리 순서
- iPhone SQLite 저장, 웹 미리보기는 별도 localStorage 사용
- 사진 JPEG 정규화·크기 조절, 입력 검증, 로딩·오류·재시도

레시피는 미리 작성한 6종에서 고릅니다. AI 분석과 하루 목표는 추정값이며, 매우 적은 잔여 칼로리에 끼니를 억지로 맞추지 않습니다. 데모 분석은 실제 식사로 저장할 수 없습니다.

로그인·백업·기기 간 동기화·사진 영구 보관·탄단지 분석·서버 공개 배포는 아직 없습니다. 현재는 Mac 개발 서버와 Expo Go를 이용하는 개발용 앱입니다.

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
| [ROADMAP](docs/ROADMAP.md) | 무엇이 구현됐고 다음에 무엇을 확장하는가? |
| [PRODUCT_STRATEGY](docs/PRODUCT_STRATEGY.md) | 기존 앱과의 격차를 무엇부터 줄이고 어떻게 차별화할 것인가? |
| [STORAGE](docs/STORAGE.md) | 프로필·식사 기록은 어디에 어떻게 저장하는가? |
| [UX_REVIEW](docs/UX_REVIEW.md) | 다른 앱의 흐름을 어떻게 참고했는가? |
| [CALORIE_TARGETS](docs/CALORIE_TARGETS.md) | 목표·추천 계산 기준과 한계는 무엇인가? |
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
