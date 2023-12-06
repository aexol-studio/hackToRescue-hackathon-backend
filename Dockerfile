FROM node:18 as build
USER node
WORKDIR /home/node
COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig*.json ./
RUN npm ci --cache .npm --prefer-offline
COPY --chown=node:node . ./
RUN npm run build && npm ci --cache .npm --prefer-offline --omit=dev

FROM node:18-slim
WORKDIR /home/node
COPY --from=build /home/node/node_modules /home/node/node_modules
COPY --from=build /home/node/package.json /home/node/package.json
COPY --from=build /home/node/lib /home/node/lib
COPY --from=build /home/node/stucco.json /home/node/stucco.json
COPY --from=build /home/node/schema.graphql /home/node/schema.graphql
ENV PATH="/home/node/node_modules/.bin:$PATH"
CMD ["node", "./node_modules/.bin/stucco", "local", "start"]
