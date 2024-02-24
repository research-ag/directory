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

## Copyright

MR Research AG, 2023
## Authors

Denys Kushnarov (reginleif888) with contributions from Timo Hanke (timohanke) and Oliver Garcia (OliverSDS).
## License

Apache-2.0
