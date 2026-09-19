import { NutritionFacts } from "../components/NutritionFacts";
import { Text, View } from "react-native";
import { Recipe, recipeKcal, recipeNutrition } from "../data/recipes";
import { Button } from "../components/Button";
import { styles } from "../theme";
export function RecipeScreen({
  recipe,
  onBack,
}: {
  recipe: Recipe;
  onBack: () => void;
}) {
  return (
    <>
      <Text style={styles.tag}>
        {recipe.source === "ai" ? "AI가 추천한 한 끼" : "기본 레시피"}
      </Text>
      <Text style={styles.title}>{recipe.name}</Text>
      <View style={styles.card}>
        <Text style={styles.title}>{recipeKcal(recipe)} kcal</Text>
        <Text style={styles.small}>1인분 추정 · 약 {recipe.minutes}분</Text>
        <NutritionFacts nutrition={recipeNutrition(recipe)} />
      </View>
      <Text style={styles.label}>준비할 재료</Text>
      {recipe.ingredients.map((ingredient) => (
        <View key={ingredient.name} style={styles.row}>
          <Text style={[styles.label, { flex: 1 }]}>{ingredient.name}</Text>
          <Text style={styles.small}>{ingredient.amount}</Text>
        </View>
      ))}
      <View style={styles.divider} />
      <Text style={styles.label}>만드는 방법</Text>
      {recipe.steps.map((step, index) => (
        <View key={step} style={styles.row}>
          <Text style={styles.tag}>{String(index + 1).padStart(2, "0")}</Text>
          <Text style={[styles.subtitle, { flex: 1 }]}>{step}</Text>
        </View>
      ))}
      <Text style={styles.small}>
        등록된 주요 알레르기 재료: {recipe.allergens.join(", ") || "없음"}.
        가공품과 조미료의 실제 성분표·교차 접촉 여부는 별도로 확인해 주세요.
      </Text>
      <Text style={styles.small}>
        {recipe.source === "ai"
          ? "Gemini가 제안한 레시피와 영양 추정값이에요. 검증된 영양 DB 값과 다를 수 있어요."
          : "열량과 영양정보는 USDA SR Legacy 자료를 재료량에 맞춰 합산한 값이에요."}{" "}
        제품·조리법에 따라 달라질 수 있으며, 레시피를 보는 것만으로 식사 기록에
        저장되지는 않아요.
      </Text>
      <Button title="오늘 화면으로" secondary onPress={onBack} />
    </>
  );
}
