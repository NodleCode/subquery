FROM onfinality/subql-node:latest

ARG CHAIN_ID 
ARG ENDPOINT

COPY ./ /app

RUN sed -i "s~chainId: \".*\"~chainId: \"$CHAIN_ID\"~g" "/app/project.yaml" && \
    sed -i "s~endpoint: \".*\"~endpoint: \"$ENDPOINT\"~g" "/app/project.yaml" && \
    apk add --no-cache python3 py3-pip make g++ && \
    rm -rf /var/cache/apk/*

RUN cd /app && yarn install && yarn codegen && yarn build

CMD ["-f=/app", "--db-schema=app", "--log-level=debug", "--disable-historical=false", "--progress=plain"]