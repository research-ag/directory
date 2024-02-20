# Directory

## Local setup

It is assumed that you have:
* Dfnity SDK installed
* NodeJS installed
* yarn installed

Once you have cloned the repository, follow this process in your terminal:

1. In your project directory, run this command to install yarn dependencies:
```
yarn install
```
2. Start local Internet Computer replica:
```
dfx start --background
```
3. Deploy your canisters locally
```
dfx deploy
```

## Running tests

1. Generate the canister declarations and build the canister:
```
yarn build
```
2. Run the canister tests:
```
yarn test
```
