FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install dependencies and generate the Prisma client from the committed schema.
COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
