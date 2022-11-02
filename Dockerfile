FROM onfinality/subql-node:latest

COPY ./ /app

RUN apk add --no-cache bash python3 py3-pip make g++\
    && rm -rf /var/cache/apk/*
RUN cd app\
    && yarn install\
    && yarn codegen && yarn build

RUN chmod +x ./app/scripts/update_project_file.sh

ENTRYPOINT ["/sbin/tini", "--", "./app/scripts/update_project_file.sh"]
