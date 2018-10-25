// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;
var bcrypt      = require('bcrypt');

var transportSchema = new Schema(
    { 
        transport_id: {type: Number, required: true},
        description: {type: String, required: true}
    });

// Creates a Operator Schema. This will be the basis of how user data is stored in the db
var OperatorSchema = new Schema({
    operator_id: {type: Number, required: true},
    name: {type: String, required: true},
    lastname: {type: String, required: true},
    gender: {type: String, required: true},
    age: {type: Number, required: true},
    perfil: {type: String, required: true},
    routes: [{type: [Number], required: true}],
    transport_type: [transportSchema],
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// Sets the created_at parameter equal to the current time
OperatorSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

// Indexes this schema in 2dsphere format (critical for running proximity searches)
//OperatorSchema.index({location: '2dsphere'});


// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-users"
module.exports = mongoose.model('operator', UserSchema);
