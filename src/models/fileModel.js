const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalName: {
        type: String
    },
    storageName: {
        type: String
    },
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    key: {
        type: String
    }
});

const File = mongoose.model("File", fileSchema);

module.exports = File;