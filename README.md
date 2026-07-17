# Lumera — sąskaitų priminimų website

Paprastas vidinis įrankis: sąrašas klientų su el. pašto adresais, varnelė
„reikia priminimo“ prie kiekvieno, ir mygtukas „Siųsti dabar“, kuris tiems
pažymėtiems iškart išsiunčia priminimo laišką dėl neapmokėtos sąskaitos.

Viskas nemokama: kodas hostinamas Vercel (nemokamas planas), duomenys
laikomi Supabase (nemokamas planas), laiškai siunčiami per jūsų esamą
el. pašto paskyrą (SMTP).

## 1. Supabase (duomenų bazė) — nemokamai

1. Susikurkite paskyrą [supabase.com](https://supabase.com) ir naują projektą.
2. Projekte eikite į **SQL Editor -> New query**, įklijuokite viską iš
   failo `schema.sql` (šiame projekte) ir paspauskite **Run**. Tai sukurs
   `clients` lentelę.
3. Eikite į **Project Settings -> API**. Nusikopijuokite:
   - `Project URL` -> tai bus `SUPABASE_URL`
   - `service_role` raktą (**ne** `anon` raktą) -> tai bus `SUPABASE_SERVICE_ROLE_KEY`

   `service_role` raktas turi pilną prieigą prie duomenų bazės — jo
   niekada nerodykite viešai, jis naudojamas tik serverio pusėje.

## 2. SMTP (el. pašto siuntimas)

Reikia SMTP prieigos prie `info@lumera.lt` (ar kito pašto, iš kurio norite
siųsti). Du dažniausi variantai:

**A) Jei `info@lumera.lt` yra Google Workspace paskyra:**
1. Google paskyroje įjunkite 2FA (dviejų žingsnių patvirtinimą), jei
   nėra įjungtas.
2. Susikurkite „App password“ (Programos slaptažodį):
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Naudokite:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=info@lumera.lt`
   - `SMTP_PASS=` (sugeneruotas 16 simbolių app password, ne jūsų įprastas slaptažodis)

**B) Jei `info@lumera.lt` yra jūsų domeno hostingo paštas** (pvz. tas
pats, iš kurio dabar siunčiate per Outlook/Mail programą):
1. Pasiteiraukite savo hostingo/domeno valdymo skydelyje (arba paštu jūsų
   IT/hostingo teikėjui) SMTP duomenų: serverio adreso, prievado (dažniausiai
   587 arba 465) ir prisijungimo (paprastai tas pats slaptažodis, kuriuo
   prisijungiate pašto programoje).
2. Įrašykite juos į `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.

Jei kils keblumų su konkrečiu pašto teikėju, galite parašyti man teikėjo
pavadinimą — padėsiu surasti tikslius nustatymus.

## 3. Kodo įkėlimas į GitHub

1. Susikurkite nemokamą [github.com](https://github.com) paskyrą (jei
   neturite) ir naują tuščią repozitoriją, pvz. `lumera-reminders`.
2. Šiame aplanke paleiskite:
   ```
   git init
   git add .
   git commit -m "Pirma versija"
   git branch -M main
   git remote add origin https://github.com/JUSU_VARDAS/lumera-reminders.git
   git push -u origin main
   ```

## 4. Vercel (hostingas) — nemokamai

1. Susikurkite paskyrą [vercel.com](https://vercel.com) (galite
   prisijungti per GitHub).
2. **Add New -> Project**, pasirinkite ką tik įkeltą `lumera-reminders`
   repozitoriją.
3. Prieš spaudžiant „Deploy“, atidarykite **Environment Variables** ir
   įrašykite (reikšmes imate iš žingsnių 1–2 ir savo pasirinkto slaptažodžio):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM` (paprastai tas pats kaip `SMTP_USER`)
4. Paspauskite **Deploy**. Po ~1 minutės gausite nuorodą, pvz.
   `https://lumera-reminders.vercel.app` — tai jūsų website'as.

## 5. Naudojimas

1. Atidarykite gautą nuorodą, įveskite `ADMIN_PASSWORD` slaptažodį.
2. „+ Pridėti klientą“ — įrašykite el. paštą, vardą, sąskaitos numerį,
   mokėjimo terminą.
3. Kai kliento sąskaita netampa apmokėta, pažymėkite varnelę
   „Reikia priminimo“.
4. Apačioje paspauskite „Siųsti dabar (N)“ — laiškas iškart išsiunčiamas
   visiems pažymėtiems (kurie nėra pažymėti kaip „Apmokėta“).
5. Kai klientas apmoka — pažymėkite „Apmokėta“, jis atkris iš siuntimo
   sąrašo (ir eilutė pilkai pažymima).

Laiško tekstas ir tema generuojami automatiškai pagal fiksuotą šabloną,
įstatant kiekvieno kliento sąskaitos numerį ir terminą (`lib/mailer.js`,
funkcija `buildReminderEmail`) — jei norėsite pakeisti tekstą, redaguokite
tą failą.

## Vietinis paleidimas (jei norite testuoti prieš pat deploy'inant)

```
npm install
cp .env.example .env.local
# užpildykite .env.local reikšmes
npm run dev
```

Atidarykite `http://localhost:3000`.
