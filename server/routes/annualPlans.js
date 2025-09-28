const express = require('express');
const { body, validationResult } = require('express-validator');
const AnnualPlan = require('../models/AnnualPlan');
const MonthlyPlan = require('../models/MonthlyPlan');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/annual-plans
// @desc    Dobijanje svih godišnjih planova nastavnika
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const plans = await AnnualPlan.find({ teacherId: req.teacher._id })
      .populate('schoolId', 'naziv tip')
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    console.error('Greška pri dohvatanju planova:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/annual-plans/:id
// @desc    Dobijanje određenog godišnjeg plana
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await AnnualPlan.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    }).populate('schoolId', 'naziv tip');

    if (!plan) {
      return res.status(404).json({ message: 'Plan nije pronađen' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Greška pri dohvatanju plana:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/annual-plans
// @desc    Kreiranje novog godišnjeg plana
// @access  Private
router.post('/', [
  auth,
  body('predmet').notEmpty().withMessage('Predmet je obavezan'),
  body('razredi').isArray({ min: 1 }).withMessage('Mora biti izabran najmanje jedan razred'),
  body('nedeljniFond').isNumeric().withMessage('Nedeljni fond mora biti broj'),
  body('ukupniFond').isNumeric().withMessage('Ukupni fond mora biti broj'),
  body('glavniCiljevi').isArray({ min: 1 }).withMessage('Mora biti definisan najmanje jedan cilj'),
  body('learningOutcomes').isArray({ min: 1 }).withMessage('Mora biti definisan najmanje jedan ishod')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      predmet,
      razredi,
      nedeljniFond,
      ukupniFond,
      glavniCiljevi,
      learningOutcomes,
      assessmentPlan,
      dodatnaNastava,
      extracurricular,
      professionalDevelopment,
      napomene
    } = req.body;

    const plan = new AnnualPlan({
      teacherId: req.teacher._id,
      schoolId: req.teacher.schoolId,
      predmet,
      razredi,
      nedeljniFond,
      ukupniFond,
      glavniCiljevi,
      learningOutcomes,
      assessmentPlan: assessmentPlan || [],
      dodatnaNastava: dodatnaNastava || {},
      extracurricular: extracurricular || [],
      professionalDevelopment: professionalDevelopment || [],
      napomene
    });

    await plan.save();

    // Automatski generiši mesečne planove
    await generateMonthlyPlans(plan);

    res.status(201).json({
      message: 'Godišnji plan uspešno kreiran',
      plan
    });
  } catch (error) {
    console.error('Greška pri kreiranju plana:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/annual-plans/:id
// @desc    Ažuriranje godišnjeg plana
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await AnnualPlan.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan nije pronađen' });
    }

    if (plan.status === 'approved') {
      return res.status(400).json({ message: 'Odobreni planovi se ne mogu menjati' });
    }

    // Ažuriraj plan
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        plan[key] = req.body[key];
      }
    });

    plan.version += 1;
    await plan.save();

    // Ažuriraj mesečne planove ako su se promenili ishodi
    if (req.body.learningOutcomes) {
      await updateMonthlyPlans(plan);
    }

    res.json({
      message: 'Plan uspešno ažuriran',
      plan
    });
  } catch (error) {
    console.error('Greška pri ažuriranju plana:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/annual-plans/:id/submit
// @desc    Slanje plana na odobrenje
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const plan = await AnnualPlan.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan nije pronađen' });
    }

    plan.status = 'submitted';
    plan.submittedAt = new Date();
    await plan.save();

    res.json({
      message: 'Plan poslat na odobrenje',
      plan
    });
  } catch (error) {
    console.error('Greška pri slanju plana:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/annual-plans/:id/comment
// @desc    Dodavanje komentara na plan
// @access  Private
router.post('/:id/comment', [
  auth,
  body('text').notEmpty().withMessage('Komentar je obavezan')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const plan = await AnnualPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan nije pronađen' });
    }

    plan.comments.push({
      author: req.teacher._id,
      text: req.body.text
    });

    await plan.save();

    res.json({
      message: 'Komentar dodat',
      plan
    });
  } catch (error) {
    console.error('Greška pri dodavanju komentara:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// Helper funkcija za generisanje mesečnih planova
async function generateMonthlyPlans(annualPlan) {
  const months = ['Septembar', 'Oktobar', 'Novembar', 'Decembar', 'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun'];
  
  for (const month of months) {
    const monthlyPlan = new MonthlyPlan({
      annualPlanId: annualPlan._id,
      teacherId: annualPlan.teacherId,
      mesec: month,
      godina: new Date().getFullYear(),
      nedeljniFond: annualPlan.nedeljniFond,
      ciljeviMeseca: [],
      units: [],
      assessmentEvents: [],
      realizacija: {
        procenat: 0,
        komentari: '',
        odlozeno: [],
        nadoknada: ''
      }
    });

    // Generiši jedinice za mesec na osnovu godišnjeg plana
    const monthOutcomes = annualPlan.learningOutcomes.filter(outcome => outcome.mesec === month);
    
    for (let i = 0; i < monthOutcomes.length; i++) {
      const outcome = monthOutcomes[i];
      const weeks = outcome.nedelje || ['1', '2', '3', '4'];
      
      for (let j = 0; j < weeks.length; j++) {
        const week = weeks[j];
        const hoursPerWeek = Math.ceil(outcome.casovi / weeks.length);
        
        monthlyPlan.units.push({
          jedinica: outcome.jedinica,
          nedelja: week,
          casovi: hoursPerWeek,
          ciljevi: outcome.ishodi,
          domaci: '',
          napomene: ''
        });
      }
    }

    await monthlyPlan.save();
  }
}

// Helper funkcija za ažuriranje mesečnih planova
async function updateMonthlyPlans(annualPlan) {
  // Obriši postojeće mesečne planove
  await MonthlyPlan.deleteMany({ annualPlanId: annualPlan._id });
  
  // Generiši nove
  await generateMonthlyPlans(annualPlan);
}

module.exports = router;