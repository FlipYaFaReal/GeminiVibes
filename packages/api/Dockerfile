FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/api/ packages/api/
RUN npm install --workspace=packages/api
WORKDIR /app/packages/api
RUN npx tsc
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/index.js"]
