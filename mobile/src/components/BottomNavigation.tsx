import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors } from "../theme";
export type MainTab = "today" | "journal" | "statistics" | "settings";
export function BottomNavigation({
  current,
  disabled,
  onChange,
}: {
  current: MainTab;
  disabled: boolean;
  onChange: (tab: MainTab) => void;
}) {
  return (
    <View style={s.bar}>
      {(
        [
          { id: "today", label: "오늘" },
          { id: "journal", label: "기록" },
          { id: "statistics", label: "통계" },
          { id: "settings", label: "설정" },
        ] as const
      ).map((tab) => (
        <Pressable
          key={tab.id}
          accessibilityRole="tab"
          accessibilityLabel={tab.label}
          accessibilityState={{ selected: current === tab.id, disabled }}
          disabled={disabled}
          onPress={() => onChange(tab.id)}
          style={({ pressed }) => [s.tab, pressed && { opacity: 0.6 }]}
        >
          <View
            style={[
              s.indicator,
              current === tab.id && { backgroundColor: colors.primary },
            ]}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: current === tab.id ? "700" : "500",
              color: current === tab.id ? colors.text : colors.muted,
            }}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
});
