.PHONY: help setup setup-backend setup-frontend dev start test test-backend test-frontend build lint clean docker-up docker-down

# Variables
ROOT_DIR := $(shell pwd)
BACKEND_DIR := $(ROOT_DIR)/laundry-app/backend
FRONTEND_DIR := $(ROOT_DIR)/laundry-app/frontend
VENV_DIR := $(BACKEND_DIR)/venv
PYTHON := $(VENV_DIR)/bin/python3
PIP := $(VENV_DIR)/bin/pip
PYTEST := $(VENV_DIR)/bin/pytest

.DEFAULT_GOAL := help

help: ## Muestra este mensaje de ayuda con todos los comandos disponibles
	@echo "========================================================"
	@echo "              Laundry Management App - Makefile"
	@echo "========================================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

setup: setup-backend setup-frontend ## Configura el entorno completo (backend venv + dependencias y frontend npm)
	@if [ ! -f .env ] && [ -f .env.example ]; then \
		cp .env.example .env; \
		echo "✓ Archivo .env creado a partir de .env.example"; \
	fi
	@echo "✓ Setup completado exitosamente."

setup-backend: ## Crea el entorno virtual de Python e instala dependencias del backend
	@echo "Configurando backend..."
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Creando entorno virtual Python en $(VENV_DIR)..."; \
		python3 -m venv $(VENV_DIR); \
	fi
	@echo "Instalando dependencias de Python..."
	@$(PIP) install --upgrade pip
	@$(PIP) install -r $(BACKEND_DIR)/requirements.txt -r $(BACKEND_DIR)/requirements-test.txt
	@echo "✓ Backend configurado correctamente."

setup-frontend: ## Instala dependencias de Node.js en el frontend
	@echo "Configurando frontend..."
	@cd $(FRONTEND_DIR) && npm install
	@echo "✓ Frontend configurado correctamente."

dev: start ## Alias de start (inicia backend y frontend simultáneamente)

start: ## Inicia tanto el backend como el frontend en modo desarrollo
	@./start.sh

test: test-backend test-frontend ## Ejecuta la suite de pruebas del backend y frontend

test-backend: ## Ejecuta las pruebas unitarias del backend con pytest
	@echo "Ejecutando pruebas de backend..."
	@if [ -f "$(PYTEST)" ]; then \
		cd $(BACKEND_DIR) && PYTHONPATH=. $(PYTEST) tests/ --cov=app --cov-report=term-missing; \
	else \
		cd $(BACKEND_DIR) && PYTHONPATH=. pytest tests/ --cov=app --cov-report=term-missing; \
	fi

test-frontend: ## Ejecuta las pruebas del frontend con Vitest
	@echo "Ejecutando pruebas de frontend..."
	@cd $(FRONTEND_DIR) && npm run test -- --run

lint: ## Ejecuta linters en frontend y backend
	@echo "Analizando código del frontend..."
	@cd $(FRONTEND_DIR) && npm run lint

build: ## Compila el frontend para producción
	@echo "Compilando frontend..."
	@cd $(FRONTEND_DIR) && npm run build

docker-up: ## Levanta los servicios con docker-compose
	@docker-compose up --build

docker-down: ## Detiene los servicios de docker-compose
	@docker-compose down

clean: ## Limpia archivos temporales, logs y caches de compilación
	@echo "Limpiando logs y archivos temporales..."
	@rm -f backend.log frontend.log $(BACKEND_DIR)/laundry-app/backend.log $(BACKEND_DIR)/laundry-app/frontend.log
	@rm -rf $(FRONTEND_DIR)/.next $(BACKEND_DIR)/.pytest_cache $(BACKEND_DIR)/.coverage
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@echo "✓ Limpieza completada."
