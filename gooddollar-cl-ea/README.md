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
curl -X POST -H "content-type:application/json" "localhost:8080" --data '{ "id": 0, "data": { "endpoint" : "statehash" } }'
```

#### Example output
```bash
{"jobRunID":"1","result":"488574600417955006e4f574919ce5034f0f428d3649456de3e3dfa8f93f6403","statusCode":200,"data":{"result":"488574600417955006e4f574919ce5034f0f428d3649456de3e3dfa8f93f6403"}}
```
## Docker

To build a Docker container for a specific `$adapter`, use the following example:

```bash
make docker adapter=bravenewcoin
```

The naming convention for Docker containers will be `$adapter-adapter`.

Then run it with:

```bash
docker run -p 8080:8080 -e API_KEY='YOUR_API_KEY' -it bravenewcoin-adapter:latest
```

## Serverless

Create the zip:

```bash
make zip adapter=bravenewcoin
```

The zip will be created as `./$adapter/dist/$adapter-adapter.zip`.

### Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 12.x for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `$adapter-adapter.zip` file
- Handler:
  - index.handler (same as index.awsHandlerREST) for REST API Gateways (AWS Lambda default)
  - index.awsHandlerREST for REST API Gateways
  - index.awsHandlerHTTP for HTTP API Gateways
- Add the environment variable (repeat for all environment variables):
  - Key: API_KEY
  - Value: Your_API_key
- Save

By default, Lambda functions time out after 3 seconds. You may want to change that to 60s in case an API takes longer than expected to respond.

#### To Set Up an API Gateway (HTTP API)

If using a HTTP API Gateway, Lambda's built-in Test will fail, but you will be able to externally call the function successfully.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose HTTP API
- Select the security for the API
- Click Add

#### To Set Up an API Gateway (REST API)

If using a REST API Gateway, you will need to disable the Lambda proxy integration for Lambda-based adapter to function.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose REST API
- Select the security for the API
- Click Add
- Click the API Gateway trigger
- Click the name of the trigger (this is a link, a new window opens)
- Click Integration Request
- Uncheck Use Lamba Proxy integration
- Click OK on the two dialogs
- Click the Mapping Templates dropdown
- Check "When there are no templates defined (recommended)"
- Add new Content-Type `application/json`
- Use Mapping Template: 
```
#set($input.path("$").queryStringParameters = $input.params().querystring)
$input.json('$')
```
- Click Save
- Return to your function
- Remove the API Gateway and Save
- Click Add Trigger and use the same API Gateway
- Select the deployment stage and security
- Click Add

### Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Select Node.js 12 for the Runtime
- Click Browse and select the `$adapter-adapter.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpHandler
- Click More, Add variable (repeat for all environment variables)
  - NAME: API_KEY
  - VALUE: Your_API_key

### Multiple API Key Support
In order to use multiple API keys for an adapter, simply comma delimit the keys where you define the environment variable. This will work for an arbitrary number of keys.

```
API_KEY=myapikey1,myapikey2,myapikey3
```
The external adapter will then randomly rotate the keys. Over time  this should balance out the number of requests between each of the API keys.
