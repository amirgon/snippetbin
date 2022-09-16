FROM node:18

ENV NODE_ENV=production
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN apt-get update; apt-get install uuid-runtime

WORKDIR $HOME/snippetbin
COPY ./ $HOME/snippetbin/
RUN npm install
