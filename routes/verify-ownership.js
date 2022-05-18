require('dotenv').config();

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Web3 = require("web3");
const FormDetail = require("../models/FormDetailModel");
const axios = require("axios");
const findAllTokens = require("../utils/findAllTokens");
const getTokenIds = require("../utils/getTokenIds");
const contractDetails = require('../config/contractDetails');

const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.RPC_ENDPOINT)
);

router.post(
  "/verify-ownership",
  body("values.firstName").notEmpty().withMessage("First name is required").isLength({max:100}).withMessage("First name cannot be more than 100 characters"),
  body("values.lastName").notEmpty().withMessage("Last name is required").isLength({max:100}).withMessage("Last name cannot be more than 100 characters"),
  body("values.email").isEmail().notEmpty().withMessage("Email is required").isLength({max:100}).withMessage("Email cannot be more than 100 characters"),
  body("values.phone").isMobilePhone().notEmpty().withMessage("Phone is required"),
  body("values.homeAddress").notEmpty().withMessage("Address is required").isLength({max:250}).withMessage("Address cannot be more than 250 characters"),
  body("values.city").notEmpty().withMessage("City is required").isLength({max:100}).withMessage("City name cannot be more than 100 characters"),
  body("values.country").notEmpty().withMessage("Country is required").isLength({max:100}).withMessage("Country name cannot be more than 100 characters"),
  body("values.stateProvince").notEmpty().withMessage("State/Province is required").isLength({max:200}).withMessage("State/Province name cannot be more than 200 characters"),
  body("values.postalCode").notEmpty().withMessage("Postal-code is required").isLength({max:15}).withMessage("Postal-code cannot be more than 15 characters"),
  body("message").notEmpty().withMessage("Message is required").isLength({max:200}).withMessage("Message cannot be more than 200 characters"),
  body("signature").notEmpty().withMessage("Signature is required").isLength({max:500}).withMessage("Signature cannot be more than 500 characters"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      var balance = 0;

      const address = await web3.eth.accounts.recover(
        req.body.message,
        req.body.signature
      );
      var flag = false;
      var contract = new web3.eth.Contract(contractDetails.ABI, contractDetails.CONTRACT_ADDRESS);
      if (address) {
        balance = Number(await contract.methods.balanceOf(address).call());
        if (balance > 0) {
          const assetsOwned = await axios.get(
            "https://api-staging.rarible.org/v0.1/items/byOwner",
            { params: { owner: "ETHEREUM:" + address } }
          );
          let tokenIds = findAllTokens(
            assetsOwned.data.items,
            contractDetails.CONTRACT_ADDRESS
          );
          // const tokenMapped = tokenIds[0];
          const tokensAlreadyInDB = await FormDetail.find({
            tokenId: { $in: tokenIds },
          });
          const tokenIdsFromDB =  getTokenIds(tokensAlreadyInDB);
          console.log("tokensAlreadyInDB: ", tokenIdsFromDB);
          // console.log(tokenIds);
          tokenIds = tokenIds.filter(val => !tokenIdsFromDB.includes(val));
          console.log(tokenIds);
          if (tokenIds.length > 0) {

              const formDetail = new FormDetail({
                address: address,
                tokenId: tokenIds[0],
                firstName: req.body.values.firstName,
                lastName: req.body.values.lastName,
                email: req.body.values.email,
                phone: req.body.values.phone,
                homeAddress: req.body.values.homeAddress,
                city: req.body.values.city,
                stateProvince: req.body.values.stateProvince,
                country: req.body.values.country,
                postalCode: req.body.values.postalCode,
              });
              await formDetail.save();
              flag = true;
              res.status(200).send("Success");

          }else {

            if(tokenIds.length>0){
              const formDetail = new FormDetail({
                address: address,
                  tokenId: tokenIds[0],
                  firstName: req.body.values.firstName,
                  lastName: req.body.values.lastName,
                  email: req.body.values.email,
                  phone: req.body.values.phone,
                  homeAddress: req.body.values.homeAddress,
                  city: req.body.values.city,
                  stateProvince: req.body.values.stateProvince,
                  country: req.body.values.country,
                  postalCode: req.body.values.postalCode,
              });
              const formDetailRes = await formDetail.save();
              return res.status(200).send("Success");
            }else{
              return res.status(500).send("Failure");
            }
            
          }
        } else {
          return res.status(500).send("No tokens owned");
        }
      } else {
        return res.status(500).send("Failure");
      }

      // console.log(flag);
      // if (flag) {
      //   res.status(200).send("Success");
      // } else {
      //   res.status(500).send("Form Already Submitted");
      // }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

module.exports = router;

