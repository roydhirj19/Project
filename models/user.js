const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    email:{
        type: String,
        unique:true,
        required: true,
    },
    // OAuth fields
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    linkedinId: {
        type: String,
        unique: true,
        sparse: true
    },
    displayName: {
        type: String
    },
    profilePicture: {
        type: String
    }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'username',
    usernameUnique: true,
    usernameQueryFields: ['username', 'email']
});
module.exports = mongoose.model('User', userSchema);