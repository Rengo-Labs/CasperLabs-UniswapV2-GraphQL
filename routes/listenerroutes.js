require("dotenv").config();
var express = require("express");
var router = express.Router();
var { request } = require("graphql-request");
var pairModel = require("../models/pair");
var hashesofpairsModel = require("../models/hashesofpairs");
var eventsModel = require("../models/events");
var pairagainstuser = require("../models/pairagainstuser");
var paircontract = require("../JsClients/PAIR/pairFunctionsForBackend/functions");
var allcontractsDataModel = require("../models/allcontractsData");
var RemoveReservesDataModel = require("../models/removeReservesData");

function splitdata(data) {
  var temp = data.split("(");
  var result = temp[1].split(")");
  return result[0];
}

router
  .route("/getContractHashAgainstPackageHash")
  .post(async function (req, res, next) {
    try {
      if (!req.body.packageHash) {
        return res.status(400).json({
          success: false,
          message: "There is no packageHash specified in the req body.",
        });
      }

      let packageHash = req.body.packageHash.toLowerCase();
      let contractHash = await allcontractsDataModel.findOne({
        packageHash: packageHash,
      });

      return res.status(200).json({
        success: true,
        message: "Contract Hash has been Succefully found.",
        Data: contractHash,
      });
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
});


router.route("/geteventsdata").post(async function (req, res, next) {
  try {
    if (!req.body.deployHash) {
      return res.status(400).json({
        success: false,
        message: "There is no deployHash specified in the req body.",
      });
    }
    if (!req.body.timestamp) {
      return res.status(400).json({
        success: false,
        message: "There is no timestamp specified in the req body.",
      });
    }
    if (!req.body.block_hash) {
      return res.status(400).json({
        success: false,
        message: "There is no blockHash specified in the req body.",
      });
    }
    if (!req.body.eventname) {
      return res.status(400).json({
        success: false,
        message: "There is no eventname specified in the req body.",
      });
    }
    if (!req.body.eventdata) {
      return res.status(400).json({
        success: false,
        message: "There is no eventdata specified in the req body.",
      });
    }

    let newData = req.body.eventdata;
    let deployHash = req.body.deployHash;
    let timestamp = req.body.timestamp;
    let block_hash = req.body.block_hash;
    let eventName = req.body.eventname;
    console.log("... Deployhash: ", deployHash);
    console.log("... Timestamp: ", timestamp);
    console.log("... Block hash: ", block_hash);
    console.log("Event Data: ", newData);

    if (eventName == "pair_created") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);

      var allpairslength = parseInt(newData[0][1].data);
      var pair = splitdata(newData[3][1].data);
      var token0 = splitdata(newData[4][1].data);
      var token1 = splitdata(newData[5][1].data);

      console.log("allpairslength: ", allpairslength);
      console.log("pair splited: ", pair);
      console.log("token0 splited: ", token0);
      console.log("token1 splited: ", token1);

      request(
        process.env.GRAPHQL,
        `mutation handleNewPair( $token0: String!, $token1: String!, $pair: String!, $all_pairs_length: Int!,$deployHash: String!,$timeStamp: String!, $blockHash: String!){
      		handleNewPair( token0: $token0, token1: $token1, pair: $pair, all_pairs_length: $all_pairs_length, deployHash:$deployHash,timeStamp: $timeStamp, blockHash: $blockHash) {
      		result
      		}
                      
      		}`,
        {
          token0: token0,
          token1: token1,
          pair: pair,
          all_pairs_length: allpairslength,
          deployHash: deployHash,
          timeStamp: timestamp.toString(),
          blockHash: block_hash,
        }
      )
        .then(function (response) {
          console.log(response);
          return res.status(200).json({
            success: true,
            message: "HandleNewPair Mutation called.",
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    } else if (eventName == "approve") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);

      return res.status(200).json({
          success: true,
          message:
            "Approved Event emitted",
      });
    } else if (eventName == "erc20_transfer") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);

      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);

      var flag = 0;
      var temp = newData[3][1].data.split("(");
      console.log("temp[0]: ", temp[0]);
      if (temp[0] == "Key::Account") {
        flag = 1;
      }
      var from = splitdata(newData[2][1].data);
      var to = splitdata(newData[3][1].data);
      var value = newData[4][1].data;

      console.log("from: ", from);
      console.log("to: ", to);
      console.log("value: ", value);

      if (flag == 0) {
        var pairsresult = await hashesofpairsModel.find({});
        if (pairsresult == null) {
          console.log(
            "there are no contract and package hash found in the database."
          );
          return res.status(400).json({
            success: false,
            message:
              "there are no contract and package hash found in the database.",
          });
        }
        var packageHash = null;
        for (var i = 0; i < pairsresult.length; i++) {
          if (pairsresult[i].packageHash.toLowerCase() == to.toLowerCase()) {
            packageHash = pairsresult[i].packageHash.toLowerCase();
            console.log("packageHash: ", packageHash);
          }
        }

        if (packageHash == null) {
          console.log("packagehash did not find at this package hash.");
          return res.status(400).json({
            success: false,
            message: "packageHash did not find at this package hash.",
          });
        } else {
          var pairData = await pairModel.findOne({ id: packageHash });

          if (pairData == null) {
            var newevent = new eventsModel({
              deployHash: deployHash,
              timestamp: timestamp,
              block_hash: block_hash,
              pairContractHash: packageHash,
              eventName: eventName,
              eventsdata: newData,
            });
            await eventsModel.create(newevent);

            console.log(
              "pair did not created against this pair package hash, event has been saved to database."
            );
            return res.status(200).json({
              success: true,
              message:
                "pair did not created against this pair package hash, event has been saved to database.",
            });
          } else {
            request(
              process.env.GRAPHQL,
              `mutation handleTransfer( $from: String!, $to: String!, $value: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
						handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
						result
						}
									
						}`,
              {
                from: from,
                to: to,
                value: value,
                pairAddress: packageHash,
                deployHash: deployHash,
                timeStamp: timestamp.toString(),
                blockHash: block_hash,
              }
            )
              .then(function (response) {
                console.log(response);
                return res.status(200).json({
                  success: true,
                  message: "handleTransfer Mutation called.",
                });
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        }
      } else {
        return res.status(200).json({
          success: true,
          message: "handleTransfer Mutation did not called.",
        });
      }
    } else if (eventName == "transfer") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);

      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);

      var from = splitdata(newData[2][1].data);
      var to = splitdata(newData[4][1].data);
      var value = newData[5][1].data;
      var pair = splitdata(newData[3][1].data);

      console.log("from: ", from);
      console.log("to: ", to);
      console.log("value: ", value);
      console.log("pair: ", pair);

      var pairData = await pairModel.findOne({ id: pair });
      if (pairData == null) {
        var newevent = new eventsModel({
          deployHash: deployHash,
          timestamp: timestamp,
          block_hash: block_hash,
          eventName: eventName,
          eventsdata: newData,
        });
        await eventsModel.create(newevent);

        console.log(
          "pair did not created against this pair package hash, event has been saved to database."
        );
        return res.status(200).json({
          success: true,
          message:
            "pair did not created against this pair package hash, event has been saved to database.",
        });
      } else {
        request(
          process.env.GRAPHQL,
          `mutation handleTransfer( $from: String!, $to: String!, $value: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
				handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
				result
				}
						
				}`,
          {
            from: from,
            to: to,
            value: value,
            pairAddress: pair,
            deployHash: deployHash,
            timeStamp: timestamp.toString(),
            blockHash: block_hash,
          }
        )
          .then(function (response) {
            console.log(response);
            return res.status(200).json({
              success: true,
              message: "handleTransfer Mutation called.",
            });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    } else if (eventName == "mint") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);

      var amount0 = newData[0][1].data;
      var amount1 = newData[1][1].data;
      var pair = splitdata(newData[4][1].data);
      var sender = splitdata(newData[5][1].data);

      console.log("amount0: ", amount0);
      console.log("amount1: ", amount1);
      console.log("pair: ", pair);
      console.log("sender: ", sender);

      var pairData = await pairModel.findOne({ id: pair });
      if (pairData == null) {
        var newevent = new eventsModel({
          deployHash: deployHash,
          timestamp: timestamp,
          block_hash: block_hash,
          eventName: eventName,
          eventsdata: newData,
        });
        await eventsModel.create(newevent);

        console.log(
          "pair did not created against this pair package hash, event has been saved to database."
        );
        return res.status(200).json({
          success: true,
          message:
            "pair did not created against this pair package hash, event has been saved to database.",
        });
      } else {
        request(
          process.env.GRAPHQL,
          `mutation handleMint( $amount0: String!, $amount1: String!, $sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
				handleMint( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
					result
				}
							
				}`,
          {
            amount0: amount0,
            amount1: amount1,
            sender: sender,
            logIndex: 0,
            pairAddress: pair,
            deployHash: deployHash,
            timeStamp: timestamp.toString(),
            blockHash: block_hash,
          }
        )
          .then(function (response) {
            console.log(response);
            return res.status(200).json({
              success: true,
              message: "handleMint Mutation called.",
            });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    } else if (eventName == "burn") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);
      console.log(newData[6][0].data + " = " + newData[6][1].data);

      var amount0 = newData[0][1].data;
      var amount1 = newData[1][1].data;
      var pair = splitdata(newData[4][1].data);
      var sender = splitdata(newData[5][1].data);
      var to = splitdata(newData[6][1].data);

      console.log("amount0: ", amount0);
      console.log("amount1: ", amount1);
      console.log("pair: ", pair);
      console.log("sender: ", sender);
      console.log("to: ", to);

      var pairData = await pairModel.findOne({ id: pair });
      if (pairData == null) {
        var newevent = new eventsModel({
          deployHash: deployHash,
          timestamp: timestamp,
          block_hash: block_hash,
          eventName: eventName,
          eventsdata: newData,
        });
        await eventsModel.create(newevent);

        console.log(
          "pair did not created against this pair package hash, event has been saved to database."
        );
        return res.status(200).json({
          success: true,
          message:
            "pair did not created against this pair package hash, event has been saved to database.",
        });
      } else {
        request(
          process.env.GRAPHQL,
          `mutation handleBurn( $amount0: String!, $amount1: String!, $sender: String!,$logIndex: Int!,$to: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
      				handleBurn( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, to:$to, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
      				result
      				}
                              
      				}`,
          {
            amount0: amount0,
            amount1: amount1,
            sender: sender,
            logIndex: 0,
            to: to,
            pairAddress: pair,
            deployHash: deployHash,
            timeStamp: timestamp.toString(),
            blockHash: block_hash,
          }
        )
          .then(function (response) {
            console.log(response);
            return res.status(200).json({
              success: true,
              message: "handleBurn Mutation called.",
            });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    } else if (eventName == "sync") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);

      var reserve0 = newData[3][1].data;
      var reserve1 = newData[4][1].data;
      var pair = splitdata(newData[2][1].data);

      console.log("reserve0: ", reserve0);
      console.log("reserve1: ", reserve1);
      console.log("pair: ", pair);

      var pairData = await pairModel.findOne({ id: pair });
      if (pairData == null) {
        var newevent = new eventsModel({
          deployHash: deployHash,
          timestamp: timestamp,
          block_hash: block_hash,
          eventName: eventName,
          eventsdata: newData,
        });
        await eventsModel.create(newevent);

        console.log(
          "pair did not created against this pair package hash, event has been saved to database."
        );
        return res.status(200).json({
          success: true,
          message:
            "pair did not created against this pair package hash, event has been saved to database.",
        });
      } else {
        request(
          process.env.GRAPHQL,
          `mutation handleSync( $reserve0: String!, $reserve1: String!, $pairAddress: String!){
      				handleSync( reserve0: $reserve0, reserve1: $reserve1, pairAddress: $pairAddress) {
      				result
      				}
                          
      				}`,
          { reserve0: reserve0, reserve1: reserve1, pairAddress: pair }
        )
          .then(function (response) {
            console.log(response);
            return res.status(200).json({
              success: true,
              message: "handleSync Mutation called.",
            });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    } else if (eventName == "swap") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);
      console.log(newData[6][0].data + " = " + newData[6][1].data);
      console.log(newData[7][0].data + " = " + newData[7][1].data);
      console.log(newData[8][0].data + " = " + newData[8][1].data);
      console.log(newData[9][0].data + " = " + newData[9][1].data);

      var amount0In = newData[0][1].data;
      var amount1In = newData[1][1].data;
      var amount0Out = newData[2][1].data;
      var amount1Out = newData[3][1].data;
      var from = splitdata(newData[6][1].data);
      var pair = splitdata(newData[7][1].data);
      var sender = splitdata(newData[8][1].data);
      var to = splitdata(newData[9][1].data);

      console.log("amount0In: ", amount0In);
      console.log("amount1In: ", amount1In);
      console.log("amount0Out: ", amount0Out);
      console.log("amount1Out: ", amount1Out);
      console.log("from: ", from);
      console.log("pair: ", pair);
      console.log("sender: ", sender);
      console.log("to: ", to);
      var pairData = await pairModel.findOne({ id: pair });
      if (pairData == null) {
        var newevent = new eventsModel({
          deployHash: deployHash,
          timestamp: timestamp,
          block_hash: block_hash,
          eventName: eventName,
          eventsdata: newData,
        });
        await eventsModel.create(newevent);

        console.log(
          "pair did not created against this pair package hash, event has been saved to database."
        );
        return res.status(200).json({
          success: true,
          message:
            "pair did not created against this pair package hash, event has been saved to database.",
        });
      } else {
        request(
          process.env.GRAPHQL,
          `mutation handleSwap( $amount0In: String!, $amount1In: String!, $amount0Out: String!, $amount1Out: String!, $to: String!,$from: String!,$sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
      				handleSwap( amount0In: $amount0In, amount1In: $amount1In, amount0Out: $amount0Out, amount1Out: $amount1Out, to:$to, from:$from,sender: $sender,logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
      					result
      				}
                              
      				}`,
          {
            amount0In: amount0In,
            amount1In: amount1In,
            amount0Out: amount0Out,
            amount1Out: amount1Out,
            to: to,
            from: from,
            sender: sender,
            logIndex: 0,
            pairAddress: pair,
            deployHash: deployHash,
            timeStamp: timestamp.toString(),
            blockHash: block_hash,
          }
        )
          .then(function (response) {
            console.log(response);
            return res.status(200).json({
              success: true,
              message: "handleSwap Mutation called.",
            });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    } else if (eventName == "addreserves") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);

      var user = splitdata(newData[5][1].data);
      var pair = newData[2][1].data;
      var reserve0 = newData[3][1].data;
      var reserve1 = newData[4][1].data;

      console.log("user: ", user);
      console.log("pair: ", pair);
      console.log("reserve0: ", reserve0);
      console.log("reserve1: ", reserve1);

      let pairagainstuserresult = await pairagainstuser.findOne({
        id: user,
        pair: pair,
      });
      if (pairagainstuserresult == null) {
        let newData = new pairagainstuser({
          id: user,
          pair: pair,
          reserve0: reserve0,
          reserve1: reserve1,
        });
        await pairagainstuser.create(newData);
        return res.status(200).json({
          success: true,
          message: "Pair against User with reserves created Successfully.",
        });
      } else {
        if (
          BigInt(pairagainstuserresult.reserve0) >
          BigInt(pairagainstuserresult.reserve1)
        ) {
          if (BigInt(reserve0) > BigInt(reserve1)) {
            pairagainstuserresult.reserve0 = (
              BigInt(pairagainstuserresult.reserve0) + BigInt(reserve0)
            ).toString();
            pairagainstuserresult.reserve1 = (
              BigInt(pairagainstuserresult.reserve1) + BigInt(reserve1)
            ).toString();
            await pairagainstuserresult.save();
          } else {
            pairagainstuserresult.reserve0 = (
              BigInt(pairagainstuserresult.reserve0) + BigInt(reserve1)
            ).toString();
            pairagainstuserresult.reserve1 = (
              BigInt(pairagainstuserresult.reserve1) + BigInt(reserve0)
            ).toString();
            await pairagainstuserresult.save();
          }
        } else {
          if (BigInt(reserve1) > BigInt(reserve0)) {
            pairagainstuserresult.reserve0 = (
              BigInt(pairagainstuserresult.reserve0) + BigInt(reserve0)
            ).toString();
            pairagainstuserresult.reserve1 = (
              BigInt(pairagainstuserresult.reserve1) + BigInt(reserve1)
            ).toString();
            await pairagainstuserresult.save();
          } else {
            pairagainstuserresult.reserve0 = (
              BigInt(pairagainstuserresult.reserve0) + BigInt(reserve1)
            ).toString();
            pairagainstuserresult.reserve1 = (
              BigInt(pairagainstuserresult.reserve1) + BigInt(reserve0)
            ).toString();
            await pairagainstuserresult.save();
          }
        }

        return res.status(200).json({
          success: true,
          message: "User Reserves against pair Added Successfully.",
        });
      }
    } else if (eventName == "removereserves") {
      console.log(eventName + " Event result: ");
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);

      var user = splitdata(newData[5][1].data);
      var pair = newData[2][1].data;
      var reserve0 = newData[3][1].data;
      var reserve1 = newData[4][1].data;
      var routerPackageHash = newData[0][1].data;

      console.log("user: ", user);
      console.log("pair: ", pair);
      console.log("reserve0: ", reserve0);
      console.log("reserve1: ", reserve1);
      console.log("routerPackageHash: ", routerPackageHash);

      if (routerPackageHash == user) {
        let RemoveReservesResult = await RemoveReservesDataModel.findOne({
          deployHash: deployHash,
        });
      
        user = RemoveReservesResult.user;
        console.log(
          "User from approve Event saved to removereserves user:",
          user
        );
      }

      let pairagainstuserresult = await pairagainstuser.findOne({
        id: user,
        pair: pair,
      });
      if (pairagainstuserresult == null) {
        return res.status(400).json({
          success: false,
          message: "There is no pair against this user to remove reserves.",
        });
      } else {
        let data = await allcontractsDataModel.findOne({
          packageHash: pairagainstuserresult.pair,
        });

        let liquidity = await paircontract.balanceOf(
          data.contractHash,
          pairagainstuserresult.id.toLowerCase()
        );
        if (liquidity == "0") {
          await pairagainstuser.deleteOne({ _id: pairagainstuserresult._id });
          return res.status(200).json({
            success: true,
            message:
              "Record deleted because this pair against user has zero liquidity.",
          });
        } else {
          if (
            BigInt(pairagainstuserresult.reserve0) >
            BigInt(pairagainstuserresult.reserve1)
          ) {
            if (BigInt(reserve0) > BigInt(reserve1)) {
              pairagainstuserresult.reserve0 = (
                BigInt(pairagainstuserresult.reserve0) - BigInt(reserve0)
              ).toString();
              pairagainstuserresult.reserve1 = (
                BigInt(pairagainstuserresult.reserve1) - BigInt(reserve1)
              ).toString();
              await pairagainstuserresult.save();
            } else {
              pairagainstuserresult.reserve0 = (
                BigInt(pairagainstuserresult.reserve0) - BigInt(reserve1)
              ).toString();
              pairagainstuserresult.reserve1 = (
                BigInt(pairagainstuserresult.reserve1) - BigInt(reserve0)
              ).toString();
              await pairagainstuserresult.save();
            }
          } else {
            if (BigInt(reserve1) > BigInt(reserve0)) {
              pairagainstuserresult.reserve0 = (
                BigInt(pairagainstuserresult.reserve0) - BigInt(reserve0)
              ).toString();
              pairagainstuserresult.reserve1 = (
                BigInt(pairagainstuserresult.reserve1) - BigInt(reserve1)
              ).toString();
              await pairagainstuserresult.save();
            } else {
              pairagainstuserresult.reserve0 = (
                BigInt(pairagainstuserresult.reserve0) - BigInt(reserve1)
              ).toString();
              pairagainstuserresult.reserve1 = (
                BigInt(pairagainstuserresult.reserve1) - BigInt(reserve0)
              ).toString();
              await pairagainstuserresult.save();
            }
          }
          return res.status(200).json({
            success: true,
            message: "User Reserves against pair removed Successfully.",
          });
        }
      }
    }
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});

module.exports = router;
