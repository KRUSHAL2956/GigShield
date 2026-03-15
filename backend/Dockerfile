FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ensure app directory is owned by node user
RUN chown -R node:node /app

USER node

EXPOSE 5000

CMD ["npm", "start"]
