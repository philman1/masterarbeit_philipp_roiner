FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

ENV VUE_APP_CLUSTER_URL="https://api.devnet.solana.com"

EXPOSE 8080

CMD [ "npm", "run", "serve:devnet" ]