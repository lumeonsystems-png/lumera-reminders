export const metadata = {
  title: "Lumera priminimai",
  description: "Neapmokėtų sąskaitų priminimų siuntimas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="lt">
      <body>{children}</body>
    </html>
  );
}
