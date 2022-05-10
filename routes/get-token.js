const express = require('express');
const router = express.Router();
const crypto = require('crypto');



router.get('/get-token',(req,res)=>{
    var token = crypto.randomBytes(40).toString('hex');
    console.log(token);
    res.status(200).send(token);
})

module.exports = router;