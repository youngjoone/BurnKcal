# BurnKcal mobile

React Native + Expo SDK 57 + TypeScript. Node.js 22.13 이상이 필요합니다.

```sh
npm ci
cp .env.example .env
npm start
```

서버는 별도 터미널에서 `cd ../backend && ./mvnw spring-boot:run`으로 실행합니다.

| 실행 환경 | 명령 | API 주소 |
| --- | --- | --- |
| Mac 브라우저 | `npm run web` | `http://localhost:8080` |
| iOS Simulator | `npm run ios` | `http://localhost:8080` |
| 실제 아이폰 Expo Go | `npm start` 후 QR 스캔 | `http://<Mac의 내부 IP>:8080` |
| Android 에뮬레이터 | `npm run android` | `http://10.0.2.2:8080` |

주소는 `.env`의 `EXPO_PUBLIC_API_URL`에 설정합니다. 변경 후 Expo를 재시작합니다.
`EXPO_PUBLIC_*` 값은 앱에 포함되므로 비밀 값을 넣으면 안 됩니다.
웹은 화면 미리보기용이며 실제 iOS 카메라·권한 테스트를 대체하지 않습니다.
자세한 Xcode 설치·아이폰 연결은 [로컬 개발 안내](../docs/LOCAL_DEVELOPMENT.md)를 참고하세요.

## 기능

- 첫 실행 프로필 등록·목표 확인 후 저장, 재실행 시 오늘 화면, 설정에서 정보 변경
- 오늘 목표·섭취·잔여 칼로리와 다음 한 끼 레시피 추천
- 촬영/앨범 → JPEG 변환 → Gemini 음식별 분석 → 음식·양 보정 → 확정 저장
- 월별 달력과 날짜별 식사·합계, 과거 날짜 사진/직접 입력 기록
- 식사 수정·삭제·복구, iPhone SQLite 영구 기록, 웹 localStorage 대체
- 제외 재료·조리 시간 설정과 레시피 6종의 재료·조리 순서
- 로딩·중복 요청 방지·실패 후 재시도, 데모와 실제 AI 구분

화면 이동은 `App.tsx`의 상태 머신으로 관리합니다. 계산은 `src/domain/`, 저장·통신·사진 처리는 `src/services/`에 둡니다. [기능별 책임](../docs/ARCHITECTURE.md)과 [저장 규칙](../docs/STORAGE.md)을 참고하세요.

회원가입·백업·기기 간 동기화는 아직 없습니다. 사진 원본은 기록에 보관하지 않습니다. 앱 삭제 또는 브라우저 저장소 삭제 시 데이터가 사라질 수 있습니다. 사진 분석에는 서버가 필요하지만 직접 기록·기존 기록 조회는 기기 저장소를 사용합니다.

## 검증

```sh
npm run typecheck
npm test
npm run format:check
npx expo export --platform ios --platform web
```
