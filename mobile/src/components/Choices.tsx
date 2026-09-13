import { Pressable, Text, View } from "react-native";
import { colors, styles } from "../theme";
type Props<T extends string> = {
  label: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
};
export function Choices<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: Props<T>) {
  return (
    <View style={styles.stack}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={`${label}: ${option.label}`}
            accessibilityState={{ selected: value === option.value, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 13,
              borderRadius: 12,
              borderWidth: 1,
              borderColor:
                value === option.value ? colors.primary : colors.border,
              backgroundColor:
                value === option.value ? colors.primary : colors.surface,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: value === option.value ? "#FFF" : colors.text,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
