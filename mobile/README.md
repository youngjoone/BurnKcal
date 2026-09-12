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

- 촬영 또는 시스템 앨범에서 사진 한 장 선택
- 긴 변 최대 1,600px JPEG 변환 후 업로드
- 선택 설명 입력, 로딩·중복 요청 방지·실패 후 재시도
- 서버 예시 결과와 데모 안내 표시
- 개발 모드에서 서버 연결 확인

화면 이동은 `App.tsx`의 작은 상태 머신으로 관리합니다. 화면이 늘어나면 Router 도입을 검토합니다.
AI, 기록 저장, 회원가입은 아직 없으며 사진을 고르지 않고 분석할 수 없습니다.

## 검증

```sh
npm run typecheck
npm test
npm run format:check
npx expo export --platform ios --platform web
```
