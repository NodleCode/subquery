FROM onfinality/subql-node:latest

COPY ./ /app

RUN apk add --no-cache bash python3 py3-pip make g++\
    && rm -rf /var/cache/apk/*
RUN cd app\
    && yarn install\
    && yarn codegen && yarn build

RUN chmod +x ./app/scripts/update_project_file.sh

CMD ["-f=/app", "--db-schema=app", "--log-level=error", "--disable-historical=false"]

ENTRYPOINT ["./app/scripts/update_project_file.sh"]
