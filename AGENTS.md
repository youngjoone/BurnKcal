# BurnKcal 작업 안내

## 먼저 읽을 문서

- [README.md](README.md): 현재 기능과 실행 시작점
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): 기능별 책임, 수정 위치, 의존 방향
- [docs/API.md](docs/API.md): 앱과 서버의 요청·응답 규약
- [docs/TESTING.md](docs/TESTING.md): 검증 기준과 수동 확인 항목
- [docs/ROADMAP.md](docs/ROADMAP.md): 구현된 범위와 다음 작업
- 하위 디렉터리 작업 시 해당 `AGENTS.md`도 읽습니다.

## 공통 규칙

1. 기능의 책임 경계를 먼저 확인하고 해당 모듈에서 수정합니다.
2. 실제 AI 연결 전에는 `mode: demo`와 화면의 예시 안내를 유지합니다. 데모를 실제 분석처럼 표시하지 않습니다.
3. API 변경 시 Java 응답 모델, TypeScript 타입·검증기, 계약 테스트, `docs/API.md`를 함께 갱신합니다.
4. 서버만 AI 키를 소유합니다. 사진 원본·키·실제 사용자 입력을 저장소나 로그에 남기지 않습니다.
5. 구현한 기능과 계획을 문서에서 구분합니다. 검증하지 못한 기기나 환경은 그대로 적습니다.
6. 변경에 맞는 테스트를 실행하고 실패 원인을 해결합니다. 공통 검증 진입점은 `./scripts/check.sh`입니다.
7. 기능 또는 설정 단위로 커밋합니다. 사용자의 다른 변경을 되돌리거나 덮어쓰지 않습니다.

## 역할별 진입점

| 역할 | 책임 | 시작 위치 |
| --- | --- | --- |
| 앱 흐름 | 화면 전환·로딩·오류·중복 요청 방지 | `mobile/App.tsx` |
| 화면 | 사진·분석 데이터 표시, 사용자 입력 | `mobile/src/screens/` |
| 사진 | 권한·선택·취소·JPEG 변환·리사이즈 | `mobile/src/services/photos.ts` |
| 통신 | 서버 주소·multipart·시간 제한·응답 검증 | `mobile/src/services/api.ts` |
| API | 업로드 검증·HTTP 상태·분석 서비스 연결 | `backend/.../analysis/AnalysisController.java` |
| 분석 | 데모 또는 실제 AI로 도메인 결과 생성 | `backend/.../analysis/FoodAnalyzer.java` |
| 품질·운영 | 검증 스크립트·CI·실행 안내 | `scripts/`, `.github/workflows/`, `docs/` |

상세 경로는 아키텍처 문서를 사용합니다. 이 표는 코드 책임을 뜻하며 자동으로 별도 에이전트를 실행하라는 지시가 아닙니다.
