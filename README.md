## Description

Coverter test task.

Written for Node.js v20 with Nest.js. Sample backend application that accepts source and target currency and convert the amount using conversion rates from SWOP Rest API. In-memory cache is used to minimize request to SWOP and to cache responses. 

## Installation

```bash
$ npm install
```

## SWOP Authentication

Please provide API KEY as env variable SWOP_API_KEY.

## Running the app

There is VS Code configuration available or you can use npm scripts
```bash
# development
$ npm run start

```

## Test

```bash
# unit tests
$ npm run test

```

## API

Currently there are 2 API methods available
-  GET /api/currencies?forceUpdate=true|false - get list of supported currencies. 
Response:
[
  {
  code: string,
  name: string
  }
]

- GET /api/conversion?source=<string>&target=<string>&amount=<number> - convert our currency into another 
Response:
Formatted number if available. Example: Request /api/conversion?source=GBP&target=USD&amount=1 will provide an answer $1.07.
Only currencies from GET /api/currencies are accepted.

