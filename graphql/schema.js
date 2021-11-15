// Import required stuff from graphql
const { GraphQLSchema, GraphQLObjectType } = require("graphql");

// Import queries
const {
  users,
  user,
  uniswapfactorys,
  uniswapfactory,
  pairbyId,
  pairsbyId,
  pairs,
  allpairs,
  pairsbytoken0,
  pairsbytoken1,
  pairsbytoken0array,
  pairsbytoken1array,
  tokens,
  tokenbyId,
  tokenbyname,
  tokensbysymbol,
  tokensbyId,
  bundles,
  bundle,
  transactions,
  transaction,
  liquiditypositions,
  liquidityPositionsagainstuserId,
  liquiditypositionsnapshots,
  liquiditypositionsnapshot,
  mints,
  mint,
  burns,
  burn,
  swaps,
  swap,
  uniswapdaydatasbydate,
  uniswapdaydatas,
  uniswapdaydata,
  pairdaydatas,
  pairdaydata,
  pairdaydatasbypairAddress,
  pairhourdatas,
  pairhourdata,
  tokendaydatas,
  tokendaydata,
  tokendaydatasbydate
} = require("./queries");

// Import mutations
const {
  handleNewPair,
  handleTransfer,
  handleSync,
  handleMint,
  handleBurn,
  handleSwap,
} = require("./mutations");

// Define QueryType
const QueryType = new GraphQLObjectType({
  name: "QueryType",
  description: "Queries",
  fields: {
    users,
    user,
    uniswapfactorys,
    uniswapfactory,
    pairbyId,
    pairsbyId,
    pairs,
    allpairs,
    pairsbytoken0,
    pairsbytoken1,
    pairsbytoken0array,
    pairsbytoken1array,
    tokens,
    tokenbyId,
    tokenbyname,
    tokensbysymbol,
    tokensbyId,
    bundles,
    bundle,
    transactions,
    transaction,
    liquiditypositions,
    liquidityPositionsagainstuserId,
    liquiditypositionsnapshots,
    liquiditypositionsnapshot,
    mints,
    mint,
    burns,
    burn,
    swaps,
    swap,
    uniswapdaydatasbydate,
    uniswapdaydatas,
    uniswapdaydata,
    pairdaydatas,
    pairdaydatasbypairAddress,
    pairdaydata,
    pairhourdatas,
    pairhourdata,
    tokendaydatas,
    tokendaydata,
    tokendaydatasbydate
  },
});

// Define MutationType
const MutationType = new GraphQLObjectType({
  name: "MutationType",
  description: "Mutations",
  fields: {
    handleNewPair,
    handleTransfer,
    handleSync,
    handleMint,
    handleBurn,
    handleSwap,
  },
});

module.exports = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
