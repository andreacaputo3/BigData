FROM node:18

RUN npm install -g truffle

WORKDIR /app

COPY ./blockchain /app/blockchain

WORKDIR /app/blockchain

RUN npm install

EXPOSE 8545

CMD ["truffle", "develop"]
