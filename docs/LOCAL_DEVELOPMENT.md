# 처음 시작하는 로컬 앱 개발

## 준비물

- Node.js 22.13 이상, Java 17 이상
- 실제 아이폰 테스트: App Store의 Expo Go, Mac과 같은 Wi-Fi
- Mac의 가상 아이폰 테스트: Xcode와 iOS Simulator 런타임

코드는 이 저장소의 편한 에디터에서 작성합니다. Xcode는 시뮬레이터·네이티브 빌드에 사용합니다.
지금 앱은 Expo Go에서 실행하므로 Xcode 프로젝트를 직접 열 필요가 없습니다.

## 1. Java 서버 실행

저장소 루트에서 터미널 하나를 엽니다.

```sh
cd backend
./mvnw spring-boot:run
```

브라우저에서 `http://localhost:8080/api/health`를 열면 `status: ok`가 나옵니다.
서버를 사용하는 동안 이 터미널을 실행 상태로 둡니다.

## 2. 앱 준비

다른 터미널에서 저장소 루트부터 시작합니다.

```sh
cd mobile
npm ci
cp .env.example .env
```

Mac 웹과 iOS Simulator는 기본 `http://localhost:8080`을 사용합니다.

## 3-A. Mac에서 아이폰 화면 띄우기

1. [공식 App Store](https://apps.apple.com/kr/app/xcode/id497799835)에서 Xcode를 설치합니다.
2. Xcode를 처음 열어 라이선스를 확인·동의하고 초기 구성 요소 설치를 마칩니다.
3. Xcode → Settings → Components에서 iOS Simulator 런타임을 설치합니다. 버전에 따라 Platforms로 표시될 수 있습니다.
4. Xcode → Settings → Locations → Command Line Tools에서 설치된 Xcode를 선택합니다.
5. `mobile/` 터미널에서 실행합니다.

```sh
npm run ios
```

또는 `npm start` 후 `i`를 누릅니다. `Shift+i`로 시뮬레이터 기기를 선택합니다.
필요하면 Mac 터미널에서 다음 명령으로 설치 상태를 확인합니다.

```sh
xcode-select -p
xcrun simctl list devices available
```

Command Line Tools 경로만 선택된 경우, 시스템 설정을 바꾸지 않고 해당 터미널에서만 Xcode를 지정할 수도 있습니다.

```sh
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer npm run ios
```

시뮬레이터가 켜지면 앨범 사진을 선택해 화면 흐름을 확인합니다. Mac의 JPEG/PNG 파일을 Simulator에 드래그해 사진 앱에 넣을 수 있습니다.
실제 카메라는 시뮬레이터에 없으므로 아이폰에서 별도 확인합니다.
코드를 저장하면 Expo의 Fast Refresh가 화면에 반영합니다.
[Expo iOS Simulator 안내](https://docs.expo.dev/workflow/ios-simulator/)

## 3-B. 실제 아이폰에서 실행

1. Mac과 아이폰을 같은 Wi-Fi에 연결합니다. 게스트 Wi-Fi는 기기 간 연결이 차단될 수 있습니다.
2. Mac 시스템 설정 → Wi-Fi → 연결된 네트워크 세부사항에서 IP 주소를 확인합니다.
3. `mobile/.env`에서 주소를 바꿉니다.

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080
```

위 주소는 예시입니다. 반드시 실제 Mac 내부 IP로 바꿉니다.

4. `npm start`를 실행하고 아이폰 카메라로 QR 코드를 스캔해 Expo Go에서 엽니다.
5. 로컬 네트워크 접근을 허용하고 앱 하단의 ‘연결 확인’을 누릅니다.
6. 연결 성공 후 촬영 또는 앨범 선택 → 예시 분석 결과 보기로 이동합니다.

아이폰의 `localhost`는 Mac이 아닌 아이폰 자신입니다. 같은 내부망 연결은 공유기 포트 포워딩이 필요하지 않습니다.
Mac 방화벽이 연결을 막으면 Java·Node의 수신 연결만 허용합니다.
아이폰 Safari에서 `http://<Mac-IP>:8080/api/health`가 열리는지 확인하면 서버 연결을 분리해 점검할 수 있습니다.
`expo start --tunnel`은 Expo 개발 서버만 터널링합니다. Java 서버 주소를 외부에 연결해 주지는 않습니다.

## 3-C. Xcode 설치 중 웹으로 미리 보기

```sh
npm run web
```

`http://localhost:8081`에서 홈·사진 확인·결과 흐름을 볼 수 있습니다.
웹 ‘앨범에서 선택’은 Mac 파일 선택창을 엽니다. 모바일 Safari 등 웹 카메라 사용은 브라우저·HTTPS 조건의 영향을 받습니다.
웹 테스트는 네이티브 iOS 검증과 별도입니다.

## 자주 만나는 문제

| 증상 | 확인할 것 |
| --- | --- |
| `simctl`을 찾지 못함 | Xcode 전체 설치와 Command Line Tools 선택 |
| Xcode license 오류 | Xcode 첫 실행에서 약관과 초기 설정 완료 |
| 실행할 iPhone 기기 없음 | Xcode의 iOS Simulator 런타임 설치 |
| 앱은 열리는데 분석 실패 | Java 서버 실행·API 주소·방화벽 확인 |
| 환경 변수 변경이 안 보임 | Expo 종료 후 재시작, 필요 시 `npm start -- --clear` |
| 브라우저 CORS 오류 | `ALLOWED_ORIGINS`에 실제 미리보기 origin 추가 |
| `npm ci` 캐시 EACCES | `npm ci --cache /tmp/burnkcal-npm-cache`로 별도 캐시 사용 |
| 8080 사용 중 | `SERVER_PORT=8082 ./mvnw spring-boot:run`, 앱 API 주소도 8082로 변경 |

앱 독립 설치와 서버 운영은 별도입니다. 서버가 Mac에 있으면 분석 시 Mac과 서버가 켜져 있어야 합니다.

### Simulator가 로컬 개발 서버에 연결되지 않을 때

Metro가 IPv6 localhost에만 바인딩되고 Expo Go는 127.0.0.1에 접근할 수 있습니다. 이 경우 기존 Metro를 종료하고 `mobile/`에서 다음처럼 실행합니다.

```sh
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer NODE_OPTIONS=--dns-result-order=ipv4first npm run ios -- --port 8082 --localhost
```

2026-09-13 iPhone 17 Pro / iOS 26.5 Simulator에서 홈과 AI 모드 안내의 네이티브 렌더링을 확인했습니다. 실제 아이폰의 카메라·권한 검증은 별도입니다.
