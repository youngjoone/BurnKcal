import { Text, View } from "react-native";
import { RecipeNutrition } from "../data/recipes";
import { colors, styles } from "../theme";
export function NutritionFacts({ nutrition }: { nutrition: RecipeNutrition }) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {[
        { label: "단백질", value: nutrition.proteinG },
        { label: "탄수화물", value: nutrition.carbsG },
        { label: "지방", value: nutrition.fatG },
      ].map(({ label, value }) => (
        <View
          key={label}
          style={{
            flex: 1,
            gap: 3,
            padding: 10,
            borderRadius: 12,
            backgroundColor: colors.background,
          }}
        >
          <Text style={[styles.small, { fontSize: 11 }]}>{label}</Text>
          <Text style={[styles.label, { fontSize: 15 }]}>
            {value.toFixed(1)} <Text style={styles.small}>g</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}
