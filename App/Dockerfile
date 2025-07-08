FROM node:18-alpine AS base
WORKDIR /app
COPY package* .
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-alpine AS release
WORKDIR /app
COPY --from=base /app/.next/ ./.next
COPY --from=base /app/package* ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/public ./public

EXPOSE 80
CMD [ "npm", "start" ]