import "./globals.css";

export const metadata = {
  title: "TradePay — Cross-border trade, settled in trust",
  description: "Escrow-backed settlement for intra-African B2B trade.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
