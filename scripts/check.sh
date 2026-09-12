#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$project_root/backend"
./mvnw -B test

cd "$project_root/mobile"
npm run typecheck
npm test
npm run format:check
npx expo export --platform ios --platform web
