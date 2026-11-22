#!/usr/bin/env bash
# Savutesti: käynnistää tietokannan, backendin ja frontendin ja tarkistaa, että ne vastaavat.
# Edellyttää, että riippuvuudet on asennettu (make install) ja frontend on buildattu.
# Käyttö: scripts/smoke-test.sh   (tai make smoke)
set -euo pipefail

API_PORT=8000
WEB_PORT=4173
TIMEOUT_SECONDS=60
LOG_DIR="$(mktemp -d)"
PIDS=()

cleanup() {
  local status=$?
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  if [[ $status -ne 0 ]]; then
    echo "::group::Backendin loki"
    cat "$LOG_DIR/api.log" 2>/dev/null || true
    echo "::endgroup::"
    echo "::group::Frontendin loki"
    cat "$LOG_DIR/web.log" 2>/dev/null || true
    echo "::endgroup::"
    echo "::group::Tietokannan loki"
    docker compose logs db 2>/dev/null || true
    echo "::endgroup::"
  fi
  docker compose down --volumes >/dev/null 2>&1 || true
  exit "$status"
}
trap cleanup EXIT

# Odottaa, että osoite vastaa ja vastaus sisältää odotetun tekstin.
wait_for() {
  local url=$1 expected=$2 deadline=$((SECONDS + TIMEOUT_SECONDS)) body
  until body=$(curl -fsS "$url" 2>/dev/null) && [[ $body == *"$expected"* ]]; do
    if ((SECONDS >= deadline)); then
      echo "VIRHE: $url ei vastannut odotetusti ${TIMEOUT_SECONDS} sekunnissa (odotettiin: $expected)"
      return 1
    fi
    sleep 1
  done
  echo "OK: $url"
}

echo "1/3 Tietokanta"
docker compose up -d --wait db

echo "2/3 Backend"
uv run uvicorn api.main:app --port "$API_PORT" >"$LOG_DIR/api.log" 2>&1 &
PIDS+=($!)
wait_for "http://localhost:$API_PORT/health" '"status":"ok"'
wait_for "http://localhost:$API_PORT/docs" "swagger"

echo "3/3 Frontend"
(cd frontend && npx vite preview --port "$WEB_PORT" --strictPort) >"$LOG_DIR/web.log" 2>&1 &
PIDS+=($!)
wait_for "http://localhost:$WEB_PORT/" "<title>Backlog ja ADR</title>"
wait_for "http://localhost:$WEB_PORT/api/health" '"status":"ok"'

echo "Savutesti läpi: tietokanta, backend ja frontend käynnistyvät ja vastaavat."
