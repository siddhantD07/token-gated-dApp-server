const express = require("express");
// const connectDB = require('./config/database');
const router = express.Router();
const Web3 = require("web3");
const FormDetail = require("../models/FormDetailModel");
const axios = require("axios");



router.get('/get-all-data', async(req,res)=>{
    try {
        const formDetails = await FormDetail.find();
        res.status(200).send(formDetails);
    } catch (error) {
        res.status(500).send(error);
    }
} );

module.exports = router;
