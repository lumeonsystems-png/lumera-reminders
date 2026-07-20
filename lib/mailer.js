import nodemailer from "nodemailer";

export function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Trūksta SMTP aplinkos kintamųjų (SMTP_HOST, SMTP_USER, SMTP_PASS)"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true 465 prievadui, false - kitiems (naudoja STARTTLS)
    auth: { user, pass },
  });
}

// Sukuria laiško tekstą konkrečiam klientui, įstatydama sąskaitos numerį ir terminą.
export function buildReminderEmail(client) {
  const invoiceNumber = client.invoice_number || "26000-01";

  const subject = `Priminimas dėl neapmokėtos sąskaitos Nr. ${invoiceNumber}`;

  const body = `Sveiki,

Tai automatinis priminimas, kad sąskaita faktūra Nr. ${invoiceNumber} vis dar neapmokėta.

Mokėjimo terminas 3d.

Prašome atlikti apmokėjimą per 3d.
Neatlikus mokėjimo iki nurodytos datos, gali būti taikomi delspinigiai pagal sutarties sąlygas.

Dėkojame už bendradarbiavimą.

⸻

Pagarbiai, „Lumera“ komanda
+37064246925
+37066896676`;

  return { subject, body };
}
