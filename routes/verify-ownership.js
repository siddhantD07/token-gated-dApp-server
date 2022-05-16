const express = require("express");
// const connectDB = require('./config/database');
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Web3 = require("web3");
const FormDetail = require("../models/FormDetailModel");
const axios = require("axios");
const findAllTokens = require("../utils/findAllTokens");
const getTokenIds = require("../utils/getTokenIds");

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/3134cba1e5a84a7dafd367035575359a"
  )
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
  body("message").notEmpty().withMessage("Message is required").isLength({max:100}).withMessage("Message cannot be more than 100 characters"),
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
      var contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
      if (address) {
        balance = Number(await contract.methods.balanceOf(address).call());
        if (balance > 0) {
          const assetsOwned = await axios.get(
            "https://api-staging.rarible.org/v0.1/items/byOwner",
            { params: { owner: "ETHEREUM:" + address } }
          );
          let tokenIds = findAllTokens(
            assetsOwned.data.items,
            CONTRACT_ADDRESS
          );
          // const tokenMapped = tokenIds[0];
          const tokensAlreadyInDB = await FormDetail.find({
            tokenId: { $in: tokenIds },
          });
          const tokenIdsFromDB =  getTokenIds(tokensAlreadyInDB);
          console.log("tokensAlreadyInDB: ", tokenIdsFromDB);
          console.log(tokenIds);
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

      console.log(flag);
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

const CONTRACT_ADDRESS = "0xa25f2ff16aaea0f2e730dd07018393d7c4443d8e";
const ABI = [
  {
    inputs: [
      { internalType: "string", name: "_initBaseURI", type: "string" },
      { internalType: "string", name: "_initNotRevealedUri", type: "string" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "ApprovalCallerNotOwnerNorApproved", type: "error" },
  { inputs: [], name: "ApprovalQueryForNonexistentToken", type: "error" },
  { inputs: [], name: "ApprovalToCurrentOwner", type: "error" },
  { inputs: [], name: "ApproveToCaller", type: "error" },
  { inputs: [], name: "BalanceQueryForZeroAddress", type: "error" },
  { inputs: [], name: "MintToZeroAddress", type: "error" },
  { inputs: [], name: "MintZeroQuantity", type: "error" },
  { inputs: [], name: "OwnerQueryForNonexistentToken", type: "error" },
  { inputs: [], name: "TransferCallerNotOwnerNorApproved", type: "error" },
  { inputs: [], name: "TransferFromIncorrectOwner", type: "error" },
  { inputs: [], name: "TransferToNonERC721ReceiverImplementer", type: "error" },
  { inputs: [], name: "TransferToZeroAddress", type: "error" },
  { inputs: [], name: "URIQueryForNonexistentToken", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "MAXIMUM_MINT_RAFFLE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAXIMUM_MINT_WL",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAXIMUM_SUPPLY",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getApproved",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSaleStatus",
    outputs: [
      {
        internalType: "enum TokenGatedPass.WorkflowStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "addresses", type: "address[]" },
    ],
    name: "gift",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32[]", name: "_merkleProof", type: "bytes32[]" },
    ],
    name: "hasWhitelist",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "operator", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isRevealed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "merkleRoot",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "notRevealedUri",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "ammount", type: "uint256" },
      { internalType: "bytes32[]", name: "_merkleProof", type: "bytes32[]" },
    ],
    name: "presaleMint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "privateSalePrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "ammount", type: "uint256" }],
    name: "raffleMint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "restart",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "reveal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "bytes", name: "_data", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_newBaseURI", type: "string" }],
    name: "setBaseURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "root", type: "bytes32" }],
    name: "setMerkleRoot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_notRevealedURI", type: "string" },
    ],
    name: "setNotRevealedURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "setUpPresale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "setUpSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokensPerWalletRaffle",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokensPerWalletWhitelist",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newPrice", type: "uint256" }],
    name: "updateRafflePrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newSupply", type: "uint256" }],
    name: "updateSupply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newPrice", type: "uint256" }],
    name: "updateWLPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "workflow",
    outputs: [
      {
        internalType: "enum TokenGatedPass.WorkflowStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
