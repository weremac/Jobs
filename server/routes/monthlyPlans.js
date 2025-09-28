const express = require('express');
const { body, validationResult } = require('express-validator');
const MonthlyPlan = require('../models/MonthlyPlan');
const AnnualPlan = require('../models/AnnualPlan');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/monthly-plans
// @desc    Dobijanje svih mesečnih planova nastavnika
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    let query = { teacherId: req.teacher._id };
    
    if (year) query.godina = parseInt(year);
    if (month) query.mesec = month;

    const plans = await MonthlyPlan.find(query)
      .populate('annualPlanId', 'predmet razredi schoolYear')
      .sort({ mesec: 1, godina: 1 });

    res.json(plans);
  } catch (error) {
    console.error('Greška pri dohvatanju mesečnih planova:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/monthly-plans/:id
// @desc    Dobijanje određenog mesečnog plana
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await MonthlyPlan.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    }).populate('annualPlanId', 'predmet razredi schoolYear');

    if (!plan) {
      return res.status(404).json({ message: 'Mesečni plan nije pronađen' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Greška pri dohvatanju mesečnog plana:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/monthly-plans/:id
// @desc    Ažuriranje mesečnog plana
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await MonthlyPlan.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Mesečni plan nije pronađen' });
    }

    // Ažuriraj plan
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        plan[key] = req.body[key];
      }
    });

    await plan.save();

    res.json({
      message: 'Mesečni plan uspešno ažuriran',
      plan
    });
  } catch (error) {
    console.error('Greška pri ažuriranju mesečnog plana:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/monthly-plans/:id/realization
// @desc    Ažuriranje realizacije mesečnog plana
// @access  Private
router.put('/:id/realization', [
  auth,
  body('procenat').isNumeric().withMessage('Procenat mora biti broj'),
  body('komentari').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const plan = await MonthlyPlan.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Mesečni plan nije pronađen' });
    }

    const { procenat, komentari, odlozeno, nadoknada } = req.body;

    plan.realizacija = {
      procenat: Math.max(0, Math.min(100, procenat)),
      komentari: komentari || plan.realizacija.komentari,
      odlozeno: odlozeno || plan.realizacija.odlozeno,
      nadoknada: nadoknada || plan.realizacija.nadoknada
    };

    // Ažuriraj status na osnovu procenata
    if (plan.realizacija.procenat === 100) {
      plan.status = 'completed';
    } else if (plan.realizacija.procenat > 0) {
      plan.status = 'in_progress';
    }

    await plan.save();

    res.json({
      message: 'Realizacija ažurirana',
      plan
    });
  } catch (error) {
    console.error('Greška pri ažuriranju realizacije:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/monthly-plans/annual/:annualPlanId
// @desc    Dobijanje svih mesečnih planova za određeni godišnji plan
// @access  Private
router.get('/annual/:annualPlanId', auth, async (req, res) => {
  try {
    // Proveri da li godišnji plan pripada nastavniku
    const annualPlan = await AnnualPlan.findOne({
      _id: req.params.annualPlanId,
      teacherId: req.teacher._id
    });

    if (!annualPlan) {
      return res.status(404).json({ message: 'Godišnji plan nije pronađen' });
    }

    const monthlyPlans = await MonthlyPlan.find({
      annualPlanId: req.params.annualPlanId
    }).sort({ mesec: 1 });

    res.json(monthlyPlans);
  } catch (error) {
    console.error('Greška pri dohvatanju mesečnih planova:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/monthly-plans/:id/regenerate
// @desc    Regenerisanje mesečnog plana iz godišnjeg
// @access  Private
router.post('/:id/regenerate', auth, async (req, res) => {
  try {
    const plan = await MonthlyPlan.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    }).populate('annualPlanId');

    if (!plan) {
      return res.status(404).json({ message: 'Mesečni plan nije pronađen' });
    }

    const annualPlan = plan.annualPlanId;
    const month = plan.mesec;

    // Generiši nove jedinice za mesec
    const monthOutcomes = annualPlan.learningOutcomes.filter(outcome => outcome.mesec === month);
    const newUnits = [];

    for (let i = 0; i < monthOutcomes.length; i++) {
      const outcome = monthOutcomes[i];
      const weeks = outcome.nedelje || ['1', '2', '3', '4'];
      
      for (let j = 0; j < weeks.length; j++) {
        const week = weeks[j];
        const hoursPerWeek = Math.ceil(outcome.casovi / weeks.length);
        
        newUnits.push({
          jedinica: outcome.jedinica,
          nedelja: week,
          casovi: hoursPerWeek,
          ciljevi: outcome.ishodi,
          domaci: '',
          napomene: ''
        });
      }
    }

    // Zadrži postojeće podatke o realizaciji
    const existingRealization = plan.realizacija;

    // Ažuriraj plan
    plan.units = newUnits;
    plan.ciljeviMeseca = monthOutcomes.map(outcome => outcome.jedinica);
    plan.realizacija = existingRealization; // Zadrži postojeće podatke o realizaciji

    await plan.save();

    res.json({
      message: 'Mesečni plan regenerisan',
      plan
    });
  } catch (error) {
    console.error('Greška pri regenerisanju mesečnog plana:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;