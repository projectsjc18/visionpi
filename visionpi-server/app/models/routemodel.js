// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;
var bcrypt      = require('bcrypt');

// Creates a Operator Schema. This will be the basis of how user data is stored in the db
var RouteSchema = new Schema({
    route_id: {type: Number, required: true},
    description: {type: String, required: true},
    coordinates: [{type: [Number], required: true}], // [Long, Lat]
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// Sets the created_at parameter equal to the current time
RouteSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

// Indexes this schema in 2dsphere format (critical for running proximity searches)
RouteSchema.index({location: '2dsphere'});


// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-users"
module.exports = mongoose.model('operator', UserSchema);
