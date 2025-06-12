import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import AppWithProviders from "~~/components/ScaffoldEthAppWithProviders";
import "~~/styles/globals.css";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Fortune Cookie",
  description: "Get your fortune on the Neura Network",
  icons: {
    icon: [{ url: "/favicon.svg", sizes: "32x32", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="scaffoldEthDark">
      <body>
        <AppWithProviders>{children}</AppWithProviders>
      </body>
    </html>
  );
}
