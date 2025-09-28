const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Teacher = require('../models/Teacher');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registracija nastavnika
// @access  Public
router.post('/register', [
  body('ime').notEmpty().withMessage('Ime je obavezno'),
  body('prezime').notEmpty().withMessage('Prezime je obavezno'),
  body('email').isEmail().withMessage('Email nije validan'),
  body('password').isLength({ min: 6 }).withMessage('Lozinka mora imati najmanje 6 karaktera'),
  body('predmet').notEmpty().withMessage('Predmet je obavezan'),
  body('schoolId').notEmpty().withMessage('Škola je obavezna')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ime, prezime, email, password, predmet, razredi, schoolId, kontakt } = req.body;

    // Proveri da li nastavnik već postoji
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Nastavnik sa ovim email-om već postoji' });
    }

    // Hash lozinke
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Kreiraj nastavnika
    const teacher = new Teacher({
      ime,
      prezime,
      email,
      password: hashedPassword,
      predmet,
      razredi: razredi || [],
      schoolId,
      kontakt: kontakt || {}
    });

    await teacher.save();

    // Generiši JWT token
    const payload = {
      id: teacher._id,
      email: teacher.email,
      role: teacher.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Nastavnik uspešno registrovan',
      token,
      teacher: {
        id: teacher._id,
        ime: teacher.ime,
        prezime: teacher.prezime,
        email: teacher.email,
        predmet: teacher.predmet,
        razredi: teacher.razredi,
        role: teacher.role
      }
    });
  } catch (error) {
    console.error('Greška pri registraciji:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/auth/login
// @desc    Prijava nastavnika
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Email nije validan'),
  body('password').notEmpty().withMessage('Lozinka je obavezna')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Pronađi nastavnika
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ message: 'Neispravni podaci za prijavu' });
    }

    // Proveri lozinku
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Neispravni podaci za prijavu' });
    }

    // Generiši JWT token
    const payload = {
      id: teacher._id,
      email: teacher.email,
      role: teacher.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '7d'
    });

    res.json({
      message: 'Uspešna prijava',
      token,
      teacher: {
        id: teacher._id,
        ime: teacher.ime,
        prezime: teacher.prezime,
        email: teacher.email,
        predmet: teacher.predmet,
        razredi: teacher.razredi,
        role: teacher.role
      }
    });
  } catch (error) {
    console.error('Greška pri prijavi:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/auth/me
// @desc    Dobijanje trenutnog nastavnika
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      teacher: {
        id: req.teacher._id,
        ime: req.teacher.ime,
        prezime: req.teacher.prezime,
        email: req.teacher.email,
        predmet: req.teacher.predmet,
        razredi: req.teacher.razredi,
        role: req.teacher.role,
        schoolId: req.teacher.schoolId
      }
    });
  } catch (error) {
    console.error('Greška pri dohvatanju podataka:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;