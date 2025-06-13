FROM node:lts-slim AS builder

WORKDIR /dashboardbuilder

COPY . .

RUN npm install

RUN npm run build


FROM node:lts-slim AS dashboardapp

WORKDIR /dashboardapp

COPY --from=builder /dashboardbuilder/dist/. /dashboardapp

RUN  npm install --omit=dev

CMD [ "npm", "run", "serve-build" ]