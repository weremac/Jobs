# 🚀 Brzo pokretanje - Nastavnik Planner MVP

Ovaj vodič će vas provesti kroz najbrži način da pokrenete Nastavnik Planner MVP aplikaciju.

## ⚡ 5-minutno pokretanje

### 1. Kloniranje i instalacija
```bash
# Kloniraj repozitorij
git clone <repository-url>
cd nastavnik-planner-mvp

# Instaliraj sve dependencije odjednom
npm run install-all
```

### 2. Konfiguracija baze podataka
```bash
# Kopiraj environment fajl
cp server/.env.example server/.env

# Uredi server/.env (opciono - radi i sa default vrednostima)
# MONGODB_URI=mongodb://localhost:27017/nastavnik-planner
# JWT_SECRET=your-super-secret-jwt-key-here
```

### 3. Pokretanje aplikacije
```bash
# Pokreni i backend i frontend istovremeno
npm run dev
```

### 4. Pristup aplikaciji
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 Prvi koraci

### 1. Registracija
1. Otvorite http://localhost:3000
2. Kliknite "Registrujte se"
3. Popunite formu sa vašim podacima
4. Izaberite školu iz liste

### 2. Kreiranje godišnjeg plana
1. Kliknite "Novi plan" na dashboard-u
2. Pratite wizard korak po korak:
   - **Korak 1**: Osnovni podaci (predmet, razredi, fond časova)
   - **Korak 2**: Glavni ciljevi školske godine
   - **Korak 3**: Ishodi učenja po mesecima
   - **Korak 4**: Plan ocenjivanja
   - **Korak 5**: Dodatne aktivnosti
   - **Korak 6**: Pregled i čuvanje

### 3. Pregled mesečnih planova
1. Mesečni planovi se automatski generišu iz godišnjeg
2. Pregledajte ih na dashboard-u
3. Ažurirajte realizaciju po potrebi

### 4. Kreiranje pripreme za čas
1. Kliknite "Pripreme" u glavnom meniju
2. Popunite formu sa detaljima časa
3. Sačuvajte pripremu

## 📊 Test podaci

Aplikacija dolazi sa primer šablonima u `examples/` direktorijumu:

- `godisnji-plan-primer.json` - Kompletan godišnji plan za matematiku
- `mesecni-plan-primer.json` - Mesečni plan za oktobar
- `priprema-cas-primer.json` - Priprema za čas

## 🔧 Česti problemi

### Problem: "Cannot connect to MongoDB"
**Rešenje**: 
```bash
# Instaliraj i pokreni MongoDB lokalno
# Ili koristi MongoDB Atlas (besplatno)
```

### Problem: "Port 3000 already in use"
**Rešenje**:
```bash
# Promeni port u client/package.json
# Ili zaustavi proces koji koristi port 3000
lsof -ti:3000 | xargs kill -9
```

### Problem: "Module not found"
**Rešenje**:
```bash
# Očisti i reinstaliraj dependencije
rm -rf node_modules package-lock.json
rm -rf server/node_modules server/package-lock.json
rm -rf client/node_modules client/package-lock.json
npm run install-all
```

## 🎨 Prilagođavanje

### Promena boja
Uredi `client/src/index.css` za custom CSS ili `client/tailwind.config.js` za Tailwind konfiguraciju.

### Dodavanje novih predmeta
Uredi `client/src/pages/Register.js` - niz `predmeti`.

### Promena škola
Dodaj škole kroz admin panel ili direktno u bazu podataka.

## 📱 Mobilna verzija

Aplikacija je responsive i radi na mobilnim uređajima. Za bolje iskustvo na mobilnim uređajima:

1. Otvorite u Chrome/Safari
2. Dodajte na početni ekran (PWA funkcionalnost)
3. Koristite landscape mode za forme

## 🔄 Backup i restore

### Backup baze podataka
```bash
# MongoDB backup
mongodump --db nastavnik-planner --out backup/
```

### Restore baze podataka
```bash
# MongoDB restore
mongorestore --db nastavnik-planner backup/nastavnik-planner/
```

## 📈 Monitoring

### Pregled logova
```bash
# Backend logovi
cd server && npm run dev

# Frontend logovi
cd client && npm start
```

### Database pregled
Koristite MongoDB Compass ili bilo koji MongoDB GUI alat za pregled podataka.

## 🚀 Deployment

Za produkciju, pogledajte [DEPLOYMENT.md](DEPLOYMENT.md) za detaljne instrukcije.

### Brzi Heroku deployment
```bash
# Instaliraj Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login i deploy
heroku login
heroku create nastavnik-planner-mvp
git push heroku main
```

## 🆘 Potrebna pomoć?

- **Dokumentacija**: [README.md](README.md)
- **API dokumentacija**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **GitHub Issues**: https://github.com/nastavnikplanner/mvp/issues
- **Email**: support@nastavnikplanner.rs

## ✅ Checklist za pokretanje

- [ ] Node.js v16+ instaliran
- [ ] MongoDB pokrenut (lokalno ili Atlas)
- [ ] Repozitorij kloniran
- [ ] Dependencije instalirane (`npm run install-all`)
- [ ] Environment varijable konfigurisane
- [ ] Aplikacija pokrenuta (`npm run dev`)
- [ ] Frontend dostupan na http://localhost:3000
- [ ] Backend dostupan na http://localhost:5000
- [ ] Registracija uspešna
- [ ] Prvi godišnji plan kreiran

---

**Napomena**: Ovo je MVP verzija aplikacije. Za produkciju, obavezno proverite [DEPLOYMENT.md](DEPLOYMENT.md) za sigurnosne i performanse preporuke.