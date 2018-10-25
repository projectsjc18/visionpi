// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Creates a Message Schema. This will be the basis of how user data is stored in the db
var MessageSchema = new Schema({
    created: Date,
    content: String,
    username: String,
    room: String
});

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-users"
module.exports = mongoose.model('message', MessageSchema);