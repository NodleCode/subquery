FROM onfinality/subql-node:latest

COPY ./ /shadow_app

RUN apk add --no-cache python3 py3-pip make g++\
    && rm -rf /var/cache/apk/*
RUN cd shadow_app\
    && yarn install\
    && yarn codegen && yarn build

RUN mkdir test
RUN cp -r shadow_app/dist shadow_app/schema.graphql /app

CMD ["-f=/app", "--db-schema=app", "--log-level=info", "--disable-historical=false", "--workers=5", "--batch-size=50"]