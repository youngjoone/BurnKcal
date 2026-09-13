import { Pressable, Text, View } from "react-native";
import { Preferences, recommendMeals } from "../domain/recommendations";
import { Recipe, recipeKcal } from "../data/recipes";
import { Button } from "./Button";
import { styles } from "../theme";
type Props = {
  remaining: number;
  preferences: Preferences;
  onRecipe: (recipe: Recipe) => void;
  onPreferences: () => void;
};
export function MealRecommendations({
  remaining,
  preferences,
  onRecipe,
  onPreferences,
}: Props) {
  const result = recommendMeals(remaining, preferences);
  return (
    <View style={styles.stack}>
      <Text style={styles.label}>다음 한 끼 추천</Text>
      <Text style={styles.small}>{result.notice}</Text>
      {result.recipes.map((recipe) => (
        <Pressable
          key={recipe.id}
          accessibilityRole="button"
          accessibilityLabel={`${recipe.name} 레시피 보기`}
          onPress={() => onRecipe(recipe)}
          style={[styles.card, styles.row]}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.label}>{recipe.name}</Text>
            <Text style={styles.small}>약 {recipe.minutes}분 · 1인분</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Text style={styles.label}>{recipeKcal(recipe)} kcal</Text>
            <Text style={styles.small}>레시피 보기 →</Text>
          </View>
        </Pressable>
      ))}
      <Button
        title="제외 재료·조리 시간 설정"
        secondary
        onPress={onPreferences}
      />
      <Text style={styles.small}>
        미리 작성한 레시피 6종에서 고르는 추천이에요. 칼로리는 재료별 대략적인
        합계이며 AI가 새로 생성한 레시피가 아니에요.
      </Text>
    </View>
  );
}
