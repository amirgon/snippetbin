FROM node:18-alpine

ENV NODE_ENV=production
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN apk add --no-cache bash libuuid git openssh uuidgen

WORKDIR $HOME/snippetbin
COPY ./ $HOME/snippetbin/
RUN npm install
