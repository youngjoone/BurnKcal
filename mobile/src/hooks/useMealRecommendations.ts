import { useEffect, useRef, useState } from "react";
import { recommendRecipes } from "../services/api";
import {
  RecommendationRequest,
  RecommendationResult,
} from "../types/recommendation";
type State = {
  key: string | null;
  nonce: number;
  loading: boolean;
  result: RecommendationResult | null;
  error: string | null;
  at: number;
};
export function useMealRecommendations(
  input: Omit<RecommendationRequest, "avoidNames"> | null,
  enabled: boolean,
  day: string,
) {
  const key = input ? JSON.stringify({ day, input }) : null;
  const [nonce, setNonce] = useState(0);
  const cache = useRef<State | null>(null);
  const inFlight = useRef<{
    key: string;
    nonce: number;
    task: Promise<RecommendationResult>;
  } | null>(null);
  const [state, setState] = useState<State>({
    key: null,
    nonce: 0,
    loading: false,
    result: null,
    error: null,
    at: 0,
  });
  useEffect(() => {
    if (!enabled || !key) return;
    const existing = cache.current;
    if (
      existing?.key === key &&
      existing.nonce === nonce &&
      Date.now() - existing.at < 30 * 60_000
    ) {
      setState(existing);
      return;
    }
    let active = true;
    const base: State = {
      key,
      nonce,
      loading: true,
      result: null,
      error: null,
      at: Date.now(),
    };
    setState(base);
    const request: RecommendationRequest = {
      ...JSON.parse(key).input,
      avoidNames:
        existing?.result?.recipes.map((recipe) => recipe.name).slice(0, 3) ??
        [],
    };
    const task =
      inFlight.current?.key === key && inFlight.current.nonce === nonce
        ? inFlight.current.task
        : recommendRecipes(request);
    inFlight.current = { key, nonce, task };
    void task
      .then((result) => {
        const completed = { ...base, loading: false, result, at: Date.now() };
        if (inFlight.current?.task === task) cache.current = completed;
        if (active) setState(completed);
      })
      .catch((error: unknown) => {
        const completed = {
          ...base,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "추천을 불러오지 못했어요.",
          at: Date.now(),
        };
        if (inFlight.current?.task === task) cache.current = completed;
        if (active) setState(completed);
      })
      .finally(() => {
        if (inFlight.current?.task === task) inFlight.current = null;
      });
    // Never display a late response for an old calorie budget or allergy setting.
    return () => {
      active = false;
    };
  }, [key, enabled, nonce]);
  const visible =
    state.key === key && state.nonce === nonce
      ? state
      : { loading: enabled && !!key, result: null, error: null };
  return { ...visible, refresh: () => setNonce((value) => value + 1) };
}
