.PHONY: up down logs rebuild fmt lint test

up:
	cd infrastructure && docker compose up -d --build

down:
	cd infrastructure && docker compose down

logs:
	cd infrastructure && docker compose logs -f

rebuild:
	cd infrastructure && docker compose up -d --build --force-recreate

fmt:
	black backend && ruff backend --fix || true

lint:
	ruff backend || true

test:
	cd backend && pytest -q

