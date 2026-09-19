import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Meal } from "../domain/journal";
import {
  StatisticsRange,
  statisticsPeriodKey,
  shiftStatisticsPeriod,
  summarizeMeals,
} from "../domain/statistics";
import { Button } from "../components/Button";
import { colors, styles } from "../theme";

type Props = {
  meals: Meal[];
  today: string;
  anchorDay: string;
  range: StatisticsRange;
  ready: boolean;
  busy: boolean;
  onRange: (range: StatisticsRange) => void;
  onPeriod: (day: string) => void;
  onDay: (day: string) => void;
  onRetry: () => void;
};
const number = (value: number) => Math.round(value).toLocaleString();

export function StatisticsScreen({
  meals,
  today,
  anchorDay,
  range,
  ready,
  busy,
  onRange,
  onPeriod,
  onDay,
  onRetry,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const stats = summarizeMeals(ready ? meals : [], range, anchorDay, today);
  const month = range === "month";
  const current =
    statisticsPeriodKey(anchorDay, range) === statisticsPeriodKey(today, range);
  const title = month
    ? `${anchorDay.slice(0, 4)}년 ${Number(anchorDay.slice(5, 7))}월`
    : `${anchorDay.slice(0, 4)}년`;
  const chartValues = stats.buckets.map((bucket) =>
    month ? bucket.totalKcal : (bucket.averageKcal ?? 0),
  );
  const maximum = Math.max(1, ...chartValues);
  const rows =
    month && !showAll
      ? stats.buckets.filter((bucket) => bucket.recordedDays > 0)
      : stats.buckets;
  return (
    <>
      <View style={styles.stack}>
        <Text style={styles.title}>식사 통계</Text>
        <Text style={styles.subtitle}>쌓인 기록으로 식사 흐름을 살펴봐요.</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          padding: 4,
          borderRadius: 16,
          backgroundColor: colors.pale,
        }}
      >
        {(
          [
            { value: "month", label: "월별" },
            { value: "year", label: "연도별" },
          ] as const
        ).map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={`${option.label} 통계`}
            accessibilityState={{
              selected: range === option.value,
              disabled: busy,
            }}
            disabled={busy}
            onPress={() => {
              setShowAll(false);
              onRange(option.value);
            }}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor:
                range === option.value ? colors.surface : "transparent",
            }}
          >
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={month ? "통계 이전 달" : "통계 이전 해"}
          disabled={busy}
          onPress={() =>
            onPeriod(shiftStatisticsPeriod(anchorDay, range, -1, today))
          }
          style={{ padding: 14 }}
        >
          <Text style={styles.label}>‹</Text>
        </Pressable>
        <Text style={styles.label}>{title}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={month ? "통계 다음 달" : "통계 다음 해"}
          disabled={busy || current}
          accessibilityState={{ disabled: busy || current }}
          onPress={() =>
            onPeriod(shiftStatisticsPeriod(anchorDay, range, 1, today))
          }
          style={{ padding: 14, opacity: current ? 0.25 : 1 }}
        >
          <Text style={styles.label}>›</Text>
        </Pressable>
      </View>
      {!current && (
        <Button
          title={month ? "이번 달로" : "올해로"}
          secondary
          disabled={busy}
          onPress={() => onPeriod(today)}
        />
      )}
      {!ready ? (
        <View style={styles.card}>
          <Text style={styles.small}>기록을 불러온 뒤 통계를 표시해요.</Text>
          <Button
            title="통계 기록 다시 불러오기"
            disabled={busy}
            onPress={onRetry}
          />
        </View>
      ) : (
        <>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                padding: 24,
              },
            ]}
          >
            <Text style={[styles.small, { color: "#C1C6CF" }]}>
              기록일 평균
            </Text>
            <Text
              style={{
                fontSize: 46,
                fontWeight: "800",
                letterSpacing: -1.5,
                color: colors.accent,
              }}
            >
              {stats.averageKcal === null ? "—" : number(stats.averageKcal)}{" "}
              <Text style={{ fontSize: 15, color: "#FFFFFF" }}>kcal / 일</Text>
            </Text>
            <View style={styles.row}>
              <View>
                <Text style={[styles.small, { color: "#C1C6CF" }]}>
                  총 기록 칼로리
                </Text>
                <Text style={[styles.label, { color: "#FFFFFF" }]}>
                  {number(stats.totalKcal)} kcal
                </Text>
              </View>
              <View>
                <Text style={[styles.small, { color: "#C1C6CF" }]}>
                  저장한 식사
                </Text>
                <Text style={[styles.label, { color: "#FFFFFF" }]}>
                  {stats.mealCount}건
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>기록한 날</Text>
              <Text style={styles.label}>
                {stats.recordedDays}일 / {stats.elapsedDays}일
              </Text>
            </View>
            <View
              style={{
                height: 6,
                backgroundColor: colors.pale,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 6,
                  width: `${stats.elapsedDays ? (stats.recordedDays / stats.elapsedDays) * 100 : 0}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
            <Text style={styles.small}>
              기간 중 오늘까지의 날짜 기준이에요. 한 끼만 기록한 날도 포함돼요.
            </Text>
          </View>
          {!stats.recordedDays ? (
            <View style={styles.card}>
              <Text style={styles.label}>이 기간에는 식사 기록이 없어요.</Text>
              <Text style={styles.small}>
                기록이 쌓이면 평균과 추이를 보여드릴게요.
              </Text>
              <Button
                title="식사 기록하러 가기"
                secondary
                disabled={busy}
                onPress={() => onDay(anchorDay)}
              />
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>
                  {month ? "날짜별 기록 칼로리" : "월별 기록일 평균"}
                </Text>
                <Text style={styles.small}>kcal</Text>
              </View>
              <Text style={styles.small}>최대 {number(maximum)} kcal</Text>
              <View
                accessible
                accessibilityRole="image"
                accessibilityLabel={`${month ? "날짜별 총합" : "월별 기록일 평균"} 막대 그래프. 정확한 값은 아래 목록에서 확인할 수 있어요.`}
              >
                <View
                  style={{
                    height: 96,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: month ? 3 : 6,
                  }}
                >
                  {stats.buckets.map((bucket, index) => (
                    <View
                      key={bucket.date}
                      style={{
                        flex: 1,
                        height: bucket.recordedDays
                          ? Math.max(3, (chartValues[index] / maximum) * 96)
                          : 2,
                        borderRadius: 3,
                        backgroundColor: bucket.recordedDays
                          ? colors.primary
                          : colors.pale,
                        opacity: bucket.future ? 0.35 : 1,
                      }}
                    />
                  ))}
                </View>
                <View style={[styles.row, { marginTop: 8 }]}>
                  <Text style={styles.small}>{month ? "1일" : "1월"}</Text>
                  <Text style={styles.small}>{month ? "15일" : "6월"}</Text>
                  <Text style={styles.small}>
                    {month ? `${stats.buckets.length}일` : "12월"}
                  </Text>
                </View>
              </View>
              <Text style={styles.small}>
                진한 막대는 기록이 있는 {month ? "날짜" : "달"}예요. 연한 선은
                기록이 없는 기간이에요.
              </Text>
            </View>
          )}
          <View style={styles.stack}>
            <Text style={styles.label}>
              {month ? "날짜별 살펴보기" : "월별 살펴보기"}
            </Text>
            <Text style={styles.small}>
              {month
                ? "날짜를 누르면 식사를 확인하고 수정할 수 있어요."
                : "월을 누르면 날짜별 통계로 이동해요."}
            </Text>
            {rows.map((bucket) => {
              const value = month ? bucket.totalKcal : bucket.averageKcal;
              const label = month
                ? `${Number(bucket.date.slice(5, 7))}월 ${Number(bucket.date.slice(8))}일`
                : `${Number(bucket.date.slice(5, 7))}월`;
              const status = bucket.future
                ? "예정"
                : bucket.recordedDays
                  ? `${number(value ?? 0)} kcal${month ? "" : " / 일"}`
                  : "기록 없음";
              return (
                <Pressable
                  key={bucket.date}
                  accessibilityRole="button"
                  accessibilityLabel={`${bucket.date} 통계, ${status}, ${bucket.mealCount}건`}
                  accessibilityState={{ disabled: busy || bucket.future }}
                  disabled={busy || bucket.future}
                  onPress={() => {
                    if (month) onDay(bucket.date);
                    else {
                      onPeriod(bucket.date);
                      onRange("month");
                      setShowAll(false);
                    }
                  }}
                  style={[
                    styles.row,
                    {
                      backgroundColor: colors.surface,
                      borderRadius: 14,
                      padding: 16,
                      minHeight: 68,
                      opacity: bucket.future ? 0.4 : 1,
                    },
                  ]}
                >
                  <Text style={styles.label}>{label}</Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.label}>{status}</Text>
                    {!!bucket.recordedDays && (
                      <Text style={styles.small}>
                        {month
                          ? `${bucket.mealCount}건`
                          : `총 ${number(bucket.totalKcal)} kcal · ${bucket.recordedDays}일 · ${bucket.mealCount}건`}{" "}
                        ›
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
            {month && (
              <Button
                title={showAll ? "기록한 날짜만 보기" : "모든 날짜 보기"}
                secondary
                disabled={busy}
                onPress={() => setShowAll(!showAll)}
              />
            )}
          </View>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              저장한 식사만 집계해요. 미기록일은 평균에서 빼며, 기록일 평균도
              실제 하루 전체 섭취량과 다를 수 있어요. 음식 분석과 직접 입력의
              추정값을 합산한 통계예요.
            </Text>
          </View>
        </>
      )}
    </>
  );
}
