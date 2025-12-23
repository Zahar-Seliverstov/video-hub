# video-hub

## vidio-hosting - это штука как ютуб только на минималка (Даже админка есть)

### Установка зависимостей:
```bash
cd ./client
npm i

cd ./server
npm i
```

### Инициализация базы данных:
```bash
npm run prisma:migrate
npm run prisma:generate
```
(В server/ появится папочка generated)

### Запуск:
```bash
cd ./client
npm run dev

cd ./server
npm run dev
```

### ЕСТЬ ВОЗМОЖНОСТЬ РЕДАКТИРОВАТЬ БД ЧЕРЕЗ УДОБНЫЙ ВЕБ ИНТЕРФЕЙС 
![SoExcited~GIF](https://github.com/user-attachments/assets/785ce271-442f-471c-abff-5050a5d8523a)

```bash
cd ./server
npm run prisma:studio
```
