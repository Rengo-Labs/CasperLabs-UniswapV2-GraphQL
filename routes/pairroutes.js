require("dotenv").config();
var express = require("express");
const { createFalse } = require("typescript");
var router = express.Router();
var pair = require("../JsClients/PAIR/test/installed.ts");

router
  .route("/liquidityagainstuserandpair")
  .post(async function (req, res, next) {
    try {
      if (!req.body.to) {
        return res.status(400).json({
          success: false,
          message: "to not found in request body",
        });
      }

      if (!req.body.pairid) {
        return res.status(400).json({
          success: false,
          message: "pairid not found in request body",
        });
      }

      let liquidity = await pair.balanceOf(req.body.pairid, req.body.to);
      return res.status(200).json({
        success: true,
        message:
          "Liquidity has been found against this user against passed pair ",
        liquidity: liquidity,
      });
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
  });
router
  .route("/allowanceagainstownerandspenderpaircontract")
  .post(async function (req, res, next) {
    try {
      if (!req.body.contractHash) {
        return res.status(400).json({
          success: false,
          message: "contractHash not found in request body",
        });
      }

      if (!req.body.owner) {
        return res.status(400).json({
          success: false,
          message: "owner not found in request body",
        });
      }

      if (!req.body.spender) {
        return res.status(400).json({
          success: false,
          message: "spender not found in request body",
        });
      }

      let allowance = await pair.allowance(
        req.body.contractHash,
        req.body.owner,
        req.body.spender
      );
      console.log("Allowance: ", allowance);

      return res.status(200).json({
        success: true,
        message: "Allowance has been found against this owner and spender",
        allowance: allowance,
      });
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
  });
module.exports = router;
