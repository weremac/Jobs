const express = require('express');
const { body, validationResult } = require('express-validator');
const LessonPrep = require('../models/LessonPrep');
const MonthlyPlan = require('../models/MonthlyPlan');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/lesson-preps
// @desc    Dobijanje svih priprema za čas nastavnika
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, razred } = req.query;
    let query = { teacherId: req.teacher._id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.datum = { $gte: startDate, $lte: endDate };
    }
    
    if (razred) query.razred = razred;

    const preps = await LessonPrep.find(query)
      .populate('monthlyPlanId', 'mesec godina')
      .sort({ datum: -1 });

    res.json(preps);
  } catch (error) {
    console.error('Greška pri dohvatanju priprema:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/lesson-preps/:id
// @desc    Dobijanje određene pripreme za čas
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const prep = await LessonPrep.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    }).populate('monthlyPlanId', 'mesec godina');

    if (!prep) {
      return res.status(404).json({ message: 'Priprema za čas nije pronađena' });
    }

    res.json(prep);
  } catch (error) {
    console.error('Greška pri dohvatanju pripreme:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/lesson-preps
// @desc    Kreiranje nove pripreme za čas
// @access  Private
router.post('/', [
  auth,
  body('monthlyPlanId').notEmpty().withMessage('Mesečni plan je obavezan'),
  body('datum').isISO8601().withMessage('Datum mora biti validan'),
  body('razred').notEmpty().withMessage('Razred je obavezan'),
  body('tema').notEmpty().withMessage('Tema je obavezna'),
  body('ciljCasa').notEmpty().withMessage('Cilj časa je obavezan'),
  body('ishodUcenja').notEmpty().withMessage('Ishod učenja je obavezan'),
  body('metoda').notEmpty().withMessage('Metoda je obavezna')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Proveri da li mesečni plan pripada nastavniku
    const monthlyPlan = await MonthlyPlan.findOne({
      _id: req.body.monthlyPlanId,
      teacherId: req.teacher._id
    });

    if (!monthlyPlan) {
      return res.status(404).json({ message: 'Mesečni plan nije pronađen' });
    }

    const prep = new LessonPrep({
      ...req.body,
      teacherId: req.teacher._id
    });

    await prep.save();

    res.status(201).json({
      message: 'Priprema za čas uspešno kreirana',
      prep
    });
  } catch (error) {
    console.error('Greška pri kreiranju pripreme:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/lesson-preps/:id
// @desc    Ažuriranje pripreme za čas
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const prep = await LessonPrep.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    });

    if (!prep) {
      return res.status(404).json({ message: 'Priprema za čas nije pronađena' });
    }

    // Ažuriraj pripremu
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        prep[key] = req.body[key];
      }
    });

    await prep.save();

    res.json({
      message: 'Priprema za čas uspešno ažurirana',
      prep
    });
  } catch (error) {
    console.error('Greška pri ažuriranju pripreme:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/lesson-preps/:id/realization
// @desc    Označavanje realizacije časa
// @access  Private
router.put('/:id/realization', [
  auth,
  body('realizovano').isBoolean().withMessage('Realizovano mora biti boolean'),
  body('komentariRealizacije').optional().isString(),
  body('procenatOstvarenja').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prep = await LessonPrep.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    });

    if (!prep) {
      return res.status(404).json({ message: 'Priprema za čas nije pronađena' });
    }

    const { realizovano, komentariRealizacije, procenatOstvarenja } = req.body;

    prep.realizovano = realizovano;
    if (komentariRealizacije !== undefined) {
      prep.komentariRealizacije = komentariRealizacije;
    }
    if (procenatOstvarenja !== undefined) {
      prep.procenatOstvarenja = Math.max(0, Math.min(100, procenatOstvarenja));
    }

    await prep.save();

    res.json({
      message: 'Realizacija ažurirana',
      prep
    });
  } catch (error) {
    console.error('Greška pri ažuriranju realizacije:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/lesson-preps/:id
// @desc    Brisanje pripreme za čas
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const prep = await LessonPrep.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    });

    if (!prep) {
      return res.status(404).json({ message: 'Priprema za čas nije pronađena' });
    }

    await LessonPrep.findByIdAndDelete(req.params.id);

    res.json({ message: 'Priprema za čas uspešno obrisana' });
  } catch (error) {
    console.error('Greška pri brisanju pripreme:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/lesson-preps/monthly/:monthlyPlanId
// @desc    Dobijanje svih priprema za određeni mesečni plan
// @access  Private
router.get('/monthly/:monthlyPlanId', auth, async (req, res) => {
  try {
    // Proveri da li mesečni plan pripada nastavniku
    const monthlyPlan = await MonthlyPlan.findOne({
      _id: req.params.monthlyPlanId,
      teacherId: req.teacher._id
    });

    if (!monthlyPlan) {
      return res.status(404).json({ message: 'Mesečni plan nije pronađen' });
    }

    const preps = await LessonPrep.find({
      monthlyPlanId: req.params.monthlyPlanId
    }).sort({ datum: 1 });

    res.json(preps);
  } catch (error) {
    console.error('Greška pri dohvatanju priprema:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;