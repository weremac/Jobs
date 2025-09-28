const express = require('express');
const Teacher = require('../models/Teacher');
const School = require('../models/School');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/teachers
// @desc    Dobijanje svih nastavnika (samo admin)
// @access  Private (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('schoolId', 'naziv tip')
      .select('-password')
      .sort({ ime: 1, prezime: 1 });

    res.json(teachers);
  } catch (error) {
    console.error('Greška pri dohvatanju nastavnika:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/teachers/school/:schoolId
// @desc    Dobijanje nastavnika određene škole
// @access  Private
router.get('/school/:schoolId', auth, async (req, res) => {
  try {
    const teachers = await Teacher.find({ 
      schoolId: req.params.schoolId,
      isActive: true 
    })
    .populate('schoolId', 'naziv tip')
    .select('-password')
    .sort({ ime: 1, prezime: 1 });

    res.json(teachers);
  } catch (error) {
    console.error('Greška pri dohvatanju nastavnika škole:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/teachers/:id
// @desc    Dobijanje određenog nastavnika
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('schoolId', 'naziv tip')
      .select('-password');

    if (!teacher) {
      return res.status(404).json({ message: 'Nastavnik nije pronađen' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Greška pri dohvatanju nastavnika:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/teachers/:id
// @desc    Ažuriranje nastavnika
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Nastavnik može da ažurira samo svoje podatke, admin može sve
    if (req.teacher.role !== 'admin' && req.teacher.role !== 'principal' && req.teacher._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Nedovoljne dozvole' });
    }

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Nastavnik nije pronađen' });
    }

    // Ažuriraj podatke
    const allowedFields = ['ime', 'prezime', 'email', 'predmet', 'razredi', 'kontakt', 'sertifikati'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    await teacher.save();

    res.json({
      message: 'Nastavnik uspešno ažuriran',
      teacher: {
        id: teacher._id,
        ime: teacher.ime,
        prezime: teacher.prezime,
        email: teacher.email,
        predmet: teacher.predmet,
        razredi: teacher.razredi,
        kontakt: teacher.kontakt,
        sertifikati: teacher.sertifikati,
        role: teacher.role
      }
    });
  } catch (error) {
    console.error('Greška pri ažuriranju nastavnika:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/teachers/:id
// @desc    Deaktivacija nastavnika (soft delete)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Nastavnik nije pronađen' });
    }

    teacher.isActive = false;
    await teacher.save();

    res.json({ message: 'Nastavnik uspešno deaktiviran' });
  } catch (error) {
    console.error('Greška pri deaktivaciji nastavnika:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;