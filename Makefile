.PHONY: install dev db api web check check-python check-frontend test

install: ## Asenna kaikki riippuvuudet
	uv sync --all-packages
	cd frontend && npm install

db: ## Käynnistä PostgreSQL taustalle
	docker compose up -d db

api: ## Käynnistä backend (http://localhost:8000, dokumentaatio /docs)
	uv run uvicorn api.main:app --reload

web: ## Käynnistä frontend (http://localhost:5173)
	cd frontend && npm run dev

dev: db ## Käynnistä tietokanta, backend ja frontend
	$(MAKE) -j2 api web

check: check-python check-frontend ## Aja samat tarkistukset kuin CI

check-python:
	uv run ruff check .
	uv run ruff format --check .
	uv run mypy
	uv run lint-imports
	uv run pytest

check-frontend:
	cd frontend && npm run lint && npm run format:check && npm run typecheck && npm test && npm run build

test: ## Aja vain testit
	uv run pytest
	cd frontend && npm test
