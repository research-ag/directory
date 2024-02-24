# Directory

A token directory for the HPL. 
The canister provides the metadata for the assets in the HPL 
that the ledger canister itself does not store.
These are:

* token symbol
* token name
* token logo

The ledger canister itself stores:

* decimals
* self-description

However, generally, the self-description can not be trusted.
The directory provides metadata which is curated by the directory's admins.

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

## Copyright

MR Research AG, 2023
## Authors

Denys Kushnarov (reginleif888) with contributions from Timo Hanke (timohanke) and Oliver Garcia (OliverSDS).
## License

Apache-2.0
