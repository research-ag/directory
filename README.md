# Directory

## Local setup

It is assumed that you have:
- Dfinity SDK installed
- NodeJS installed
- yarn installed

Once you have cloned the repository, follow this process in your terminal:
1. In your project directory, run this command to install yarn dependencies:
```
yarn install
```
2. Start local Internet Computer replica:
```
dfx start --clean --background
```
3. Setup and deploy canisters locally
```
yarn setup
```

## Running tests

1. Generate the canister declarations and build the canister:
```
yarn build:directory
```
2. Run the canister tests:
```
yarn test
```
