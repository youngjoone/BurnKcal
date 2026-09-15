# UX 비교와 적용

2026-09-13 공식 도움말에 공개된 흐름을 비교했습니다. 유료 앱 전체를 설치·조작한 사용성 평가나 경쟁 앱보다 우수하다는 실험 결과는 아닙니다.

| 비교 기준 | 참고한 서비스의 흐름 | BurnKcal에 적용한 변경 |
| --- | --- | --- |
| 시작 정보와 변경 위치 | MyFitnessPal은 시작 체중을 받고 Goals에서 변경 | 첫 실행 신체/목표 → 생활 정보 → 목표 확인. 저장 후 재실행은 Today. 이후 Settings에서 변경 |
| 사진에서 기록까지 | Cronometer는 촬영/앨범 → 항목 검토·양 보정 → Add To Diary | Today에서 카메라·앨범 바로 접근, 분석 후 수정·확정 저장. 촬영 소개 화면을 거칠 필요 없음 |
| 실수 복구 | Cronometer는 기록을 탭해 수정·삭제 | 기록 수정, 절반·배수 보정, 삭제와 되돌리기, 변경 후 합계·추천 재계산 |
| 개인 조건과 추천 | Lifesum은 목표·알레르기·식품 취향에 따라 추천을 달리함 | Settings에 신체 목표와 제외 재료·조리 시간 모음, 조건이 안 맞으면 대안 없음 안내 |
| 자주 하는 행동 | 기록/진행 확인 화면 중심으로 반복 접근 | Today·기록·Settings 하단 고정, 촬영 한 번 접근, 결과 안내는 필요한 만큼 펼치기 |

## 사용자 흐름

- 첫 실행: 신체 정보·목표 → 활동량·자동 계산 대상 확인 → 목표 검토·저장 → Today.
- 다시 실행: 저장 정보 확인 → Today (입력 재요구 없음).
- 식사: Today 촬영/앨범 → 사진과 선택 설명 → AI 분석 → 음식·섭취량 확인/수정 → 저장 → 남은 칼로리·추천 갱신.
- 날짜별 기록: 하단 기록 → 달력 날짜 선택 → 사진 또는 직접 기록 → 선택 날짜에 저장. 오늘로 돌아가기 제공.
- 설정: 하단 Settings → 정보 수정 또는 제외 재료/시간 → 저장 후 적용.
- AI 실패·저장 실패: 입력 유지, 오류와 재시도. 실패한 분석은 식사로 합산하지 않음.

## 출처

- [MyFitnessPal 시작 체중](https://support.myfitnesspal.com/hc/en-us/articles/360032273972-Starting-Weight-FAQs)
- [MyFitnessPal 목표 수정](https://support.myfitnesspal.com/hc/en-us/articles/360032274432-Customize-your-nutritional-goals)
- [Cronometer 사진 기록](https://support.cronometer.com/hc/en-us/articles/39013533811092-Mobile-Photo-Logging)
- [Cronometer 기록 수정](https://support.cronometer.com/hc/en-us/articles/360019003171-Mobile-Edit-Diary-Entries)
- [Lifesum 프로필·식사 취향](https://help.lifesum.com/en/article/how-can-i-edit-my-profile-health-goal-android-1w7ma9o/)
- [Lifesum 추천 조건](https://help.lifesum.com/en/article/i-cannot-see-the-advertised-meal-plans-what-can-i-do-1i6u4oq/)

## 이후 검증

실사용자에게 처음 목표 설정과 한 끼 기록을 맡겨 완료 시간, 길을 잃는 지점, 취소·오입력 빈도를 관찰해야 합니다. 현재 레시피는 6종뿐이고 백업·계정 동기화, 영양 DB·탄단지, 기록 검색은 아직 없습니다. 달력과 과거 날짜 기록은 구현했습니다.
