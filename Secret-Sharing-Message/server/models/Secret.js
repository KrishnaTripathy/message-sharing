const mongoose = require('mongoose');

const SecretSchema = new mongoose.Schema({
    secret: String,
    username: String,
});

const SecretModel = mongoose.model('Secret', SecretSchema);

module.exports = SecretModel;
