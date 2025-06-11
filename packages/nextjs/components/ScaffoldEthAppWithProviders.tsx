"use client";

import React, { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiConfig } from "wagmi";
import { Footer } from "~~/components/Footer";
import Header from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Component that uses Wagmi hooks
const AppContent = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          // Default toast options
          className: "bg-gray-900/95 border border-cyan-500/20 backdrop-blur-xl",
          duration: 5000,
          style: {
            background: "rgba(17, 24, 39, 0.95)",
            color: "#fff",
            border: "1px solid rgba(6, 182, 212, 0.2)",
            backdropFilter: "blur(12px)",
          },
          // Success toast
          success: {
            className: "bg-gray-900/95 border border-green-500/20 backdrop-blur-xl",
            style: {
              background: "rgba(17, 24, 39, 0.95)",
              color: "#fff",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              backdropFilter: "blur(12px)",
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          // Error toast
          error: {
            className: "bg-gray-900/95 border border-red-500/20 backdrop-blur-xl",
            style: {
              background: "rgba(17, 24, 39, 0.95)",
              color: "#fff",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              backdropFilter: "blur(12px)",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
          // Loading toast
          loading: {
            className: "bg-gray-900/95 border border-cyan-500/20 backdrop-blur-xl",
            style: {
              background: "rgba(17, 24, 39, 0.95)",
              color: "#fff",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              backdropFilter: "blur(12px)",
            },
          },
        }}
      />
    </>
  );
};

export const AppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom theme for RainbowKit
  const customTheme = {
    ...(isDarkMode ? darkTheme() : lightTheme()),
    colors: {
      ...(isDarkMode ? darkTheme().colors : lightTheme().colors),
      accentColor: "#06b6d4", // cyan-500
      accentColorForeground: "#ffffff",
      actionButtonBorder: "rgba(6, 182, 212, 0.2)",
      actionButtonBorderMobile: "rgba(6, 182, 212, 0.2)",
      actionButtonSecondaryBackground: "rgba(6, 182, 212, 0.1)",
      connectButtonBackground: "rgba(6, 182, 212, 0.1)",
      connectButtonBackgroundError: "rgba(239, 68, 68, 0.1)",
      connectButtonInnerBackground: "rgba(6, 182, 212, 0.1)",
      connectButtonText: "#ffffff",
      connectButtonTextError: "#ffffff",
      modalBackground: "rgba(17, 24, 39, 0.95)",
      modalBorder: "rgba(6, 182, 212, 0.2)",
      modalText: "#ffffff",
      modalTextSecondary: "#94a3b8",
      modalBackdrop: "rgba(0, 0, 0, 0.5)",
      profileAction: "rgba(6, 182, 212, 0.1)",
      profileActionHover: "rgba(6, 182, 212, 0.2)",
      profileForeground: "rgba(17, 24, 39, 0.95)",
      selectedOptionBorder: "rgba(6, 182, 212, 0.2)",
      standby: "#ffffff",
    },
    fonts: {
      body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    radii: {
      actionButton: "0.75rem",
      connectButton: "0.75rem",
      menuButton: "0.75rem",
      modal: "1rem",
      modalMobile: "1rem",
    },
    shadows: {
      connectButton: "0 0 0 1px rgba(6, 182, 212, 0.2)",
      dialog: "0 0 0 1px rgba(6, 182, 212, 0.2)",
      profileDetailsAction: "0 0 0 1px rgba(6, 182, 212, 0.2)",
      selectedOption: "0 0 0 1px rgba(6, 182, 212, 0.2)",
      selectedWallet: "0 0 0 1px rgba(6, 182, 212, 0.2)",
      walletLogo: "0 0 0 1px rgba(6, 182, 212, 0.2)",
    },
  };

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar height="3px" color="#2299dd" />
        <RainbowKitProvider avatar={BlockieAvatar} theme={mounted ? customTheme : lightTheme()}>
          <style jsx global>{`
            /* Transaction Modal Styles */
            [data-rk] .rk-modal {
              margin-top: 5rem !important;
              background: rgba(17, 24, 39, 0.95) !important;
              backdrop-filter: blur(12px) !important;
              border: 1px solid rgba(6, 182, 212, 0.2) !important;
              border-radius: 1rem !important;
            }
            [data-rk] .rk-modal-content {
              color: white !important;
            }
            [data-rk] .rk-modal-status {
              color: white !important;
              font-weight: 500 !important;
            }
            [data-rk] .rk-modal-header {
              color: white !important;
            }
            [data-rk] .rk-modal-body {
              color: white !important;
            }
            [data-rk] .rk-modal-footer {
              color: white !important;
            }
            /* Ensure the modal appears below the header */
            [data-rk] .rk-modal-container {
              padding-top: 5rem !important;
            }
          `}</style>
          <AppContent>{children}</AppContent>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
};

export default AppWithProviders;
