import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

type Props = {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export function Button({
  title,
  onPress,
  secondary,
  disabled,
  loading,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (disabled || loading) && s.disabled,
        pressed && s.pressed,
      ]}
    >
      {loading && (
        <ActivityIndicator color={secondary ? colors.primary : "#FFFFFF"} />
      )}
      <Text style={[s.text, secondary && s.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 17,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  secondary: { backgroundColor: colors.pale },
  text: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  secondaryText: { color: colors.primary },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
});
