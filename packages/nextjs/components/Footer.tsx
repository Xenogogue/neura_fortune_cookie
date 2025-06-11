import React from "react";
import { SwitchTheme } from "~~/components/SwitchTheme";

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-r from-gray-900/95 via-blue-950/95 to-gray-900/95 backdrop-blur-xl border-t border-cyan-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <nav className="flex items-center gap-6">
            <a
              href="https://testnet-bridge.infra.neuraprotocol.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Bridge
            </a>
            <a
              href="https://testnet-blockscout.infra.neuraprotocol.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Block Explorer
            </a>
            <a
              href="https://testnet-bridge.infra.neuraprotocol.io/faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Faucet
            </a>
            <a
              href="https://github.com/Xenogogue/neura_fortune_cookie"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-cyan-400 transition-colors"
            >
              GitHub
            </a>
          </nav>
          <SwitchTheme />
        </div>
      </div>
    </footer>
  );
};
