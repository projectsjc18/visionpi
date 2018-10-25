// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Creates a Message Schema. This will be the basis of how user data is stored in the db
var PositionSchema = new Schema({
    userid: {type: [Number], required: true},
    username: {type: [String], required: true},
    lat: {type: [Number], required: true},
    longt: {type: [Number], required: true},
    comment: String,
    created_at: {type: Date, default: Date.now}
});

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-users"
module.exports = mongoose.model('position', PositionSchema);