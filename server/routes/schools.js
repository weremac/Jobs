const express = require('express');
const School = require('../models/School');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/schools
// @desc    Dobijanje svih škola
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const schools = await School.find({ isActive: true })
      .sort({ naziv: 1 });

    res.json(schools);
  } catch (error) {
    console.error('Greška pri dohvatanju škola:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/schools/:id
// @desc    Dobijanje određene škole
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: 'Škola nije pronađena' });
    }

    res.json(school);
  } catch (error) {
    console.error('Greška pri dohvatanju škole:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/schools
// @desc    Kreiranje nove škole
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      naziv,
      tip,
      adresa,
      grad,
      kontakt,
      fondGodisnji,
      fondNedeljni,
      nastavniDani,
      raspored
    } = req.body;

    const school = new School({
      naziv,
      tip,
      adresa,
      grad,
      kontakt: kontakt || {},
      fondGodisnji: fondGodisnji || 144,
      fondNedeljni: fondNedeljni || 4,
      nastavniDani: nastavniDani || 36,
      raspored: raspored || {}
    });

    await school.save();

    res.status(201).json({
      message: 'Škola uspešno kreirana',
      school
    });
  } catch (error) {
    console.error('Greška pri kreiranju škole:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/schools/:id
// @desc    Ažuriranje škole
// @access  Private (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'Škola nije pronađena' });
    }

    // Ažuriraj podatke
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        school[key] = req.body[key];
      }
    });

    await school.save();

    res.json({
      message: 'Škola uspešno ažurirana',
      school
    });
  } catch (error) {
    console.error('Greška pri ažuriranju škole:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/schools/:id
// @desc    Deaktivacija škole (soft delete)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'Škola nije pronađena' });
    }

    school.isActive = false;
    await school.save();

    res.json({ message: 'Škola uspešno deaktivirana' });
  } catch (error) {
    console.error('Greška pri deaktivaciji škole:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;