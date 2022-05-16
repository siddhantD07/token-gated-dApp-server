const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FormDetailSchema = new Schema({
    address:{
        type: String,
        required: true
    },
    tokenId:{
        type: String,
        required: true
    },
    firstName : {
        type:String,
        required:true,
    },
    lastName : {
        type:String,
        required:true,
        default:null
    },
    email : {
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    homeAddress:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    stateProvince:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    postalCode:{
        type:String,
        required:true,
    }
});

module.exports = FormDetails = mongoose.model('FormDetails', FormDetailSchema);