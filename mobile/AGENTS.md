# 모바일 작업 규칙

- Expo SDK 57의 정확한 API는 https://docs.expo.dev/versions/v57.0.0/ 에서 확인합니다.
- `App.tsx`는 화면 상태·비동기 작업을 조율합니다. 화면 컴포넌트는 props로 값과 이벤트를 받습니다.
- `screens/`에서 직접 fetch, AI API, 이미지 피커를 호출하지 않습니다. `services/`로 분리합니다.
- `services/photos.ts`는 사진 획득·정규화만, `services/api.ts`는 서버 통신만 담당합니다.
- 서버 응답을 신뢰해 바로 렌더링하지 않습니다. `types/analysis.ts`의 런타임 검증을 거칩니다.
- 데모 모드를 실제 분석처럼 표현하지 않습니다. 예시 안내는 결과 화면에도 표시합니다.
- 색상·간격·글자 스타일은 `src/theme.ts`, 재사용 UI는 `src/components/`에 둡니다.
- `EXPO_PUBLIC_*`는 공개 설정입니다. AI 키와 서버 비밀 값을 넣지 않습니다.
- 검증: `npm run typecheck`, `npm test`, `npm run format:check`, `npx expo export --platform ios --platform web`.
- 네이티브 권한이나 촬영 변경은 실제 아이폰 확인이 별도로 필요합니다. 웹 통과를 iOS 통과로 보고하지 않습니다.
