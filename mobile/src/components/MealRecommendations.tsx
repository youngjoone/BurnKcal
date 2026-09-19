import { RecommendationResult } from "../types/recommendation";
import { NutritionFacts } from "./NutritionFacts";
import { Pressable, Text, View } from "react-native";
import { Preferences, recommendMeals } from "../domain/recommendations";
import { Recipe, recipeKcal, recipeNutrition } from "../data/recipes";
import { Button } from "./Button";
import { styles } from "../theme";
type Props = {
  remaining: number;
  ai: {
    loading: boolean;
    result: RecommendationResult | null;
    error: string | null;
  };
  onRefresh: () => void;
  preferences: Preferences;
  onRecipe: (recipe: Recipe) => void;
  onPreferences: () => void;
};
export function MealRecommendations({
  remaining,
  ai,
  onRefresh,
  preferences,
  onRecipe,
  onPreferences,
}: Props) {
  const fallback = recommendMeals(remaining, preferences);
  const result = ai.result ?? fallback;
  return (
    <View style={styles.stack}>
      <Text style={styles.label}>다음 한 끼 추천</Text>
      <Text style={styles.small}>
        {ai.loading
          ? "현재 목표와 제외 재료에 맞는 메뉴를 찾고 있어요."
          : result.notice}
      </Text>
      <Text style={styles.small}>
        프로필에서 계산한 하루 목표·남은 칼로리·제외 재료·조리 시간을 Gemini에
        보내요. 키·체중·나이 원문은 보내지 않아요.
      </Text>
      <Button
        title={
          ai.loading
            ? "AI 메뉴 추천 중…"
            : ai.result
              ? "다른 메뉴 추천"
              : "AI 메뉴 추천받기"
        }
        disabled={ai.loading}
        loading={ai.loading}
        onPress={onRefresh}
      />
      {!!ai.error && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {ai.error} 아래는 기기에 준비된 기본 레시피예요.
          </Text>
        </View>
      )}
      {!ai.result && <Text style={styles.tag}>기본 레시피 · 대체안</Text>}
      {result.recipes.map((recipe) => (
        <Pressable
          key={recipe.id}
          accessibilityRole="button"
          accessibilityLabel={`${recipe.name} 레시피 보기`}
          onPress={() => onRecipe(recipe)}
          style={styles.card}
        >
          <View style={styles.row}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.label}>{recipe.name}</Text>
              <Text style={styles.small}>
                약 {recipe.minutes}분 · 1인분 추정
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <Text style={styles.label}>{recipeKcal(recipe)} kcal</Text>
              <Text style={styles.small}>레시피 보기 →</Text>
            </View>
          </View>
          <NutritionFacts nutrition={recipeNutrition(recipe)} />
        </Pressable>
      ))}
      <Button
        title="제외 재료·조리 시간 설정"
        secondary
        onPress={onPreferences}
      />
      <Text style={styles.small}>
        {ai.result
          ? "Gemini가 새로 제안한 레시피와 영양 추정값이에요. 재료의 실제 성분표와 알레르기 교차 접촉 여부는 직접 확인해 주세요."
          : "기본 레시피 6종의 열량·영양정보는 USDA 식품 자료와 재료량으로 계산한 추정값이에요."}
      </Text>
    </View>
  );
}
