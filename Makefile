.PHONY: up down logs migrate shell-backend shell-db worker-logs fresh

## ── Docker Compose ────────────────────────────────────────────────────────

# Start all services (build images first)
up:
	docker-compose up -d --build

# Stop all services
down:
	docker-compose down

# Tail logs from all services
logs:
	docker-compose logs -f

## ── Database ──────────────────────────────────────────────────────────────

# Run Alembic migrations
migrate:
	docker-compose exec backend alembic upgrade head

# Open a PostgreSQL shell
shell-db:
	docker-compose exec postgres psql -U postgres -d elearning

## ── Shells ────────────────────────────────────────────────────────────────

# Open a bash shell in the backend container
shell-backend:
	docker-compose exec backend bash

## ── Workers ───────────────────────────────────────────────────────────────

# Tail Celery worker logs
worker-logs:
	docker-compose logs -f celery_worker

## ── Reset ─────────────────────────────────────────────────────────────────

# Tear down everything (including volumes) and rebuild from scratch
fresh:
	docker-compose down -v
	docker-compose up -d --build
