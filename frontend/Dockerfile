FROM node:20-alpine

WORKDIR /app

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm install

COPY . .

# Change ownership of the app directory and switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

ENV WATCHPACK_POLLING=true

CMD ["npm", "start"]
