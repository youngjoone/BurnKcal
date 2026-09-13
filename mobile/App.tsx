import { SettingsScreen } from "./src/screens/SettingsScreen";
import { Preferences } from "./src/domain/recommendations";
import { Recipe } from "./src/data/recipes";
import { loadPreferences, savePreferences } from "./src/services/preferences";
import { PreferencesScreen } from "./src/screens/PreferencesScreen";
import { RecipeScreen } from "./src/screens/RecipeScreen";
import { Profile } from "./src/domain/profile";
import { loadProfile, saveProfile } from "./src/services/profile";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { TodayScreen } from "./src/screens/TodayScreen";
import { Meal, localDate } from "./src/domain/journal";
import { newId } from "./src/domain/food";
import { loadMeals, saveMeal, updateMeal } from "./src/services/journal";
import { JournalScreen } from "./src/screens/JournalScreen";
import { FoodEditor } from "./src/components/FoodEditor";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
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
  | { step: "preferences" }
  | { step: "recipe"; recipe: Recipe }
  | { step: "today" }
  | { step: "loading" }
  | { step: "onboarding" }
  | { step: "settings" }
  | { step: "profile" }
  | { step: "journal" }
  | { step: "editMeal"; meal: Meal }
  | { step: "preview"; photo: MealPhoto }
  | { step: "result"; photo: MealPhoto; result: AnalysisResult; id: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ step: "loading" });
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [day, setDay] = useState(localDate());
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

  useEffect(() => {
    let active = true;
    loadPreferences()
      .then((value) => {
        if (active) setPreferences(value);
      })
      .catch(() => {
        if (active)
          setError(
            "추천 설정을 읽지 못했어요. 제외 식재료를 확인할 때까지 추천을 표시하지 않아요.",
          );
      });
    loadProfile()
      .then((value) => {
        if (active) {
          setProfile(value);
          setProfileReady(true);
          setScreen({ step: value ? "today" : "onboarding" });
        }
      })
      .catch(() => {
        if (active)
          setError(
            "내 정보를 읽지 못했어요. 내 정보 화면에서 다시 시도해 주세요.",
          );
      });
    loadMeals()
      .then((value) => {
        if (active) {
          setMeals(value);
          setStorageReady(true);
        }
      })
      .catch(() => {
        if (active)
          setError(
            "기록을 읽지 못했어요. 앱을 다시 열거나 기록 화면에서 다시 시도해 주세요.",
          );
      });
    const tick = () => setDay(localDate());
    const timer = setInterval(tick, 30_000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });
    return () => {
      active = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  async function refreshMeals() {
    setMeals(await loadMeals());
    setStorageReady(true);
  }

  function navigate(next: Screen) {
    setScreen(next);
    setError(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  async function run(action: () => Promise<void>) {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "문제가 생겼어요. 다시 시도해 주세요.",
      );
      scroll.current?.scrollTo({ y: 0, animated: true });
      return false;
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
        id: newId(),
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
                  식단 관리
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
            {["today", "journal", "settings"].includes(screen.step) && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(
                  [
                    { step: "today", title: "오늘" },
                    { step: "journal", title: "기록" },
                    { step: "settings", title: "설정" },
                  ] as const
                ).map((tab) => (
                  <View key={tab.step} style={{ flex: 1 }}>
                    <Button
                      title={tab.title}
                      secondary={screen.step !== tab.step}
                      disabled={busy}
                      onPress={() => navigate({ step: tab.step })}
                    />
                  </View>
                ))}
              </View>
            )}
            {screen.step === "home" && (
              <Button
                title="오늘 화면으로"
                secondary
                disabled={busy}
                onPress={() => navigate({ step: "today" })}
              />
            )}
            {screen.step === "today" && (
              <TodayScreen
                meals={meals}
                profile={profile}
                day={day}
                ready={storageReady && profileReady}
                preferences={preferences}
                onRecipe={(recipe) => navigate({ step: "recipe", recipe })}
                onPreferences={() => navigate({ step: "preferences" })}
                onScan={() => navigate({ step: "home" })}
                onProfile={() => navigate({ step: "profile" })}
                onJournal={() => navigate({ step: "journal" })}
              />
            )}
            {screen.step === "recipe" && (
              <RecipeScreen
                recipe={screen.recipe}
                onBack={() => navigate({ step: "today" })}
              />
            )}
            {screen.step === "preferences" &&
              (preferences ? (
                <PreferencesScreen
                  preferences={preferences}
                  busy={busy}
                  onSave={(value) =>
                    void run(async () => {
                      await savePreferences(value);
                      setPreferences(value);
                      navigate({ step: "today" });
                    })
                  }
                  onBack={() => navigate({ step: "today" })}
                />
              ) : (
                <Button
                  title="추천 설정 다시 불러오기"
                  disabled={busy}
                  onPress={() =>
                    void run(async () =>
                      setPreferences(await loadPreferences()),
                    )
                  }
                />
              ))}
            {screen.step === "loading" && (
              <View style={styles.stack}>
                <Text style={styles.title}>식사 기록을 준비하고 있어요.</Text>
                <Button
                  title="다시 불러오기"
                  disabled={busy}
                  onPress={() =>
                    void run(async () => {
                      const value = await loadProfile();
                      setProfile(value);
                      setProfileReady(true);
                      await refreshMeals();
                      setPreferences(await loadPreferences());
                      navigate({ step: value ? "today" : "onboarding" });
                    })
                  }
                />
              </View>
            )}
            {screen.step === "settings" && (
              <SettingsScreen
                profile={profile}
                preferences={preferences}
                onProfile={() => navigate({ step: "profile" })}
                onPreferences={() => navigate({ step: "preferences" })}
              />
            )}
            {(screen.step === "profile" || screen.step === "onboarding") &&
              (profileReady ? (
                <ProfileScreen
                  key={screen.step}
                  profile={profile}
                  busy={busy}
                  onboarding={screen.step === "onboarding"}
                  onScrollTop={() =>
                    scroll.current?.scrollTo({ y: 0, animated: false })
                  }
                  onCancel={
                    screen.step === "profile"
                      ? () => navigate({ step: "settings" })
                      : undefined
                  }
                  onSave={(value) =>
                    run(async () => {
                      await saveProfile(value);
                      setProfile(value);
                      navigate({
                        step:
                          screen.step === "onboarding" ? "today" : "settings",
                      });
                    })
                  }
                />
              ) : (
                <Button
                  title="내 정보 다시 불러오기"
                  disabled={busy}
                  onPress={() =>
                    void run(async () => {
                      setProfile(await loadProfile());
                      setProfileReady(true);
                    })
                  }
                />
              ))}
            {screen.step === "journal" && (
              <>
                {!storageReady && (
                  <Button
                    title="기록 다시 불러오기"
                    disabled={busy}
                    onPress={() => void run(refreshMeals)}
                  />
                )}
                <JournalScreen
                  meals={meals}
                  day={day}
                  busy={busy || !storageReady}
                  onScan={() => navigate({ step: "home" })}
                  onEdit={(meal) => navigate({ step: "editMeal", meal })}
                  onDelete={(meal) =>
                    run(async () => {
                      await updateMeal({ ...meal, deletedAt: Date.now() });
                      await refreshMeals();
                    })
                  }
                  onRestore={(meal) =>
                    run(async () => {
                      await updateMeal({ ...meal, deletedAt: null });
                      await refreshMeals();
                    })
                  }
                />
              </>
            )}
            {screen.step === "editMeal" && (
              <FoodEditor
                items={screen.meal.items}
                onCancel={() => navigate({ step: "journal" })}
                onConfirm={(items) =>
                  void run(async () => {
                    await updateMeal({ ...screen.meal, items });
                    await refreshMeals();
                    navigate({ step: "today" });
                  })
                }
              />
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
                key={screen.id}
                result={screen.result}
                busy={busy}
                onScrollTop={() =>
                  scroll.current?.scrollTo({ y: 0, animated: false })
                }
                onSave={(items) =>
                  void run(async () => {
                    if (!storageReady)
                      throw new Error(
                        "기록을 먼저 불러와 주세요. 식사 기록 화면에서 다시 시도할 수 있어요.",
                      );
                    if (screen.result.mode !== "ai")
                      throw new Error(
                        "데모 결과는 실제 식사 기록에 저장할 수 없어요.",
                      );
                    await saveMeal({
                      id: screen.id,
                      title: screen.result.title,
                      createdAt: Date.now(),
                      localDate: localDate(),
                      items,
                      deletedAt: null,
                    });
                    await refreshMeals();
                    navigate({ step: "today" });
                  })
                }
                onReset={() => {
                  setNote("");
                  navigate({ step: "home" });
                }}
              />
            )}
            {__DEV__ && screen.step === "settings" && (
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
