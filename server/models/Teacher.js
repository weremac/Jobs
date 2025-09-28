const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  ime: {
    type: String,
    required: true,
    trim: true
  },
  prezime: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  predmet: {
    type: String,
    required: true,
    enum: ['Matematika', 'Srpski jezik', 'Engleski jezik', 'Fizika', 'Hemija', 'Biologija', 'Istorija', 'Geografija', 'Informatika', 'Fizičko vaspitanje', 'Ostalo']
  },
  razredi: [{
    type: String,
    enum: ['I', 'II', 'III', 'IV']
  }],
  sertifikati: [String],
  kontakt: {
    telefon: String,
    adresa: String
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['teacher', 'admin', 'principal'],
    default: 'teacher'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual za puno ime
teacherSchema.virtual('punoIme').get(function() {
  return `${this.ime} ${this.prezime}`;
});

module.exports = mongoose.model('Teacher', teacherSchema);