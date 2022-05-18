const express = require('express');
const router = express.Router();
const crypto = require('crypto');



router.get('/get-token',(req,res)=>{
    try{
        var token = "Please sign this message to verify your identity : "+crypto.randomBytes(40).toString('hex');
        res.status(200).send(token);
    }catch(error){
        res.status(500).send(error);
    }
})

module.exports = router;