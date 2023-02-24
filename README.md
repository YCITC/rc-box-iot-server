
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

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

### User Entity
We used jwtService, user's info must have key "username".

