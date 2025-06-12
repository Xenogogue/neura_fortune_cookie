import React, { useCallback, useEffect, useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "../hooks/scaffold-eth";
import NeuraMetricsPanel from "./NeuraMetricsPanel";
import { formatEther } from "ethers";
import { useAccount, useBalance } from "wagmi";
import { UserGroupIcon } from "@heroicons/react/24/outline";

interface UserMetrics {
  lastTxHash: string;
  lastTxStatus: string;
  lastTxTimestamp: string;
  lastTxUnixTimestamp: number;
  confirmationTime: string;
}

const FortuneCookieWidget = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);

  // Read user's ANKR balance (native token)
  const { data: balance } = useBalance({
    address: address,
  });

  // Read fortune price from contract
  const { data: fortunePrice } = useScaffoldReadContract({
    contractName: "FortuneCookie",
    functionName: "getFortunePrice",
  });

  // Read contract balance
  const { data: contractBalance } = useScaffoldReadContract({
    contractName: "FortuneCookie",
    functionName: "getBalance",
  });

  // Read user's last fortune directly from storage
  const { data: directFortune, refetch: refetchDirectFortune } = useScaffoldReadContract({
    contractName: "FortuneCookie",
    functionName: "lastFortune",
    args: [address] as [string | undefined],
  });

  // Parse the fortune data
  const userLastFortune = (directFortune as string) || null;

  // Fetch user metrics
  const fetchUserMetrics = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(
        `/api/neura-metrics?address=${address}&contract=0x5FbDB2315678afecb367f032d93F642f64180aa3`,
      );
      if (response.ok) {
        const result = await response.json();
        if (result.data.userMetrics) {
          setUserMetrics(result.data.userMetrics);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user metrics:", error);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchUserMetrics();
      const interval = setInterval(fetchUserMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [address, fetchUserMetrics]);

  // Crack open a fortune
  const { writeContractAsync: crackOpen } = useScaffoldWriteContract({
    contractName: "FortuneCookie",
  });

  const handleCrackOpen = async () => {
    if (!fortunePrice) return;

    setIsLoading(true);

    try {
      await crackOpen({
        functionName: "crackOpen",
        args: undefined,
        value: fortunePrice as bigint,
        gas: 100000n,
      });

      // Wait for transaction to be mined, then refetch
      setTimeout(async () => {
        await refetchDirectFortune();
        await fetchUserMetrics();
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.error("Error cracking fortune:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl p-8 bg-gradient-to-br from-gray-900/80 via-blue-900/80 to-gray-900/80 rounded-3xl shadow-2xl border border-cyan-500/20 backdrop-blur-xl overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-gradient"></div>
        </div>

        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 blur-xl"></div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            🥠 Fortune Cookie
          </h1>

          {address ? (
            <>
              <div className="mb-8 space-y-4 text-base bg-gray-800/50 p-6 rounded-2xl border border-cyan-500/10 backdrop-blur-sm">
                <p className="flex justify-between items-center text-gray-300">
                  <span className="font-medium text-cyan-400">Your ANKR balance:</span>
                  <span className="font-mono text-lg">{balance ? formatEther(balance.value) : "0"} ANKR</span>
                </p>
                <p className="flex justify-between items-center text-gray-300">
                  <span className="font-medium text-cyan-400">Fortune price:</span>
                  <span className="font-mono text-lg">
                    {fortunePrice ? formatEther(fortunePrice as bigint) : "0.01"} ANKR
                  </span>
                </p>
                <p className="flex justify-between items-center text-gray-300">
                  <span className="font-medium text-cyan-400">Contract collected:</span>
                  <span className="font-mono text-lg">
                    {contractBalance ? formatEther(contractBalance as bigint) : "0"} ANKR
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <button
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-cyan-500/20 disabled:shadow-none"
                  onClick={handleCrackOpen}
                  disabled={!balance || !fortunePrice || balance.value < (fortunePrice as bigint) || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Cracking Fortune...
                    </span>
                  ) : (
                    "🥠 Crack Open Fortune (0.01 ANKR)"
                  )}
                </button>
              </div>

              {userLastFortune && userLastFortune.length > 0 && (
                <div className="mt-8 p-6 border border-cyan-500/20 rounded-2xl bg-gray-800/50 backdrop-blur-sm animate-fade-in">
                  <p className="font-semibold text-cyan-400 mb-3 flex items-center text-lg">
                    <span className="mr-2">🔮</span> Your Fortune
                  </p>
                  <p className="text-gray-200 italic text-xl leading-relaxed">&ldquo;{userLastFortune}&rdquo;</p>

                  {/* Fortune Stats */}
                  {userMetrics && userMetrics.lastTxHash && (
                    <div className="mt-4 p-4 bg-gray-800/40 rounded-xl border border-cyan-500/10 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <UserGroupIcon className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 text-sm font-medium">Your Fortune Stats</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <a
                          href={`https://testnet-blockscout.infra.neuraprotocol.io/tx/${userMetrics.lastTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 font-mono truncate max-w-[200px] hover:text-cyan-300 transition-colors duration-200"
                        >
                          {userMetrics.lastTxHash}
                        </a>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            userMetrics.lastTxStatus === "success" || userMetrics.lastTxStatus === "ok"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {userMetrics.lastTxStatus}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex justify-between items-center">
                        <span>{userMetrics.lastTxTimestamp}</span>
                        <span className="text-cyan-400">Confirmed within &lt;= {userMetrics.confirmationTime}</span>
                      </div>
                    </div>
                  )}

                  {/* Neura Network Metrics */}
                  <div className="mt-6">
                    <NeuraMetricsPanel />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-300 bg-gray-800/50 p-6 rounded-2xl border border-cyan-500/20 text-lg">
                Connect your wallet to unlock your fortune! 🔐
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FortuneCookieWidget;
