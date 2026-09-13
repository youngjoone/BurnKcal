import { Text, View } from "react-native";
import { Recipe, recipeKcal } from "../data/recipes";
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
      <Text style={styles.tag}>다음 한 끼</Text>
      <Text style={styles.title}>{recipe.name}</Text>
      <View style={styles.card}>
        <Text style={styles.title}>{recipeKcal(recipe)} kcal</Text>
        <Text style={styles.small}>1인분 추정 · 약 {recipe.minutes}분</Text>
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
        칼로리는 재료의 종류·양·조리법에 따라 달라져요. 레시피를 보는 것만으로
        식사 기록에 저장되지는 않아요.
      </Text>
      <Button title="오늘 화면으로" secondary onPress={onBack} />
    </>
  );
}
