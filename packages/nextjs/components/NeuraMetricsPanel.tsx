import React, { useEffect, useState } from "react";
import { BoltIcon, CpuChipIcon, TrophyIcon } from "@heroicons/react/24/outline";

interface NeuraMetrics {
  blockTime: string;
  totalBlocks: string;
  totalTransactions: string;
  gasPrice: string;
  totalAddresses: string;
  loading: boolean;
  lastUpdated: string;
  isOnline: boolean;
  isFallback: boolean;
  mostActiveValidator: string;
  validatorAddress: string | null;
  validatorBlocks: number;
}

const NeuraMetricsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<NeuraMetrics>({
    blockTime: "~2.1s",
    totalBlocks: "2,845,672+",
    totalTransactions: "5.6M+",
    gasPrice: "0.00001",
    totalAddresses: "686K+",
    loading: true,
    lastUpdated: "Loading...",
    isOnline: true,
    isFallback: false,
    mostActiveValidator: "Loading...",
    validatorAddress: null,
    validatorBlocks: 0,
  });

  // Fetch data from our Next.js API route (server-side proxy)
  const fetchNeuraMetrics = async () => {
    setMetrics(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch("/api/neura-metrics", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("API Response:", result); // Debug log

        setMetrics({
          ...result.data,
          loading: false,
          isOnline: result.success,
          isFallback: result.fallback || false,
          lastUpdated: new Date(result.data.lastUpdated).toLocaleTimeString(),
        });

        console.log("✅ Neura metrics updated:", result);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch Neura metrics:", error);

      setMetrics(prev => ({
        ...prev,
        loading: false,
        isOnline: false,
        isFallback: true,
        lastUpdated: "Offline",
      }));
    }
  };

  useEffect(() => {
    fetchNeuraMetrics();
    const interval = setInterval(fetchNeuraMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    loading: boolean;
    color: string;
    tooltip?: string;
  }> = ({ icon, label, value, loading, color, tooltip }) => (
    <div
      className="bg-gray-800/40 rounded-xl p-3 border border-cyan-500/10 backdrop-blur-sm hover:border-cyan-500/20 transition-colors"
      title={tooltip}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-gray-300 text-xs font-medium">{label}</span>
      </div>
      <div className={`font-mono text-sm ${color}`}>
        {loading ? <div className="animate-pulse bg-gray-600 h-4 w-16 rounded"></div> : value}
      </div>
    </div>
  );

  return (
    <div className="border-t border-cyan-500/20 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CpuChipIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-sm font-medium">Neura Network Status</span>
          <div
            className={`w-2 h-2 rounded-full ${
              metrics.isOnline ? (metrics.isFallback ? "bg-yellow-400" : "bg-green-400") : "bg-red-400"
            } ${metrics.loading ? "animate-pulse" : ""}`}
          ></div>
        </div>
        <div className="flex items-center gap-2">
          {metrics.isFallback && <span className="text-xs text-yellow-400">Estimated</span>}
          <span className="text-xs text-gray-500">{metrics.lastUpdated}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <MetricCard
          icon={<BoltIcon className="w-3 h-3 text-yellow-400" />}
          label="Block Time"
          value={metrics.blockTime}
          loading={metrics.loading}
          color="text-yellow-300"
          tooltip="Average time between blocks in the last 100 blocks"
        />

        <MetricCard
          icon={<div className="w-3 h-3 bg-purple-400 rounded-full"></div>}
          label="Addresses"
          value={metrics.totalAddresses}
          loading={metrics.loading}
          color="text-purple-300"
          tooltip="Total number of unique addresses"
        />
      </div>

      {/* Most Active Validator Section */}
      <div className="mt-4 p-3 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl border border-amber-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrophyIcon className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-medium">Most Active Validator</span>
        </div>

        {metrics.loading ? (
          <div className="animate-pulse bg-gray-600 h-4 w-32 rounded mb-1"></div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-mono text-sm">{metrics.mostActiveValidator}</span>
              {metrics.validatorAddress && (
                <a
                  href={`https://testnet-blockscout.infra.neuraprotocol.io/address/${metrics.validatorAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  View →
                </a>
              )}
            </div>

            <div className="flex justify-between text-xs text-gray-300">
              <span>Blocks: {metrics.validatorBlocks || 0}</span>
              <span>Share: {((metrics.validatorBlocks / 100) * 100).toFixed(1)}%</span>
            </div>

            {/* Progress bar showing validator's percentage */}
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((metrics.validatorBlocks / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Additional info row */}
      <div className="flex justify-between text-xs text-gray-400 mt-3 mb-3">
        <span>Transactions: {metrics.totalTransactions}</span>
        <span>Gas: {metrics.gasPrice} ANKR</span>
      </div>

      <div className="text-center">
        <a
          href="https://testnet-blockscout.infra.neuraprotocol.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 text-xs underline transition-colors duration-200"
        >
          View Full Explorer →
        </a>
      </div>
    </div>
  );
};

export default NeuraMetricsPanel;
