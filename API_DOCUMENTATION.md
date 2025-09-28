# API Dokumentacija - Nastavnik Planner MVP

Kompletna dokumentacija za REST API endpoints.

## 🔗 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Autentifikacija

Svi protected endpoints zahtevaju JWT token u Authorization header-u:

```
Authorization: Bearer <jwt-token>
```

## 📚 Endpoints

### Autentifikacija

#### POST /auth/register
Registracija novog nastavnika.

**Request Body:**
```json
{
  "ime": "Marko",
  "prezime": "Marković",
  "email": "marko.markovic@email.com",
  "password": "password123",
  "predmet": "Matematika",
  "razredi": ["I", "II"],
  "schoolId": "64a1b2c3d4e5f6789abcdef0",
  "kontakt": {
    "telefon": "+381123456789",
    "adresa": "Knez Mihailova 1, Beograd"
  }
}
```

**Response:**
```json
{
  "message": "Nastavnik uspešno registrovan",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "teacher": {
    "id": "64a1b2c3d4e5f6789abcdef1",
    "ime": "Marko",
    "prezime": "Marković",
    "email": "marko.markovic@email.com",
    "predmet": "Matematika",
    "razredi": ["I", "II"],
    "role": "teacher"
  }
}
```

#### POST /auth/login
Prijava nastavnika.

**Request Body:**
```json
{
  "email": "marko.markovic@email.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Uspešna prijava",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "teacher": {
    "id": "64a1b2c3d4e5f6789abcdef1",
    "ime": "Marko",
    "prezime": "Marković",
    "email": "marko.markovic@email.com",
    "predmet": "Matematika",
    "razredi": ["I", "II"],
    "role": "teacher"
  }
}
```

#### GET /auth/me
Dobijanje trenutnog nastavnika.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "teacher": {
    "id": "64a1b2c3d4e5f6789abcdef1",
    "ime": "Marko",
    "prezime": "Marković",
    "email": "marko.markovic@email.com",
    "predmet": "Matematika",
    "razredi": ["I", "II"],
    "role": "teacher",
    "schoolId": "64a1b2c3d4e5f6789abcdef0"
  }
}
```

### Godišnji planovi

#### GET /annual-plans
Dobijanje svih godišnjih planova nastavnika.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "_id": "64a1b2c3d4e5f6789abcdef2",
    "predmet": "Matematika",
    "razredi": ["II"],
    "schoolYear": "2025/2026",
    "nedeljniFond": 4,
    "ukupniFond": 144,
    "status": "draft",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "schoolId": {
      "_id": "64a1b2c3d4e5f6789abcdef0",
      "naziv": "Gimnazija 'Sveti Sava'",
      "tip": "Gimnazija"
    }
  }
]
```

#### POST /annual-plans
Kreiranje novog godišnjeg plana.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "predmet": "Matematika",
  "razredi": ["II"],
  "nedeljniFond": 4,
  "ukupniFond": 144,
  "glavniCiljevi": [
    "Savladavanje algebarskih izraza",
    "Uvođenje trigonometrije"
  ],
  "learningOutcomes": [
    {
      "jedinica": "Algebra - Polinomi",
      "ishodi": [
        "Učenik razlikuje stepen polinoma",
        "Učenik izvršava osnovne operacije nad polinomima"
      ],
      "casovi": 16,
      "mesec": "Septembar",
      "nedelje": ["1", "2", "3", "4"]
    }
  ],
  "assessmentPlan": [
    {
      "tip": "formativno",
      "opis": "Kratki kvizovi svakih 3 nedelje",
      "mesec": "Septembar",
      "casovi": 2
    }
  ],
  "dodatnaNastava": {
    "opis": "Konsultacije za učenike",
    "casovi": 2,
    "mesec": "Oktobar"
  },
  "extracurricular": [
    {
      "aktivnost": "Matematički klub",
      "mesec": "Oktobar",
      "casovi": 8,
      "opis": "Mesečni sastanci kluba"
    }
  ],
  "professionalDevelopment": [
    {
      "aktivnost": "Kurs diferencirane nastave",
      "mesec": "Oktobar",
      "casovi": 16,
      "opis": "Usavršavanje u primeni diferencirane nastave"
    }
  ],
  "napomene": "Plan je prilagođen za gimnazijski program"
}
```

**Response:**
```json
{
  "message": "Godišnji plan uspešno kreiran",
  "plan": {
    "_id": "64a1b2c3d4e5f6789abcdef2",
    "predmet": "Matematika",
    "razredi": ["II"],
    "schoolYear": "2025/2026",
    "nedeljniFond": 4,
    "ukupniFond": 144,
    "status": "draft",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### GET /annual-plans/:id
Dobijanje određenog godišnjeg plana.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "_id": "64a1b2c3d4e5f6789abcdef2",
  "predmet": "Matematika",
  "razredi": ["II"],
  "schoolYear": "2025/2026",
  "nedeljniFond": 4,
  "ukupniFond": 144,
  "glavniCiljevi": [
    "Savladavanje algebarskih izraza",
    "Uvođenje trigonometrije"
  ],
  "learningOutcomes": [
    {
      "jedinica": "Algebra - Polinomi",
      "ishodi": [
        "Učenik razlikuje stepen polinoma",
        "Učenik izvršava osnovne operacije nad polinomima"
      ],
      "casovi": 16,
      "mesec": "Septembar",
      "nedelje": ["1", "2", "3", "4"]
    }
  ],
  "assessmentPlan": [
    {
      "tip": "formativno",
      "opis": "Kratki kvizovi svakih 3 nedelje",
      "mesec": "Septembar",
      "casovi": 2
    }
  ],
  "status": "draft",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "schoolId": {
    "_id": "64a1b2c3d4e5f6789abcdef0",
    "naziv": "Gimnazija 'Sveti Sava'",
    "tip": "Gimnazija"
  }
}
```

#### PUT /annual-plans/:id
Ažuriranje godišnjeg plana.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "glavniCiljevi": [
    "Savladavanje algebarskih izraza",
    "Uvođenje trigonometrije",
    "Razvoj veštine rešavanja problema"
  ],
  "napomene": "Ažurirane napomene"
}
```

#### POST /annual-plans/:id/submit
Slanje plana na odobrenje.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Plan poslat na odobrenje",
  "plan": {
    "_id": "64a1b2c3d4e5f6789abcdef2",
    "status": "submitted",
    "submittedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

#### POST /annual-plans/:id/comment
Dodavanje komentara na plan.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "text": "Odličan plan, samo bih dodao više vežbanja za trigonometriju"
}
```

### Mesečni planovi

#### GET /monthly-plans
Dobijanje svih mesečnih planova nastavnika.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `year` (optional): Godina
- `month` (optional): Mesec

**Response:**
```json
[
  {
    "_id": "64a1b2c3d4e5f6789abcdef3",
    "mesec": "Oktobar",
    "godina": 2025,
    "nedeljniFond": 4,
    "realizacija": {
      "procenat": 85,
      "komentari": "Mesec je prošao uspešno",
      "odlozeno": ["Jedan čas zbog ekskurzije"],
      "nadoknada": "Odloženi čas će biti nadoknađen"
    },
    "status": "in_progress",
    "annualPlanId": {
      "_id": "64a1b2c3d4e5f6789abcdef2",
      "predmet": "Matematika",
      "razredi": ["II"],
      "schoolYear": "2025/2026"
    }
  }
]
```

#### GET /monthly-plans/:id
Dobijanje određenog mesečnog plana.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "_id": "64a1b2c3d4e5f6789abcdef3",
  "mesec": "Oktobar",
  "godina": 2025,
  "nedeljniFond": 4,
  "ciljeviMeseca": [
    "Završetak poglavlja 'Racionalni izrazi'",
    "Početak rada na trigonometriji"
  ],
  "units": [
    {
      "jedinica": "Racionalni izrazi - Pojednostavljivanje",
      "nedelja": "1",
      "casovi": 4,
      "ciljevi": [
        "Učenik pojednostavljuje racionalne izraze",
        "Učenik identifikuje zajedničke faktore"
      ],
      "domaci": "Vežbe 1-5 iz udžbenika",
      "napomene": "Posebna pažnja na učenike sa poteškoćama"
    }
  ],
  "assessmentEvents": [
    {
      "tip": "formativno",
      "datum": "2025-10-15T00:00:00.000Z",
      "opis": "Kratki kviz - pojednostavljivanje racionalnih izraza",
      "casovi": 1
    }
  ],
  "realizacija": {
    "procenat": 85,
    "komentari": "Mesec je prošao uspešno",
    "odlozeno": ["Jedan čas zbog ekskurzije"],
    "nadoknada": "Odloženi čas će biti nadoknađen"
  },
  "status": "in_progress"
}
```

#### PUT /monthly-plans/:id
Ažuriranje mesečnog plana.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "ciljeviMeseca": [
    "Završetak poglavlja 'Racionalni izrazi'",
    "Početak rada na trigonometriji",
    "Priprema za polugodišnji test"
  ],
  "napomene": "Ažurirane napomene za mesec"
}
```

#### PUT /monthly-plans/:id/realization
Ažuriranje realizacije mesečnog plana.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "procenat": 90,
  "komentari": "Odličan napredak učenika",
  "odlozeno": ["Dva časa zbog školske ekskurzije"],
  "nadoknada": "Odloženi časovi će biti nadoknađeni sledeće nedelje"
}
```

#### POST /monthly-plans/:id/regenerate
Regenerisanje mesečnog plana iz godišnjeg.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Mesečni plan regenerisan",
  "plan": {
    "_id": "64a1b2c3d4e5f6789abcdef3",
    "units": [
      {
        "jedinica": "Racionalni izrazi - Pojednostavljivanje",
        "nedelja": "1",
        "casovi": 4,
        "ciljevi": [
          "Učenik pojednostavljuje racionalne izraze",
          "Učenik identifikuje zajedničke faktore"
        ],
        "domaci": "",
        "napomene": ""
      }
    ]
  }
}
```

### Pripreme za čas

#### GET /lesson-preps
Dobijanje svih priprema za čas nastavnika.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `month` (optional): Mesec
- `year` (optional): Godina
- `razred` (optional): Razred

**Response:**
```json
[
  {
    "_id": "64a1b2c3d4e5f6789abcdef4",
    "datum": "2025-10-15T00:00:00.000Z",
    "razred": "II",
    "tema": "Racionalni izrazi - Sabiranje i oduzimanje",
    "ciljCasa": "Učenici će naučiti da sabiraju i oduzimaju racionalne izraze",
    "realizovano": true,
    "procenatOstvarenja": 90,
    "monthlyPlanId": {
      "_id": "64a1b2c3d4e5f6789abcdef3",
      "mesec": "Oktobar",
      "godina": 2025
    }
  }
]
```

#### POST /lesson-preps
Kreiranje nove pripreme za čas.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "monthlyPlanId": "64a1b2c3d4e5f6789abcdef3",
  "datum": "2025-10-15",
  "razred": "II",
  "redniBrojCasa": 3,
  "tema": "Racionalni izrazi - Sabiranje i oduzimanje",
  "ciljCasa": "Učenici će naučiti da sabiraju i oduzimaju racionalne izraze pronalaženjem zajedničkog imenioca",
  "ishodUcenja": "Na kraju časa, učenik će moći da sabere i oduzme dva racionalna izraza sa različitim imeniocima",
  "metoda": "Kombinovana metoda - predavanje sa aktivnim učešćem učenika",
  "aktivnosti": [
    "Pregled prethodnog gradiva",
    "Uvod u sabiranje racionalnih izraza",
    "Rešavanje primera na tabli",
    "Rad u parovima"
  ],
  "sredstva": [
    "Tabla i marker",
    "Udžbenik matematike",
    "Radni listovi sa zadacima"
  ],
  "materijali": [
    "Radni list 'Sabiranje i oduzimanje racionalnih izraza'",
    "Primeri sa rešenjima"
  ],
  "procena": {
    "tip": "formativna",
    "kriterijumi": [
      "Tačnost u pronalaženju zajedničkog imenioca",
      "Korektnost primene pravila za sabiranje/oduzimanje"
    ],
    "zadatak": "Rešiti 5 zadataka sa sabiranjem i oduzimanjem racionalnih izraza"
  },
  "trajanje": 45,
  "diferencijacija": {
    "zaNapredne": "Dodatni zadaci sa složenijim racionalnim izrazima",
    "zaSpore": "Dodatno objašnjenje korak po korak",
    "individualniPristup": "Marija Petrović - dodatna podrška"
  },
  "domaci": "Vežbe 6-10 iz udžbenika, strana 48-50",
  "napomene": "Posebna pažnja na učenike koji imaju poteškoće sa algebrom"
}
```

#### GET /lesson-preps/:id
Dobijanje određene pripreme za čas.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### PUT /lesson-preps/:id
Ažuriranje pripreme za čas.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### PUT /lesson-preps/:id/realization
Označavanje realizacije časa.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "realizovano": true,
  "komentariRealizacije": "Čas je prošao veoma dobro. Učenici su aktivno učestvovali.",
  "procenatOstvarenja": 90
}
```

#### DELETE /lesson-preps/:id
Brisanje pripreme za čas.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Export

#### POST /export/annual-plan/:id/pdf
Export godišnjeg plana u PDF.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="godisnji-plan-Matematika-2025-2026.pdf"

[PDF content]
```

#### POST /export/monthly-plan/:id/pdf
Export mesečnog plana u PDF.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### POST /export/lesson-prep/:id/pdf
Export pripreme za čas u PDF.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Škole

#### GET /schools
Dobijanje svih škola.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "_id": "64a1b2c3d4e5f6789abcdef0",
    "naziv": "Gimnazija 'Sveti Sava'",
    "tip": "Gimnazija",
    "adresa": "Knez Mihailova 1",
    "grad": "Beograd",
    "fondGodisnji": 144,
    "fondNedeljni": 4,
    "nastavniDani": 36
  }
]
```

#### GET /schools/:id
Dobijanje određene škole.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Nastavnici

#### GET /teachers
Dobijanje svih nastavnika (samo admin).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### GET /teachers/school/:schoolId
Dobijanje nastavnika određene škole.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

## 📊 Status kodovi

| Kod | Opis |
|-----|------|
| 200 | OK - Uspešan zahtev |
| 201 | Created - Resurs uspešno kreiran |
| 400 | Bad Request - Neispravni podaci |
| 401 | Unauthorized - Nije autentifikovan |
| 403 | Forbidden - Nedovoljne dozvole |
| 404 | Not Found - Resurs nije pronađen |
| 500 | Internal Server Error - Greška na serveru |

## 🔒 Error handling

Svi errori vraćaju JSON odgovor u sledećem formatu:

```json
{
  "message": "Opis greške",
  "error": "Detaljni opis greške (samo u development mode-u)"
}
```

### Primeri grešaka

#### 400 Bad Request
```json
{
  "message": "Greška pri validaciji",
  "errors": [
    {
      "field": "email",
      "message": "Email nije validan"
    },
    {
      "field": "password",
      "message": "Lozinka mora imati najmanje 6 karaktera"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "message": "Token nije validan"
}
```

#### 404 Not Found
```json
{
  "message": "Plan nije pronađen"
}
```

## 🧪 Testiranje API-ja

### Postman Collection
Importujte Postman collection sa svim endpoint-ima:
[Download Postman Collection](postman-collection.json)

### cURL primeri

#### Registracija
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "ime": "Marko",
    "prezime": "Marković",
    "email": "marko@example.com",
    "password": "password123",
    "predmet": "Matematika",
    "razredi": ["II"],
    "schoolId": "64a1b2c3d4e5f6789abcdef0"
  }'
```

#### Kreiranje godišnjeg plana
```bash
curl -X POST http://localhost:5000/api/annual-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "predmet": "Matematika",
    "razredi": ["II"],
    "nedeljniFond": 4,
    "ukupniFond": 144,
    "glavniCiljevi": ["Savladavanje algebarskih izraza"]
  }'
```

## 📈 Rate Limiting

API implementira rate limiting:
- 100 zahteva po minutu po IP adresi
- 1000 zahteva po minutu za autentifikovane korisnike

## 🔄 Paginacija

Za list endpoints, koristite query parametre:
- `page` - broj stranice (default: 1)
- `limit` - broj elemenata po stranici (default: 10)

Primer:
```
GET /api/annual-plans?page=2&limit=5
```

## 🔍 Filtering i Search

### Godišnji planovi
- `status` - filter po statusu (draft/submitted/approved)
- `predmet` - filter po predmetu
- `schoolYear` - filter po školske godine

### Mesečni planovi
- `year` - filter po godini
- `month` - filter po mesecu
- `status` - filter po statusu

### Pripreme za čas
- `month` - filter po mesecu
- `year` - filter po godini
- `razred` - filter po razredu
- `realizovano` - filter po realizaciji

## 📝 Changelog

### v1.0.0 (2025-01-15)
- Inicijalna verzija API-ja
- Osnovni CRUD operacije za sve entitete
- JWT autentifikacija
- PDF export funkcionalnost
- Rate limiting

---

**Napomena**: Ova dokumentacija se ažurira sa svakom novom verzijom API-ja. Za najnovije informacije, proverite GitHub repository.