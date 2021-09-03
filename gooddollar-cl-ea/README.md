# Chainlink External Adapters (JavaScript)

This repository contains the source for Chainlink external adapters. Each adapter must document its own required parameters and output format.

## Requirements

- NPM & Yarn

## Install

```bash
npm install 
```

Installs packages for all workspaces.

## Setup

```bash
yarn setup
```

Runs the setup step for all adapters. Typically this step just compiles TypeScript, but may involve other tasks.

## Start to test gooddollar-identity-adapter

```bash
cd gooddollar-identity-adapter
yarn start
```

#### Output

```bash
yarn run v1.22.5
$ yarn server:dist
$ node -e 'require("./dist/index.js").server()'
{"message":"Listening on port 8080!","level":"info","instanceId":"9146faed-71b0-4541-bea0-68c59624226e","timestamp":"2021-08-27T21:47:41.813Z"}
``` 
## Testing the adapter

Open a new terminal an execute the follow

```bash
curl -X POST -H "content-type:application/json" "localhost:8080" --data '{ "id": 0, "data": { "endpoint" : "getstatehashipfscid" } }'
```

#### Example output
```bash
{"jobRunID":"1","result":"0x5ecbd9f70251b9f1153465efeb6c87579c1adde725861021fb5d94eb641532d60000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002e516d6263584d45356237484e6637466657425a70714835414a6a527148716a4443477231366a4257613835427976000000000000000000000000000000000000","statusCode":200,"data":{"result":"0x5ecbd9f70251b9f1153465efeb6c87579c1adde725861021fb5d94eb641532d60000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002e516d6263584d45356237484e6637466657425a70714835414a6a527148716a4443477231366a4257613835427976000000000000000000000000000000000000"}}
```

## Docker

To build a Docker container:

```bash
make docker adapter=gooddollar-identity
```

The naming convention for Docker containers will be `$adapter-adapter`.

Then run it with:

```bash
docker run -p 8080:8080 -e API_KEY='YOUR_API_KEY' -it gooddollar-identity-adapter:latest
```
