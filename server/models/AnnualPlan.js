const mongoose = require('mongoose');

const learningOutcomeSchema = new mongoose.Schema({
  jedinica: {
    type: String,
    required: true
  },
  ishodi: [String],
  casovi: {
    type: Number,
    required: true
  },
  mesec: {
    type: String,
    required: true,
    enum: ['Septembar', 'Oktobar', 'Novembar', 'Decembar', 'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun']
  },
  nedelje: [String] // ["1", "2", "3", "4"]
});

const assessmentPlanSchema = new mongoose.Schema({
  tip: {
    type: String,
    enum: ['formativno', 'summativno', 'projekat', 'praktični rad'],
    required: true
  },
  opis: String,
  mesec: String,
  casovi: Number
});

const extracurricularSchema = new mongoose.Schema({
  aktivnost: String,
  mesec: String,
  casovi: Number,
  opis: String
});

const professionalDevelopmentSchema = new mongoose.Schema({
  aktivnost: String,
  mesec: String,
  casovi: Number,
  opis: String
});

const annualPlanSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  schoolYear: {
    type: String,
    required: true,
    default: () => {
      const year = new Date().getFullYear();
      return `${year}/${year + 1}`;
    }
  },
  predmet: {
    type: String,
    required: true
  },
  razredi: [String],
  nedeljniFond: {
    type: Number,
    required: true
  },
  ukupniFond: {
    type: Number,
    required: true
  },
  glavniCiljevi: [String],
  learningOutcomes: [learningOutcomeSchema],
  assessmentPlan: [assessmentPlanSchema],
  dodatnaNastava: {
    opis: String,
    casovi: Number,
    mesec: String
  },
  extracurricular: [extracurricularSchema],
  professionalDevelopment: [professionalDevelopmentSchema],
  napomene: String,
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  submittedAt: Date,
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual za ukupno vreme
annualPlanSchema.virtual('ukupnoVreme').get(function() {
  return this.learningOutcomes.reduce((total, outcome) => total + outcome.casovi, 0);
});

module.exports = mongoose.model('AnnualPlan', annualPlanSchema);