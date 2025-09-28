const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  naziv: {
    type: String,
    required: true,
    trim: true
  },
  tip: {
    type: String,
    required: true,
    enum: ['Gimnazija', 'Stručna škola', 'Umetnička škola', 'Sportsko-turistička škola']
  },
  adresa: {
    type: String,
    required: true
  },
  grad: {
    type: String,
    required: true
  },
  kontakt: {
    telefon: String,
    email: String,
    website: String
  },
  fondGodisnji: {
    type: Number,
    required: true,
    default: 144 // standardni fond za gimnaziju
  },
  fondNedeljni: {
    type: Number,
    required: true,
    default: 4
  },
  nastavniDani: {
    type: Number,
    required: true,
    default: 36
  },
  raspored: {
    ponedeljak: [String],
    utorak: [String],
    sreda: [String],
    cetvrtak: [String],
    petak: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('School', schoolSchema);