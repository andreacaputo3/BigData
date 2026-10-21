FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install -g truffle
RUN npm install

COPY . .

EXPOSE 8545

CMD ["sh", "-c", "wait-for-it ganache:8545 --timeout=120 -- echo 'Ganache è pronto!' && truffle migrate --network development"]
