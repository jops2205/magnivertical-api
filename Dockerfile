FROM node:22-alpine AS base

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm

#

FROM base AS dev

RUN pnpm install --frozen-lockfile

#

FROM base AS prod

RUN pnpm install --prod --frozen-lockfile

#

FROM dev AS build

COPY . .

RUN pnpm generate
RUN pnpm build

#

FROM node:22-alpine AS run

WORKDIR /app

COPY --from=prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
