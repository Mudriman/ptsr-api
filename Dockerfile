# Используем официальный образ Node.js
FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости (включая devDependencies для Prisma)
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

# Применяем миграции (если нужно)
# RUN npx prisma migrate deploy

# Открываем порт, на котором работает приложение
EXPOSE 3000

# Команда для запуска приложения в production
CMD ["npm", "start"]