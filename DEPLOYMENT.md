# Deployment Guide - Nastavnik Planner MVP

Ovaj vodič objašnjava kako da deploy-ujete Nastavnik Planner MVP aplikaciju na produkciju.

## 🚀 Opcije deployment-a

### 1. Lokalni deployment (Development)
Za lokalni razvoj i testiranje.

### 2. Cloud deployment (Produkcija)
Preporučene opcije za produkciju:
- **Heroku** - najjednostavniji za početak
- **DigitalOcean** - dobra cena/performanse
- **AWS** - najfleksibilniji
- **Vercel + MongoDB Atlas** - za React frontend

## 📋 Preduslovi

- Node.js v16+ instaliran
- MongoDB Atlas nalog (ili lokalni MongoDB)
- Git instaliran
- Heroku CLI (za Heroku deployment)

## 🔧 Konfiguracija za produkciju

### 1. Environment varijable

Kreirajte `.env` fajl u `server/` direktorijumu:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nastavnik-planner-prod

# JWT Secret (generiši jaku lozinku)
JWT_SECRET=your-super-secret-jwt-key-for-production-here

# Server
PORT=5000
NODE_ENV=production

# Email (opciono)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. MongoDB Atlas konfiguracija

1. Idite na [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Kreirajte novi cluster
3. Kreirajte korisnika baze podataka
4. Kopirajte connection string
5. Dodajte IP adresu u whitelist

## 🌐 Heroku Deployment

### 1. Priprema aplikacije

```bash
# U root direktorijumu
npm run build

# Kreiraj Procfile u root direktorijumu
echo "web: cd server && npm start" > Procfile
```

### 2. Heroku setup

```bash
# Instaliraj Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login na Heroku
heroku login

# Kreiraj Heroku app
heroku create nastavnik-planner-mvp

# Dodaj MongoDB Atlas addon
heroku addons:create mongolab:sandbox

# Postavi environment varijable
heroku config:set JWT_SECRET=your-super-secret-jwt-key
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nastavnik-planner-prod
```

### 3. Deploy

```bash
# Dodaj Heroku remote
git remote add heroku https://git.heroku.com/nastavnik-planner-mvp.git

# Deploy
git push heroku main

# Otvori aplikaciju
heroku open
```

## 🐳 Docker Deployment

### 1. Kreiraj Dockerfile

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

# Kopiraj package.json fajlove
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Instaliraj dependencije
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Kopiraj source kod
COPY . .

# Build frontend
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start aplikaciju
CMD ["npm", "run", "start:prod"]
```

### 2. Kreiraj docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/nastavnik-planner
      - JWT_SECRET=your-super-secret-jwt-key
    depends_on:
      - mongo

  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 3. Pokretanje

```bash
# Build i pokretanje
docker-compose up --build

# U pozadini
docker-compose up -d --build
```

## ☁️ Vercel + MongoDB Atlas

### 1. Frontend na Vercel

```bash
# Instaliraj Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy frontend
cd client
vercel

# Postavi environment varijable
vercel env add REACT_APP_API_URL https://your-backend-url.herokuapp.com
```

### 2. Backend na Heroku

Koristite Heroku deployment instrukcije iznad.

## 🔒 SSL/HTTPS konfiguracija

### Heroku
Heroku automatski pruža SSL certifikate.

### Custom domain
```bash
# Dodaj custom domain
heroku domains:add www.yourdomain.com

# Konfiguriši DNS
# A record: @ -> Heroku IP
# CNAME: www -> your-app.herokuapp.com
```

## 📊 Monitoring i logging

### 1. Heroku logs
```bash
# Pregled logova
heroku logs --tail

# Pregled specifičnih logova
heroku logs --source app
```

### 2. MongoDB monitoring
- Koristite MongoDB Atlas monitoring dashboard
- Postavite alerts za performanse

### 3. Error tracking
Dodajte Sentry za error tracking:

```bash
npm install @sentry/node @sentry/react
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Kreirajte `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "nastavnik-planner-mvp"
        heroku_email: "your-email@example.com"
```

## 🚨 Backup strategija

### 1. MongoDB backup
```bash
# Lokalni backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/nastavnik-planner" --out=backup/

# Restore
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/nastavnik-planner" backup/nastavnik-planner/
```

### 2. Automatski backup
Postavite cron job za dnevni backup:

```bash
# Dodaj u crontab
0 2 * * * /path/to/backup-script.sh
```

## 🔧 Performance optimizacija

### 1. Frontend optimizacija
```bash
# Build optimizacija
cd client
npm run build

# Analiza bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### 2. Backend optimizacija
- Koristite Redis za caching
- Implementiraj rate limiting
- Optimizuj MongoDB queries

### 3. CDN
- Koristite CloudFlare za static assets
- Optimizuj slike sa WebP formatom

## 🛡️ Security checklist

- [ ] JWT secret je jak i siguran
- [ ] MongoDB je zaštićen password-om
- [ ] CORS je pravilno konfigurisan
- [ ] Input validacija je implementirana
- [ ] Rate limiting je aktivan
- [ ] HTTPS je omogućen
- [ ] Environment varijable su sigurne
- [ ] Dependencies su ažurne

## 📈 Scaling

### Horizontalno skaliranje
- Koristite load balancer
- Implementiraj session storage (Redis)
- Koristite MongoDB sharding

### Verticalno skaliranje
- Povećaj Heroku dyno size
- Optimizuj database queries
- Implementiraj caching

## 🔍 Troubleshooting

### Česti problemi

1. **MongoDB connection error**
   - Proverite connection string
   - Proverite IP whitelist
   - Proverite credentials

2. **Build error**
   - Proverite Node.js verziju
   - Očistite node_modules i reinstaliraj
   - Proverite environment varijable

3. **CORS error**
   - Proverite CORS konfiguraciju
   - Dodajte frontend URL u allowed origins

4. **PDF export error**
   - Proverite Puppeteer dependencies
   - Dodajte Chrome binary path

### Debug mode
```bash
# Lokalno
NODE_ENV=development npm run dev

# Heroku
heroku config:set NODE_ENV=development
heroku restart
```

## 📞 Support

Za probleme sa deployment-om:
- Proverite logove: `heroku logs --tail`
- Kontaktirajte support: support@nastavnikplanner.rs
- GitHub Issues: https://github.com/nastavnikplanner/mvp/issues

---

**Napomena**: Ovaj vodič pokriva osnovne deployment opcije. Za enterprise deployment, kontaktirajte naš tim za custom rešenja.