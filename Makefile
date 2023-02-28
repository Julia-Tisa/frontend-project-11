install: # установка зависимостей
	npm ci
lint: # запуск линтера
	npx eslint
serve: # запуск веб-сервера
	npm run serve