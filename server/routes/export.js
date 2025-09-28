const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const AnnualPlan = require('../models/AnnualPlan');
const MonthlyPlan = require('../models/MonthlyPlan');
const LessonPrep = require('../models/LessonPrep');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/export/annual-plan/:id/pdf
// @desc    Export godišnjeg plana u PDF
// @access  Private
router.post('/annual-plan/:id/pdf', auth, async (req, res) => {
  try {
    const plan = await AnnualPlan.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    }).populate('schoolId', 'naziv tip adresa');

    if (!plan) {
      return res.status(404).json({ message: 'Plan nije pronađen' });
    }

    const html = generateAnnualPlanHTML(plan);
    const pdfBuffer = await generatePDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="godisnji-plan-${plan.predmet}-${plan.schoolYear}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Greška pri export-u godišnjeg plana:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/export/monthly-plan/:id/pdf
// @desc    Export mesečnog plana u PDF
// @access  Private
router.post('/monthly-plan/:id/pdf', auth, async (req, res) => {
  try {
    const plan = await MonthlyPlan.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    }).populate('annualPlanId', 'predmet razredi schoolYear');

    if (!plan) {
      return res.status(404).json({ message: 'Mesečni plan nije pronađen' });
    }

    const html = generateMonthlyPlanHTML(plan);
    const pdfBuffer = await generatePDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="mesecni-plan-${plan.mesec}-${plan.godina}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Greška pri export-u mesečnog plana:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/export/lesson-prep/:id/pdf
// @desc    Export pripreme za čas u PDF
// @access  Private
router.post('/lesson-prep/:id/pdf', auth, async (req, res) => {
  try {
    const prep = await LessonPrep.findOne({
      _id: req.params.id,
      teacherId: req.teacher._id
    }).populate('monthlyPlanId', 'mesec godina');

    if (!prep) {
      return res.status(404).json({ message: 'Priprema za čas nije pronađena' });
    }

    const html = generateLessonPrepHTML(prep);
    const pdfBuffer = await generatePDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="priprema-cas-${prep.datum.toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Greška pri export-u pripreme:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// Helper funkcija za generisanje PDF-a
async function generatePDF(html) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

// Helper funkcija za generisanje HTML-a godišnjeg plana
function generateAnnualPlanHTML(plan) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Godišnji plan - ${plan.predmet}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #333; }
        .header h2 { margin: 5px 0; color: #666; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px; border: 1px solid #ddd; }
        .info-table td:first-child { background-color: #f5f5f5; font-weight: bold; width: 30%; }
        .outcomes-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .outcomes-table th, .outcomes-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        .outcomes-table th { background-color: #f5f5f5; font-weight: bold; }
        .assessment-item { margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #007bff; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>GODIŠNJI (GLOBALNI) PLAN RADA</h1>
        <h2>${plan.predmet} - ${plan.razredi.join(', ')} razred</h2>
        <p>Školska godina: ${plan.schoolYear}</p>
      </div>

      <div class="section">
        <h3>Osnovni podaci</h3>
        <table class="info-table">
          <tr><td>Nastavnik:</td><td>${plan.teacherId.ime} ${plan.teacherId.prezime}</td></tr>
          <tr><td>Škola:</td><td>${plan.schoolId.naziv}</td></tr>
          <tr><td>Tip škole:</td><td>${plan.schoolId.tip}</td></tr>
          <tr><td>Predmet:</td><td>${plan.predmet}</td></tr>
          <tr><td>Razredi:</td><td>${plan.razredi.join(', ')}</td></tr>
          <tr><td>Nedeljni fond:</td><td>${plan.nedeljniFond} časova</td></tr>
          <tr><td>Ukupni fond:</td><td>${plan.ukupniFond} časova</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>Glavni ciljevi školske godine</h3>
        <ul>
          ${plan.glavniCiljevi.map(cilj => `<li>${cilj}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h3>Raspodela nastavnih jedinica po mesecima</h3>
        <table class="outcomes-table">
          <thead>
            <tr>
              <th>Jedinica</th>
              <th>Mesec</th>
              <th>Časovi</th>
              <th>Ishodi učenja</th>
            </tr>
          </thead>
          <tbody>
            ${plan.learningOutcomes.map(outcome => `
              <tr>
                <td>${outcome.jedinica}</td>
                <td>${outcome.mesec}</td>
                <td>${outcome.casovi}</td>
                <td>${outcome.ishodi.join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3>Plan ocenjivanja</h3>
        ${plan.assessmentPlan.map(assessment => `
          <div class="assessment-item">
            <strong>${assessment.tip}:</strong> ${assessment.opis}<br>
            <strong>Mesec:</strong> ${assessment.mesec} | <strong>Časovi:</strong> ${assessment.casovi}
          </div>
        `).join('')}
      </div>

      ${plan.dodatnaNastava && plan.dodatnaNastava.opis ? `
      <div class="section">
        <h3>Dodatna nastava</h3>
        <p>${plan.dodatnaNastava.opis}</p>
        <p><strong>Časovi:</strong> ${plan.dodatnaNastava.casovi} | <strong>Mesec:</strong> ${plan.dodatnaNastava.mesec}</p>
      </div>
      ` : ''}

      ${plan.extracurricular && plan.extracurricular.length > 0 ? `
      <div class="section">
        <h3>Vannastavne aktivnosti</h3>
        ${plan.extracurricular.map(activity => `
          <div class="assessment-item">
            <strong>${activity.aktivnost}:</strong> ${activity.opis}<br>
            <strong>Mesec:</strong> ${activity.mesec} | <strong>Časovi:</strong> ${activity.casovi}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${plan.professionalDevelopment && plan.professionalDevelopment.length > 0 ? `
      <div class="section">
        <h3>Stručno usavršavanje nastavnika</h3>
        ${plan.professionalDevelopment.map(pd => `
          <div class="assessment-item">
            <strong>${pd.aktivnost}:</strong> ${pd.opis}<br>
            <strong>Mesec:</strong> ${pd.mesec} | <strong>Časovi:</strong> ${pd.casovi}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${plan.napomene ? `
      <div class="section">
        <h3>Napomene</h3>
        <p>${plan.napomene}</p>
      </div>
      ` : ''}

      <div class="footer">
        <p>Generisano: ${new Date().toLocaleDateString('sr-RS')}</p>
        <p>Status: ${plan.status}</p>
      </div>
    </body>
    </html>
  `;
}

// Helper funkcija za generisanje HTML-a mesečnog plana
function generateMonthlyPlanHTML(plan) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mesečni plan - ${plan.mesec} ${plan.godina}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #333; }
        .header h2 { margin: 5px 0; color: #666; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px; border: 1px solid #ddd; }
        .info-table td:first-child { background-color: #f5f5f5; font-weight: bold; width: 30%; }
        .units-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .units-table th, .units-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        .units-table th { background-color: #f5f5f5; font-weight: bold; }
        .realization { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #28a745; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MESEČNI (OPERATIVNI) PLAN RADA</h1>
        <h2>${plan.annualPlanId.predmet} - ${plan.mesec} ${plan.godina}</h2>
      </div>

      <div class="section">
        <h3>Osnovni podaci</h3>
        <table class="info-table">
          <tr><td>Mesec:</td><td>${plan.mesec} ${plan.godina}</td></tr>
          <tr><td>Predmet:</td><td>${plan.annualPlanId.predmet}</td></tr>
          <tr><td>Razredi:</td><td>${plan.annualPlanId.razredi.join(', ')}</td></tr>
          <tr><td>Nedeljni fond:</td><td>${plan.nedeljniFond} časova</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>Ciljevi meseca</h3>
        <ul>
          ${plan.ciljeviMeseca.map(cilj => `<li>${cilj}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h3>Nedeljna razrada</h3>
        <table class="units-table">
          <thead>
            <tr>
              <th>Nedelja</th>
              <th>Jedinica</th>
              <th>Časovi</th>
              <th>Ciljevi</th>
              <th>Domaći zadaci</th>
              <th>Napomene</th>
            </tr>
          </thead>
          <tbody>
            ${plan.units.map(unit => `
              <tr>
                <td>${unit.nedelja}</td>
                <td>${unit.jedinica}</td>
                <td>${unit.casovi}</td>
                <td>${unit.ciljevi.join(', ')}</td>
                <td>${unit.domaci}</td>
                <td>${unit.napomene}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${plan.assessmentEvents && plan.assessmentEvents.length > 0 ? `
      <div class="section">
        <h3>Plan ocenjivanja u mesecu</h3>
        <ul>
          ${plan.assessmentEvents.map(event => `
            <li><strong>${event.tip}:</strong> ${event.opis} - ${event.datum ? new Date(event.datum).toLocaleDateString('sr-RS') : 'TBD'}</li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <div class="realization">
        <h3>Realizacija</h3>
        <p><strong>Procenat ostvarenosti:</strong> ${plan.realizacija.procenat}%</p>
        ${plan.realizacija.komentari ? `<p><strong>Komentari:</strong> ${plan.realizacija.komentari}</p>` : ''}
        ${plan.realizacija.odlozeno && plan.realizacija.odlozeno.length > 0 ? `
          <p><strong>Odloženo:</strong> ${plan.realizacija.odlozeno.join(', ')}</p>
        ` : ''}
        ${plan.realizacija.nadoknada ? `<p><strong>Nadoknada:</strong> ${plan.realizacija.nadoknada}</p>` : ''}
      </div>

      ${plan.napomene ? `
      <div class="section">
        <h3>Napomene</h3>
        <p>${plan.napomene}</p>
      </div>
      ` : ''}

      <div class="footer">
        <p>Generisano: ${new Date().toLocaleDateString('sr-RS')}</p>
        <p>Status: ${plan.status}</p>
      </div>
    </body>
    </html>
  `;
}

// Helper funkcija za generisanje HTML-a pripreme za čas
function generateLessonPrepHTML(prep) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Priprema za čas - ${prep.datum.toLocaleDateString('sr-RS')}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #333; }
        .header h2 { margin: 5px 0; color: #666; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px; border: 1px solid #ddd; }
        .info-table td:first-child { background-color: #f5f5f5; font-weight: bold; width: 30%; }
        .activities-list { list-style-type: none; padding: 0; }
        .activities-list li { padding: 5px 0; border-bottom: 1px solid #eee; }
        .differentiation { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ffc107; }
        .assessment { background-color: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PRIprema za čas</h1>
        <h2>${prep.tema} - ${prep.datum.toLocaleDateString('sr-RS')}</h2>
      </div>

      <div class="section">
        <h3>Osnovni podaci</h3>
        <table class="info-table">
          <tr><td>Datum:</td><td>${prep.datum.toLocaleDateString('sr-RS')}</td></tr>
          <tr><td>Razred:</td><td>${prep.razred}</td></tr>
          <tr><td>Redni broj časa:</td><td>${prep.redniBrojCasa}</td></tr>
          <tr><td>Tema:</td><td>${prep.tema}</td></tr>
          <tr><td>Trajanje:</td><td>${prep.trajanje} minuta</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>Cilj časa</h3>
        <p>${prep.ciljCasa}</p>
      </div>

      <div class="section">
        <h3>Ishod učenja</h3>
        <p>${prep.ishodUcenja}</p>
      </div>

      <div class="section">
        <h3>Metoda i aktivnosti</h3>
        <p><strong>Metoda:</strong> ${prep.metoda}</p>
        <h4>Aktivnosti:</h4>
        <ul class="activities-list">
          ${prep.aktivnosti.map(activity => `<li>• ${activity}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h3>Sredstva i materijali</h3>
        <ul>
          ${prep.sredstva.map(sredstvo => `<li>${sredstvo}</li>`).join('')}
        </ul>
        ${prep.materijali && prep.materijali.length > 0 ? `
          <h4>Materijali:</h4>
          <ul>
            ${prep.materijali.map(materijal => `<li>${materijal}</li>`).join('')}
          </ul>
        ` : ''}
      </div>

      <div class="assessment">
        <h3>Procena i zadaci</h3>
        <p><strong>Tip procene:</strong> ${prep.procena.tip}</p>
        <p><strong>Kriterijumi ocenjivanja:</strong></p>
        <ul>
          ${prep.procena.kriterijumi.map(kriterijum => `<li>${kriterijum}</li>`).join('')}
        </ul>
        <p><strong>Zadatak za učenike:</strong> ${prep.procena.zadatak}</p>
        <p><strong>Domaći zadatak:</strong> ${prep.domaci}</p>
      </div>

      <div class="differentiation">
        <h3>Diferencijacija</h3>
        ${prep.diferencijacija.zaNapredne ? `<p><strong>Za napredne učenike:</strong> ${prep.diferencijacija.zaNapredne}</p>` : ''}
        ${prep.diferencijacija.zaSpore ? `<p><strong>Za sporije učenike:</strong> ${prep.diferencijacija.zaSpore}</p>` : ''}
        ${prep.diferencijacija.individualniPristup ? `<p><strong>Individualni pristup:</strong> ${prep.diferencijacija.individualniPristup}</p>` : ''}
      </div>

      ${prep.napomene ? `
      <div class="section">
        <h3>Napomene</h3>
        <p>${prep.napomene}</p>
      </div>
      ` : ''}

      ${prep.realizovano ? `
      <div class="section">
        <h3>Realizacija časa</h3>
        <p><strong>Status:</strong> ${prep.realizovano ? 'Realizovano' : 'Nije realizovano'}</p>
        <p><strong>Procenat ostvarenja:</strong> ${prep.procenatOstvarenja}%</p>
        ${prep.komentariRealizacije ? `<p><strong>Komentari:</strong> ${prep.komentariRealizacije}</p>` : ''}
      </div>
      ` : ''}

      <div class="footer">
        <p>Generisano: ${new Date().toLocaleDateString('sr-RS')}</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;