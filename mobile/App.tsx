import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PreviewScreen } from "./src/screens/PreviewScreen";
import { ResultScreen } from "./src/screens/ResultScreen";
import { Button } from "./src/components/Button";
import { API_URL, analyzePhoto, checkServer } from "./src/services/api";
import { pickPhoto } from "./src/services/photos";
import { AnalysisMode, AnalysisResult, MealPhoto } from "./src/types/analysis";
import { colors, styles } from "./src/theme";

type Screen =
  | { step: "home" }
  | { step: "preview"; photo: MealPhoto }
  | { step: "result"; photo: MealPhoto; result: AnalysisResult };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ step: "home" });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState("");
  const [mode, setMode] = useState<AnalysisMode | null>(null);
  const lock = useRef(false);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    checkServer()
      .then((value) => {
        if (active) setMode(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function navigate(next: Screen) {
    setScreen(next);
    setError(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "문제가 생겼어요. 다시 시도해 주세요.",
      );
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function selectPhoto(source: "camera" | "library") {
    void run(async () => {
      setPicking(true);
      try {
        const photo = await pickPhoto(source);
        if (photo) {
          setNote("");
          navigate({ step: "preview", photo });
        }
      } finally {
        setPicking(false);
      }
    });
  }

  function analyze() {
    if (screen.step !== "preview") return;
    const photo = screen.photo;
    void run(async () => {
      const currentMode = await checkServer();
      if (currentMode !== mode) {
        setMode(currentMode);
        throw new Error(
          "분석 모드가 갱신됐어요. 사진 전송 안내를 확인하고 다시 눌러 주세요.",
        );
      }
      navigate({
        step: "result",
        photo,
        result: await analyzePhoto(photo, note),
      });
    });
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.row}>
              <Text style={styles.brand}>BurnKcal</Text>
              <View
                style={{
                  backgroundColor: colors.pale,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.muted,
                  }}
                >
                  사진 분석
                </Text>
              </View>
            </View>
            {error && (
              <View
                style={styles.error}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {screen.step === "home" && (
              <HomeScreen
                mode={mode}
                busy={busy}
                picking={picking}
                onCamera={() => selectPhoto("camera")}
                onLibrary={() => selectPhoto("library")}
              />
            )}
            {screen.step === "preview" && (
              <PreviewScreen
                mode={mode}
                photo={screen.photo}
                note={note}
                onNote={setNote}
                busy={busy}
                onAnalyze={analyze}
                onBack={() => navigate({ step: "home" })}
              />
            )}
            {screen.step === "result" && (
              <ResultScreen
                photo={screen.photo}
                result={screen.result}
                onReset={() => {
                  setNote("");
                  navigate({ step: "home" });
                }}
              />
            )}
            {__DEV__ && screen.step === "home" && (
              <View
                style={[
                  styles.stack,
                  {
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: 16,
                  },
                ]}
              >
                <Text style={styles.small}>개발용 연결 설정</Text>
                <Text selectable style={styles.small}>
                  {API_URL}
                </Text>
                <Button
                  title="연결 확인"
                  secondary
                  disabled={busy}
                  loading={busy && !picking}
                  onPress={() =>
                    void run(async () => {
                      setServerStatus("");
                      setMode(await checkServer());
                      setServerStatus(
                        "서버에 연결됐어요. 사진을 선택해 보세요.",
                      );
                    })
                  }
                />
                {!!serverStatus && (
                  <Text accessibilityLiveRegion="polite" style={styles.small}>
                    {serverStatus}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
