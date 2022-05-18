const express = require("express");
const router = express.Router();
const FormDetail = require("../models/FormDetailModel");



router.get('/get-all-data', async(req,res)=>{
    try {
        const formDetails = await FormDetail.find();
        res.status(200).send(formDetails);
    } catch (error) {
        res.status(500).send(error);
    }
} );

module.exports = router;
