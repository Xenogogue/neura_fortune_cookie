import { Metadata } from "next";
import AppWithProviders from "~~/components/ScaffoldEthAppWithProviders";
import "~~/styles/globals.css";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Fortune Cookie",
  description: "Fortune Cookie dApp on Neura Protocol",
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
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
