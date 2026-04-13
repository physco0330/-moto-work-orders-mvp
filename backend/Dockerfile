FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD sh -c "npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all && npm start"
