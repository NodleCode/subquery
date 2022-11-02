#!/bin/bash
filename="/app/project.yaml"

# Check if file exists
if [ -f "$filename" ]
then
    echo "$filename found."
else
    echo "$filename not found."
    exit 1
fi

ENVS="$ENVS NETWORK_CHAIN_ID"
ENVS="$ENVS NETWORK_ENDPOINT"

VALUES="$VALUES ${NETWORK_CHAIN_ID}"
VALUES="$VALUES ${NETWORK_ENDPOINT}"

# Replace the values in the file
for i in $(seq 1 $(echo "$ENVS" | wc -w)); do
    index=$((i+1))
    env=$(echo "$ENVS" | cut -d ' ' -f $index)
    value=$(echo "$VALUES" | cut -d ' ' -f $index)
    if [ $value ]
    then
        echo "Replacing $env with $value"
        sed -i "s~$env~$value~g" $filename
    else
        echo "Value for $env is empty"
    fi
done

./usr/local/lib/node_modules/@subql/node/bin/run
