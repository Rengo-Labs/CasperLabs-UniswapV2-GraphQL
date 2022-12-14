# Casper_Uniswap_V2 GraphQL

Casper Uniswap is a decentralized protocol for automated token exchange on Casper.

This graphql dynamically tracks any pair created by the casper uniswap factory. It tracks of the current state of casper Uniswap contracts, and contains derived stats for things like historical data and USD prices.

- aggregated data across pairs and tokens,
- data on individual pairs and tokens,
- data on transactions
- data on liquidity providers
- historical data on Uniswap, pairs or tokens, aggregated by day

## Running Locally

npm install to install the require packages
npm start to start the server

## Queries

Below are a few ways to show how to query the casper-uniswap-graphql for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://thegraph.com/docs/graphql-api). These queries can be used locally or in The Graph Explorer playground.

## Key Entity Overviews

#### Casper UniswapFactory

Contains data across all of Casper Uniswap V2. This entity tracks important things like total liquidity (in CSPR and USD, see below), all time volume, transaction count, number of pairs and more.

#### Token

Contains data on a specific token. This token specific data is aggregated across all pairs, and is updated whenever there is a transaction involving that token.

#### Pair

Contains data on a specific pair.

#### Transaction

Every transaction on Uniswap is stored. Each transaction contains an array of mints, burns, and swaps that occured within it.

#### Mint, Burn, Swap

These contain specifc information about a transaction. Things like which pair triggered the transaction, amounts, sender, recipient, and more. Each is linked to a parent Transaction entity.

## Example Queries

### Querying Aggregated Casper Uniswap Data

This query fetches aggredated data from all Casper uniswap pairs and tokens, to give a view into how much activity is happening within the whole protocol.

```graphql
{
  uniswapFactories(first: 1) {
    pairCount
    totalVolumeUSD
    totalLiquidityUSD
  }
}
```

## Deployment of Contracts

#### Generate the keys

Paste this command on the ubuntu terminal, that will create a keys folder for you containing public key , public key hex and secret key.

```
casper-client keygen keys

```
#### Paste the keys

Paste the keys folder created by the above command to Scripts/ERC20, Scripts/FACTORY, Scripts/PAIR and Scripts/ROUTER folders.

#### Fund the key

We can fund the keys from casper live website faucet page on testnet.


Use the script file in package.json to perform the deployments
```
"scripts": {
    "deploy:erc20": "ts-node Scripts/ERC20/deploy/erc20Contract.ts",
    "deploy:erc20Functions": "ts-node Scripts/ERC20/deploy/erc20ContractFunctions.ts",
    "deploy:factory": "ts-node Scripts/FACTORY/deploy/factoryContract.ts",
    "deploy:factoryFunctions": "ts-node Scripts/FACTORY/deploy/factoryContractFunctions.ts",
    "deploy:pair": "ts-node Scripts/PAIR/deploy/pairContract.ts",
    "deploy:pairFunctions": "ts-node Scripts/PAIR/deploy/pairContractFunctions.ts",
    "deploy:router": "ts-node Scripts/ROUTER/deploy/routerContract.ts",
    "deploy:routerFunctions": "ts-node Scripts/ROUTER/deploy/routerContractFunctions.ts"
  },
```

Use the following commands to perform deployments
```
npm run deploy:erc20
npm run deploy:erc20Functions

npm run deploy:factory
npm run deploy:factoryFunctions

npm run deploy:pair
npm run deploy:pairFunctions

npm run deploy:router
npm run deploy:routerFunctions

```

* CONFIGURE .env BEFORE and during DEPLOYMENT
