import nodemailer from "nodemailer";
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const host = env.SMTP_HOST;
const user = env.SMTP_USER;
const passRaw = env.SMTP_PASS;

const passes = [
  ["raw from env", passRaw],
  ["without trailing quote", passRaw.replace(/"$/, "")],
];

const hosts = ["smtp.hostinger.com", "smtp.titan.email"];

async function test(label, host, port, pass) {
  const t = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  try {
    await t.verify();
    console.log(`OK: ${host} ${label}, port ${port}`);
    return true;
  } catch (e) {
    console.log(`FAIL: ${host} ${label}, port ${port} — ${e.message.split("\n")[0]}`);
    return false;
  }
}

for (const [label, pass] of passes) {
  for (const host of hosts) {
    for (const port of [465, 587]) {
      await test(label, host, port, pass);
    }
  }
}
