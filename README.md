# 🌱 BioBin X

**Smart matavfallshåndtering for skoler** — Elever registrerer matavfall, produserer biogass og konkurrerer om å redde planeten.

---

## 📁 Prosjektstruktur

```
biobin-x/
├── components/
│   └── layout/
│       └── Layout.js          # Sidebar-navigasjon (elev + lærer)
├── firebase/
│   ├── config.js              # Firebase initialisering
│   ├── auth.js                # Autentiseringsfunksjoner
│   └── db.js                  # Firestore-operasjoner + badges
├── hooks/
│   └── useAuth.js             # Auth context + hook
├── pages/
│   ├── _app.js                # App wrapper
│   ├── index.js               # Landing page
│   ├── about.js               # Om oss
│   ├── scan.js                # Kamera + registrering
│   ├── leaderboard.js         # Rangering (elever + klasser)
│   ├── quiz.js                # Miljøquiz
│   ├── stats.js               # Statistikk + grafer
│   ├── auth/
│   │   ├── login.js           # Innloggingsside
│   │   └── signup.js          # Registreringsside
│   └── dashboard/
│       ├── student.js         # Elev-dashboard
│       ├── teacher.js         # Lærer-dashboard
│       └── classes.js         # Klassehåndtering
├── styles/
│   └── globals.css            # Global CSS + Tailwind
├── utils/
│   ├── calculator.js          # Energi/CO₂-kalkulator
│   └── quizData.js            # Quiz-spørsmål
├── firestore.rules            # Firestore sikkerhetsregler
├── .env.example               # Miljøvariabler mal
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Installasjon

### 1. Klon prosjektet

```bash
git clone https://github.com/dittbrukernavn/biobin-x.git
cd biobin-x
npm install
```

### 2. Sett opp Firebase

1. Gå til [console.firebase.google.com](https://console.firebase.google.com)
2. Klikk **Add project** og gi prosjektet et navn (f.eks. `biobin-x`)
3. Aktiver **Authentication**:
   - Gå til Authentication → Sign-in method
   - Aktiver **Email/Password**
4. Aktiver **Firestore Database**:
   - Gå til Firestore Database → Create database
   - Velg **Start in production mode**
   - Velg en region nær deg (f.eks. `europe-west3`)
5. (Valgfritt) Aktiver **Storage** for bilder

### 3. Hent Firebase-nøkler

1. Gå til Project Settings (tannhjulet) → General
2. Under "Your apps", klikk **</> Web**
3. Registrer appen og kopier konfigurasjonsverdiene

### 4. Konfigurer miljøvariabler

```bash
cp .env.example .env.local
```

Åpne `.env.local` og fyll inn dine Firebase-verdier:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=biobin-x.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=biobin-x
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=biobin-x.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123
```

### 5. Last opp Firestore-regler

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 6. Start utviklingsserveren

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌐 Deploy til Vercel

### Alternativ 1: Via Vercel CLI

```bash
npm install -g vercel
vercel
```

### Alternativ 2: Via GitHub (anbefalt)

1. Push prosjektet til GitHub
2. Gå til [vercel.com](https://vercel.com) og klikk **New Project**
3. Importer GitHub-repositoryet
4. Under **Environment Variables**, legg til alle `NEXT_PUBLIC_FIREBASE_*` variablene
5. Klikk **Deploy**

### Viktig: Environment Variables på Vercel

I Vercel-dashbordet → Settings → Environment Variables, legg til:

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_FIREBASE_API_KEY | din-api-nøkkel |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | prosjekt.firebaseapp.com |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | prosjekt-id |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | prosjekt.appspot.com |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | sender-id |
| NEXT_PUBLIC_FIREBASE_APP_ID | app-id |

---

## 🔧 Tilleggskonfigurasjon

### Aktiver Firestore Indexes (automatisk)
Første gang du kjører appen vil Firestore be deg opprette indekser. Følg lenkene i feilmeldingene.

### Manuelt opprette indekser
Gå til Firestore → Indexes og opprett sammensatte indekser:
- Collection `waste_logs`: `userId ASC, timestamp DESC`
- Collection `waste_logs`: `classId ASC, timestamp DESC`
- Collection `users`: `role ASC, points DESC`
- Collection `classes`: `teacherId ASC`

### Autoriser domener i Firebase Auth
Gå til Authentication → Settings → Authorized domains og legg til:
- `localhost`
- `ditt-prosjektnavn.vercel.app`

---

## 📊 Beregningsmodell

| Input | Beregning |
|-------|-----------|
| 1 kg matavfall | 10 poeng |
| 1 kg matavfall | 0,5 kWh biogas-energi |
| 1 kg matavfall | 0,8 kg CO₂ spart (vs. deponi) |

---

## 🏆 Badge-system

| Badge | Krav | Ikon |
|-------|------|------|
| Første kast! | Første registrering | 🌱 |
| 10 kg Helt | 10 kg total | 💪 |
| 50 kg Mester | 50 kg total | 🏆 |
| 100 kg Legende | 100 kg total | 👑 |

---

## 👤 Brukertyper

**Elev:**
- Registrere matavfall med kamera
- Se egne poeng og statistikk
- Ta quiz
- Se leaderboard
- Låse opp badges

**Lærer:**
- Opprette klasser med invitasjonskode
- Se alle elevers statistikk
- Se klassestatistikk (avfall, energi, CO₂)
- Leaderboard-oversikt

---

Laget med 💚 for en grønnere fremtid.
