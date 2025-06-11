import React, { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "../hooks/scaffold-eth";
import { formatEther } from "ethers";
import { useAccount, useBalance } from "wagmi";

const FortuneCookieWidget = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

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

  const { data: directTime, refetch: refetchDirectTime } = useScaffoldReadContract({
    contractName: "FortuneCookie",
    functionName: "lastFortuneTime",
    args: [address] as [string | undefined],
  });

  // Parse the fortune data
  const userLastFortune = (directFortune as string) || null;
  const lastFortuneTime = Number(directTime || 0);

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
        await refetchDirectTime();
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

                <button
                  className="w-full bg-gray-800/80 hover:bg-gray-700/80 text-cyan-400 px-6 py-4 rounded-2xl transition-all duration-300 border border-cyan-500/20 hover:border-cyan-500/40 text-lg font-medium"
                  onClick={async () => {
                    await refetchDirectFortune();
                    await refetchDirectTime();
                  }}
                >
                  🔄 Check for Fortune
                </button>
              </div>

              {userLastFortune && userLastFortune.length > 0 && (
                <div className="mt-8 p-6 border border-cyan-500/20 rounded-2xl bg-gray-800/50 backdrop-blur-sm animate-fade-in">
                  <p className="font-semibold text-cyan-400 mb-3 flex items-center text-lg">
                    <span className="mr-2">🔮</span> Your Fortune
                  </p>
                  <p className="text-gray-200 italic text-xl leading-relaxed">&ldquo;{userLastFortune}&rdquo;</p>
                  {lastFortuneTime > 0 && (
                    <p className="text-sm text-gray-400 mt-4 flex items-center">
                      <span className="mr-2">🕒</span>
                      {new Date(lastFortuneTime * 1000).toLocaleString()}
                    </p>
                  )}
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
