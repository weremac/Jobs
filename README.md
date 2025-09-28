# Nastavnik Planner MVP

Digitalni alat za nastavnike srednjih škola u Srbiji - godišnji i mesečni planovi rada.

## 📋 Pregled

Nastavnik Planner je MVP (Minimum Viable Product) aplikacija dizajnirana da pomogne nastavnicima srednjih škola u Srbiji da brzo i pravilno naprave godišnje (globalne) i mesečne (operativne) planove rada. Aplikacija smanjuje administrativno opterećenje, povećava ujednačenost planova i olakšava praćenje ostvarenja ishoda i ocenjivanja.

## 🎯 Cilj

Omogućiti nastavnicima srednjih škola u Srbiji da za 30–60 minuta naprave važeći, kompletan i dokaziv godišnji plan i automatski iz njega generišu mesečne planove i pripreme za čas.

## 👥 Primarni korisnici

- **Nastavnici** (gimnazija, stručne škole) — glavni korisnik
- **Rukovodstvo škole** (razredni starešina, odeljenjski starešina, direktor) — pregled i odobrenje
- **Pedagoški rukovodioci / Zavod** (uvid / primeri)

## ✨ Ključne funkcionalnosti

### A. Kreiranje godišnjeg (globalnog) plana
- Polja: ime nastavnika, predmet, razredi/odeljenja, fond časova (nedeljni i godišnji)
- Ishodi po jedinicama (preuzeto iz nastavnog programa)
- Ključni ciljevi školske godine
- Raspodela nastavnih jedinica po mesecima/sekcijama
- Plan ocenjivanja (formativno/summativno)
- Plan dodatne i dopunske nastave
- Vannastavne aktivnosti
- Stručni razvoj

### B. Generisanje mesečnih (operativnih) planova
- Automatsko iz godišnjeg: predložen raspored nastavnih jedinica po nedeljama i časovima
- Mogućnost ručne korekcije
- Polje „ocenjivanje i zadaci za taj mesec"
- Evidencija ostvarivanja (procenat izvršenosti)

### C. Priprema za čas (dnevna priprema)
- Šablon: cilj časa, ishod učenja (konkretan), metoda/aktivnosti
- Sredstva i materijali, procena i zadatak za učenike
- Trajanje, diferencijacija za različite učenike
- Kriterijumi ocenjivanja

### D. Praćenje i izveštavanje
- Status po stavci (planirano/realizovano/odloženo)
- Dnevnik napretka (kratki unos nakon časa)
- Automatski generisani mesečni izveštaj i godišnji PDF za školu
- Mogućnost da nastavnik doda napomene vezane za izostanke, saradnju sa roditeljima, dodatnu nastavu

### E. Uvoz/izvoz i štampa
- Export u PDF (format koji škola prihvata), Word i standardizovani obrazac (ZUOV / školski obrazac)
- Import ranijih planova kao predložak

### F. Kolaboracija i odobrenje
- Poslati plan rukovodstvu na pregled/odobrenje
- Komentar/feedback
- Verzije (history)

### G. Lokalizacija i pravni okvir
- Preddefinisani profili za gimnaziju / strukovne smerove (različiti fondovi i ishodi)
- Sadržaj povezan sa važećim pravilnicima omogućava validnost plana

## 🛠 Tehnologije

### Backend
- **Node.js** sa Express.js
- **MongoDB** sa Mongoose ODM
- **JWT** za autentifikaciju
- **Puppeteer** za PDF generisanje
- **Nodemailer** za email funkcionalnost

### Frontend
- **React 18** sa React Router
- **Tailwind CSS** za styling
- **Axios** za API komunikaciju
- **React Hook Form** za forme
- **React Toastify** za notifikacije
- **Lucide React** za ikone

### Baza podataka
- **MongoDB** - NoSQL baza podataka
- **Mongoose** - ODM za MongoDB

## 📁 Struktura projekta

```
nastavnik-planner-mvp/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React komponente
│   │   ├── pages/         # Stranice aplikacije
│   │   ├── context/       # React Context (Auth)
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # Mongoose modeli
│   ├── routes/            # API rute
│   ├── middleware/        # Express middleware
│   └── index.js
├── examples/              # Primeri šablona
└── README.md
```

## 🚀 Instalacija i pokretanje

### Preduslovi
- Node.js (v16 ili noviji)
- MongoDB (lokalno ili MongoDB Atlas)
- npm ili yarn

### 1. Kloniranje repozitorija
```bash
git clone <repository-url>
cd nastavnik-planner-mvp
```

### 2. Instalacija dependencija
```bash
# Instalacija svih dependencija
npm run install-all

# Ili ručno:
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Konfiguracija environment varijabli
```bash
# Kopiraj .env.example u .env
cp server/.env.example server/.env

# Uredi server/.env sa svojim vrednostima:
MONGODB_URI=mongodb://localhost:27017/nastavnik-planner
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

### 4. Pokretanje aplikacije
```bash
# Pokretanje i backend i frontend istovremeno
npm run dev

# Ili ručno:
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

### 5. Pristup aplikaciji
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Podatkovni model

### Teacher (Nastavnik)
```javascript
{
  ime: String,
  prezime: String,
  email: String (unique),
  predmet: String,
  razredi: [String],
  schoolId: ObjectId,
  password: String,
  role: String (teacher/admin/principal)
}
```

### School (Škola)
```javascript
{
  naziv: String,
  tip: String (Gimnazija/Stručna škola/...),
  adresa: String,
  grad: String,
  fondGodisnji: Number,
  fondNedeljni: Number,
  nastavniDani: Number
}
```

### AnnualPlan (Godišnji plan)
```javascript
{
  teacherId: ObjectId,
  schoolId: ObjectId,
  schoolYear: String,
  predmet: String,
  razredi: [String],
  nedeljniFond: Number,
  ukupniFond: Number,
  glavniCiljevi: [String],
  learningOutcomes: [LearningOutcome],
  assessmentPlan: [AssessmentPlan],
  dodatnaNastava: Object,
  extracurricular: [Object],
  professionalDevelopment: [Object],
  status: String (draft/submitted/approved/rejected)
}
```

### MonthlyPlan (Mesečni plan)
```javascript
{
  annualPlanId: ObjectId,
  teacherId: ObjectId,
  mesec: String,
  godina: Number,
  nedeljniFond: Number,
  ciljeviMeseca: [String],
  units: [WeeklyUnit],
  assessmentEvents: [AssessmentEvent],
  realizacija: {
    procenat: Number,
    komentari: String,
    odlozeno: [String],
    nadoknada: String
  }
}
```

### LessonPrep (Priprema za čas)
```javascript
{
  monthlyPlanId: ObjectId,
  teacherId: ObjectId,
  datum: Date,
  razred: String,
  tema: String,
  ciljCasa: String,
  ishodUcenja: String,
  metoda: String,
  aktivnosti: [String],
  sredstva: [String],
  materijali: [String],
  procena: Object,
  trajanje: Number,
  diferencijacija: Object,
  domaci: String,
  realizovano: Boolean,
  procenatOstvarenja: Number
}
```

## 🔌 API Endpoints

### Autentifikacija
- `POST /api/auth/register` - Registracija nastavnika
- `POST /api/auth/login` - Prijava nastavnika
- `GET /api/auth/me` - Dobijanje trenutnog nastavnika

### Godišnji planovi
- `GET /api/annual-plans` - Lista godišnjih planova
- `POST /api/annual-plans` - Kreiranje novog plana
- `GET /api/annual-plans/:id` - Dohvatanje određenog plana
- `PUT /api/annual-plans/:id` - Ažuriranje plana
- `POST /api/annual-plans/:id/submit` - Slanje na odobrenje
- `POST /api/annual-plans/:id/comment` - Dodavanje komentara

### Mesečni planovi
- `GET /api/monthly-plans` - Lista mesečnih planova
- `GET /api/monthly-plans/:id` - Dohvatanje određenog mesečnog plana
- `PUT /api/monthly-plans/:id` - Ažuriranje mesečnog plana
- `PUT /api/monthly-plans/:id/realization` - Ažuriranje realizacije
- `POST /api/monthly-plans/:id/regenerate` - Regenerisanje iz godišnjeg

### Pripreme za čas
- `GET /api/lesson-preps` - Lista priprema
- `POST /api/lesson-preps` - Kreiranje pripreme
- `GET /api/lesson-preps/:id` - Dohvatanje pripreme
- `PUT /api/lesson-preps/:id` - Ažuriranje pripreme
- `PUT /api/lesson-preps/:id/realization` - Označavanje realizacije

### Export
- `POST /api/export/annual-plan/:id/pdf` - Export godišnjeg plana u PDF
- `POST /api/export/monthly-plan/:id/pdf` - Export mesečnog plana u PDF
- `POST /api/export/lesson-prep/:id/pdf` - Export pripreme u PDF

## 📝 Primeri korišćenja

### Kreiranje godišnjeg plana
1. Prijavite se kao nastavnik
2. Idite na "Novi plan" u glavnom meniju
3. Popunite wizard korak po korak:
   - Osnovni podaci (predmet, razredi, fond časova)
   - Glavni ciljevi školske godine
   - Ishodi učenja po mesecima
   - Plan ocenjivanja
   - Dodatne aktivnosti
   - Pregled i čuvanje

### Generisanje mesečnih planova
Mesečni planovi se automatski generišu iz godišnjeg plana. Možete ih:
- Pregledati u dashboard-u
- Ažurirati realizaciju
- Regenerisati iz godišnjeg plana
- Exportovati u PDF

### Kreiranje pripreme za čas
1. Idite na "Pripreme" u glavnom meniju
2. Popunite formu sa:
   - Osnovnim podacima (datum, razred, tema)
   - Ciljevima i ishodima
   - Metodama i aktivnostima
   - Sredstvima i materijalima
   - Procenom i zadacima
   - Diferencijacijom

## 🎨 UI/UX karakteristike

- **Responsive dizajn** - radi na desktop i mobilnim uređajima
- **Intuitivni wizard** - korak-po-korak kreiranje godišnjeg plana
- **Real-time validacija** - trenutna provera unesenih podataka
- **Drag & drop** funkcionalnost za reorganizaciju elemenata
- **PDF export** - profesionalni izgled za štampu
- **Dark/Light mode** - prilagođavanje korisničkim preferencama

## 🔒 Bezbednost

- **JWT autentifikacija** - sigurna prijava i sesije
- **Bcrypt hashovanje** - sigurno čuvanje lozinki
- **Input validacija** - sprečavanje SQL injection i XSS napada
- **CORS konfiguracija** - kontrolisani pristup API-ju
- **Environment varijable** - sigurno čuvanje osetljivih podataka

## 📈 Metrike uspeha (prvih 3 meseca)

- **Dnevna upotreba**: cilj 100+ nastavnika / pilot škola
- **Vreme izrade godišnjeg plana**: saštedeti bar 50% vremena u odnosu na ručno pisanje
- **% planova koji su poslati na odobrenje digitalno**: cilj >70%
- **Ocena korisničkog zadovoljstva (NPS)**: >= +30

## 🚧 Kriterijumi prihvatanja MVP

- [x] Nastavnik može da kreira jedan validan godišnji plan i automatski dobije predlog mesečnih planova
- [x] Mesečni plan može da se izmeni i eksportuje u PDF u formatu školskog obrasca
- [x] Postoji šablon pripreme za čas koji sadrži: cilj časa, ishode, aktivnosti, sredstva i kriterijume ocenjivanja
- [x] Mogućnost slanja na odobrenje rukovodstvu i istorija verzija
- [x] Podaci o fondu časova i broju nastavnih dana po Pravilniku su ugrađeni kao parametri

## 🔮 Buduće verzije

### Verzija 2.0
- Integracija sa školskim rasporedom/EDU platformom
- Automatska sugestija diferencijacije na osnovu učenika
- Analitika učenja (koji ishodi su loše ostvareni)
- Marketplace šablona (deljenje planova između nastavnika)

### Verzija 3.0
- AI-powered preporuke za planiranje
- Integracija sa ocenjivačkim sistemom
- Mobilna aplikacija
- Offline funkcionalnost

## 📚 Relevantni izvori

- [Zavod za unapređivanje obrazovanja i vaspitanja](https://zuov.gov.rs) - obrasci za Godišnji (globalni) plan, Mesečni (operativni) plan i Pripremu za čas
- [Pravilnik o obrazovno-vaspitnom radu u srednjim školama](https://www.prosveta.gov.rs) - broj nastavnih dana, fondovi i pravila realizacije
- [Ministarstvo prosvete](https://www.prosveta.gov.rs) - stranice o srednjem obrazovanju i informatori o radu

## 🤝 Doprinos projektu

1. Fork repozitorij
2. Kreiraj feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit promene (`git commit -m 'Add some AmazingFeature'`)
4. Push na branch (`git push origin feature/AmazingFeature`)
5. Otvori Pull Request

## 📄 Licenca

Distribuiranje pod MIT licencom. Pogledajte `LICENSE` fajl za više informacija.

## 📞 Kontakt

- **Email**: support@nastavnikplanner.rs
- **Website**: https://nastavnikplanner.rs
- **GitHub**: https://github.com/nastavnikplanner/mvp

## 🙏 Zahvalnice

- Zavod za unapređivanje obrazovanja i vaspitanja za obrasce i smernice
- Ministarstvo prosvete za pravne okvire
- Nastavnici koji su učestvovali u testiranju i davanju povratnih informacija

---

**Napomena**: Ovo je MVP verzija aplikacije. Funkcionalnosti se kontinuirano poboljšavaju na osnovu povratnih informacija korisnika.