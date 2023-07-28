[![Deployment](https://github.com/YCITC/rc-box-iot-server/actions/workflows/deploy.yml/badge.svg)](https://github.com/YCITC/rc-box-iot-server/actions/workflows/deploy.yml)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## First time setup
Clone this project and install nodejs package
```
yarn install
```
or
```
npm install
```
### Check database 
TypeORM automatically creates a repository for your entity, but it cannot create `database` .
So in your test DB, you have to create a table `rc-box`.

### Use jwtService
We want the "validate" function in "jwt.strategy.ts" to return an object with "userId" and "username" keys.

When we use "jwtService.sign(payload, signOptions)", the "payload" object will be passed into the "validate" function in "jwt.strategy.ts". The object that is returned by "validate" will be used to populate the "user" field in the request object for the controller.


## Github Actions (workflows)
We useing three workflow
1. create-create-cache.yml  
  When main branch pushed 'yarn.lock', this workflow will be triggered. 
2. unit-test.yml  
  When feature/* branch pushed, it will test the branch.
3. deploy.yml
  When release/* branch pushed, it will build this project and deploy to server.
