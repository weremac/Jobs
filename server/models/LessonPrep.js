const mongoose = require('mongoose');

const lessonPrepSchema = new mongoose.Schema({
  monthlyPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonthlyPlan',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  datum: {
    type: Date,
    required: true
  },
  razred: {
    type: String,
    required: true
  },
  redniBrojCasa: {
    type: Number,
    required: true
  },
  tema: {
    type: String,
    required: true
  },
  ciljCasa: {
    type: String,
    required: true
  },
  ishodUcenja: {
    type: String,
    required: true
  },
  metoda: {
    type: String,
    required: true
  },
  aktivnosti: [String],
  sredstva: [String],
  materijali: [String],
  procena: {
    tip: {
      type: String,
      enum: ['formativna', 'summativna', 'samoprocena', 'uzajamna']
    },
    kriterijumi: [String],
    zadatak: String
  },
  trajanje: {
    type: Number,
    required: true,
    default: 45
  },
  diferencijacija: {
    zaNapredne: String,
    zaSpore: String,
    individualniPristup: String
  },
  domaci: String,
  napomene: String,
  realizovano: {
    type: Boolean,
    default: false
  },
  komentariRealizacije: String,
  procenatOstvarenja: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Index za brže pretraživanje po datumu i nastavniku
lessonPrepSchema.index({ teacherId: 1, datum: 1 });
lessonPrepSchema.index({ monthlyPlanId: 1, datum: 1 });

module.exports = mongoose.model('LessonPrep', lessonPrepSchema);