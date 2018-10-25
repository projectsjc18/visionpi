var mongoose = require('mongoose');

var GpxSchema = new mongoose.Schema({
  fleet: String,
  user: String,
  operator: String,
  collective: String,
  route: String,
  checkpoint: String,
  lat: String,
  lng: String,
  updated_at: { type: Date, default: Date.now },
});

// Sets the created_at parameter equal to the current time
GpxSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    next();
});

module.exports = mongoose.model('Gpx', GpxSchema);