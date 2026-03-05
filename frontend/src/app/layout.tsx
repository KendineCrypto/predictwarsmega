import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "PredictWars | ETH Price Prediction on MegaETH",
  description:
    "Predict if ETH price will be higher or lower in 30 seconds. Score-based prediction game on MegaETH Testnet.",
  openGraph: {
    title: "PredictWars — MegaETH",
    description: "Real-time ETH price prediction game on MegaETH Testnet. Predict. Earn points. Dominate the leaderboard.",
    type: "website",
  },
};

// Runs before React hydrates — prevents flash of wrong theme
const themeScript = `(function(){
  var t=localStorage.getItem('pw_theme');
  if(t==='light') document.documentElement.classList.add('light');
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-mega-bg text-mega-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
