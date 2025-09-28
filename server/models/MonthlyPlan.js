const mongoose = require('mongoose');

const weeklyUnitSchema = new mongoose.Schema({
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnnualPlan.learningOutcomes'
  },
  jedinica: String,
  nedelja: {
    type: String,
    required: true
  },
  casovi: {
    type: Number,
    required: true
  },
  ciljevi: [String],
  domaci: String,
  napomene: String
});

const assessmentEventSchema = new mongoose.Schema({
  tip: String,
  datum: Date,
  opis: String,
  casovi: Number
});

const monthlyPlanSchema = new mongoose.Schema({
  annualPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnnualPlan',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  mesec: {
    type: String,
    required: true,
    enum: ['Septembar', 'Oktobar', 'Novembar', 'Decembar', 'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun']
  },
  godina: {
    type: Number,
    required: true
  },
  nedeljniFond: {
    type: Number,
    required: true
  },
  ciljeviMeseca: [String],
  units: [weeklyUnitSchema],
  assessmentEvents: [assessmentEventSchema],
  realizacija: {
    procenat: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    komentari: String,
    odlozeno: [String],
    nadoknada: String
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed'],
    default: 'draft'
  },
  napomene: String
}, {
  timestamps: true
});

module.exports = mongoose.model('MonthlyPlan', monthlyPlanSchema);