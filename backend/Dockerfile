FROM node:18 AS builder

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend/ .

COPY import_csv.js /app/import_csv.js

FROM node:18

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 5000

CMD ["sh", "-c", "node /app/import_csv.js && npm start"]
