"use client";

import React from "react";
import Link from "next/link";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Header = () => {
  const { targetNetwork } = useTargetNetwork();

  // Read contract balance for treasury info
  const { data: treasuryBalance } = useScaffoldReadContract({
    contractName: "FortuneCookie",
    functionName: "getBalance",
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 border-b border-cyan-500/20 backdrop-blur-xl z-30">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-gray-900/95 rounded-box w-52"
          >
            <li>
              <Link href="/" className="text-cyan-400 hover:text-cyan-300">
                Home
              </Link>
            </li>
          </ul>
        </div>
        <Link href="/" className="flex items-center gap-2 ml-4 mr-6">
          <div className="flex flex-col">
            <span className="font-bold leading-tight text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Fortune Cookie
            </span>
            <span className="text-xs text-cyan-400/80">Neura Protocol</span>
          </div>
        </Link>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <div className="flex items-center gap-4">
          {/* Network Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-cyan-500/20">
            <div
              className={`w-2 h-2 rounded-full ${targetNetwork.id === 1337 ? "bg-green-500" : "bg-yellow-500"}`}
            ></div>
            <span className="text-sm text-gray-300">{targetNetwork.name}</span>
          </div>

          {/* Treasury Balance */}
          {treasuryBalance && (
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-cyan-500/20">
              <span className="text-sm text-cyan-400">Treasury:</span>
              <span className="text-sm text-gray-300 font-mono">{Number(treasuryBalance) / 1e18} ANKR</span>
            </div>
          )}

          {/* Connect Button */}
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
