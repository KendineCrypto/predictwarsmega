import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "PredictWars | ETH Price Prediction on MegaETH",
  description:
    "Predict if ETH price will be higher or lower in 5 minutes. Score-based prediction game on MegaETH Testnet.",
  openGraph: {
    title: "PredictWars — MegaETH",
    description: "Real-time ETH price prediction game on MegaETH Testnet. Predict. Earn points. Dominate the leaderboard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-mega-bg text-mega-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
