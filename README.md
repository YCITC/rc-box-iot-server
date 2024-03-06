[![Deployment](https://github.com/YCITC/rc-box-iot-server/actions/workflows/deploy.yml/badge.svg)](https://github.com/YCITC/rc-box-iot-server/actions/workflows/deploy.yml)

## yarn setup
```bash
$ corepack enable
$ corepack prepare yarn@stable --activate 
$ yarn set version 3.6.4
```

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development 
$ yarn start:dev

# production
$ yarn start

# production base on dist folder
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## First time setup
Clone this project and install nodejs package
```bash
$ yarn install
```
or
```bash
$ npm install
```
### Check database 
TypeORM automatically creates a repository for your entity, but it cannot create `database` .
So in your test DB, you have to create a table `rc-box`.

### Use jwtService
We want the "validate" function in "jwt.strategy.ts" to return an object with "id", "username" and "type" keys.

When we use "jwtService.sign(payload, signOptions)", the "payload" object will be passed into the "validate" function in "jwt.strategy.ts". The object that is returned by "validate" will be used to populate the "user" field in the request object for the controller.


## Github Actions (workflows)
We useing three workflow
1. create-create-cache.yml  
  When main branch pushed 'yarn.lock', this workflow will be triggered. 
2. unit-test.yml  
  When a new pull request is created on the feature/* branch, it will trigger testing for the branch.
3. deploy.yml
  When a new tag is pushed to the release/* branch, it will trigger the build process for this project.

## Notice for throw Expression
* ~~In the controller
  using ```Promise.reject(new Expression())```~~
* In the service 
  using ```throw new Expression()```


## Unit Test
Test single file  

```bash
$ yarn test [filename.spec.ts]
```

Coverage test single file
```bash
$ yarn test:cov [filename.spec.ts] --collectCoverageFrom="**/[filename.spec.ts]"
```
