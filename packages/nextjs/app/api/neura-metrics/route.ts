import { NextRequest, NextResponse } from "next/server";

interface ApiError extends Error {
  message: string;
}

interface ValidatorStats {
  address: string;
  displayAddress: string;
  blocksProduced: number;
  totalRewards: string;
  percentage: number;
}

interface Block {
  number: number;
  timestamp: string;
  miner: {
    hash: string;
    is_contract: boolean;
    is_verified: boolean;
  };
  size: number;
  gas_used: string;
  gas_limit: string;
  transactions_count: number;
  rewards?: {
    value: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = "https://testnet-blockscout.infra.neuraprotocol.io";
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    const fortuneContractAddress = searchParams.get("contract");

    console.log("Fetching Neura metrics with validator analysis...");

    let statsData = null;
    let blocksData = null;
    let mostActiveValidator: ValidatorStats | null = null;

    // Fetch network stats
    const endpoints = ["/api/v2/stats", "/api/v1/stats", "/api/stats", "/stats"];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Neura-Fortune-Cookie-dApp/1.0",
          },
          cache: "no-store",
        });

        if (response.ok) {
          statsData = await response.json();
          console.log(`✅ Stats success with ${endpoint}:`, statsData);
          break;
        }
      } catch (error: unknown) {
        const apiError = error as ApiError;
        console.log(`❌ Failed ${endpoint}:`, apiError.message);
      }
    }

    // Fetch recent blocks to analyze validator activity and block time
    try {
      const blocksResponse = await fetch(`${baseUrl}/api/v2/blocks?limit=100`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Neura-Fortune-Cookie-dApp/1.0",
        },
        cache: "no-store",
      });

      if (blocksResponse.ok) {
        blocksData = await blocksResponse.json();
        console.log("✅ Blocks data retrieved for analysis");

        // Analyze validator activity from recent blocks
        mostActiveValidator = analyzeValidatorActivity(blocksData);
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.log("❌ Blocks fetch failed:", apiError.message);
    }

    // Fetch user's fortune data if address is provided
    let userFortuneData = null;
    if (address && fortuneContractAddress) {
      try {
        const fortuneResponse = await fetch(
          `${baseUrl}/api/v2/addresses/${address}/transactions?to=${fortuneContractAddress}&limit=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "Neura-Fortune-Cookie-dApp/1.0",
            },
            cache: "no-store",
          },
        );

        if (fortuneResponse.ok) {
          userFortuneData = await fortuneResponse.json();
          console.log("✅ User fortune data retrieved");
        }
      } catch (error) {
        const apiError = error as ApiError;
        console.log("❌ User fortune data fetch failed:", apiError.message);
      }
    }

    // Process and return the data
    const processedMetrics = {
      success: !!(statsData || blocksData),
      data: {
        blockTime: calculateBlockTime(blocksData) || "~2.1s",
        totalBlocks: formatNumber(statsData?.total_blocks) || "2,845,672+",
        totalTransactions: formatTransactions(statsData?.total_transactions) || "5.6M+",
        totalAddresses: formatAddresses(statsData?.total_addresses) || "686K+",
        mostActiveValidator: mostActiveValidator ? mostActiveValidator.displayAddress : "N/A",
        validatorAddress: mostActiveValidator ? mostActiveValidator.address : null,
        validatorBlocks: mostActiveValidator?.blocksProduced || 0,
        gasPrice: statsData?.gas_prices?.average?.toString() || "0.00001",
        lastUpdated: new Date().toISOString(),
        userMetrics: processUserFortuneData(userFortuneData),
      },
      timestamp: Date.now(),
    };

    console.log("Processed metrics:", processedMetrics);
    return NextResponse.json(processedMetrics);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Server error fetching Neura metrics:", apiError);

    return NextResponse.json({
      success: false,
      data: {
        blockTime: "~2.1s",
        totalBlocks: "2,845,672+",
        totalTransactions: "5.6M+",
        totalAddresses: "686K+",
        mostActiveValidator: "Analyzing...",
        validatorAddress: null,
        validatorBlocks: 0,
        gasPrice: "0.00001",
        lastUpdated: new Date().toISOString(),
        userMetrics: null,
      },
      error: apiError.message,
      fallback: true,
      timestamp: Date.now(),
    });
  }
}

// Analyze validator activity from recent blocks
function analyzeValidatorActivity(blocksData: any): ValidatorStats | null {
  if (!blocksData?.items || blocksData.items.length === 0) {
    return null;
  }

  const blocks = blocksData.items as Block[];
  const validatorStats = new Map<string, ValidatorStats>();

  // Count blocks per validator
  blocks.forEach(block => {
    const validatorAddress = block.miner?.hash || "unknown";

    if (validatorAddress === "unknown") return;

    if (validatorStats.has(validatorAddress)) {
      const stats = validatorStats.get(validatorAddress)!;
      stats.blocksProduced += 1;
    } else {
      validatorStats.set(validatorAddress, {
        address: validatorAddress,
        displayAddress: formatValidatorAddress(validatorAddress),
        blocksProduced: 1,
        totalRewards: "0",
        percentage: 0,
      });
    }
  });

  // Calculate percentages and find most active
  const totalBlocks = blocks.length;
  let mostActive: ValidatorStats | null = null;

  validatorStats.forEach(stats => {
    stats.percentage = (stats.blocksProduced / totalBlocks) * 100;

    if (!mostActive || stats.blocksProduced > mostActive.blocksProduced) {
      mostActive = stats;
    }
  });

  return mostActive;
}

// Helper functions
function calculateBlockTime(blocksData: any): string | null {
  if (!blocksData?.items || blocksData.items.length < 2) return null;

  const blocks = blocksData.items;
  let totalTimeDiff = 0;
  let validPairs = 0;

  // Calculate average time between consecutive blocks
  for (let i = 0; i < blocks.length - 1; i++) {
    const currentBlock = new Date(blocks[i].timestamp).getTime();
    const nextBlock = new Date(blocks[i + 1].timestamp).getTime();
    const timeDiff = Math.abs(currentBlock - nextBlock) / 1000; // Convert to seconds

    // Only include reasonable block times (between 0.1 and 10 seconds)
    if (timeDiff >= 0.1 && timeDiff <= 10) {
      totalTimeDiff += timeDiff;
      validPairs++;
    }
  }

  if (validPairs === 0) return null;
  const averageBlockTime = totalTimeDiff / validPairs;
  return `${averageBlockTime.toFixed(1)}s`;
}

function formatTransactions(total: string | number | undefined): string | null {
  if (!total) return null;
  const num = typeof total === "string" ? parseInt(total) : total;
  return num > 1000000 ? `${(num / 1000000).toFixed(1)}M` : num.toLocaleString();
}

function formatAddresses(total: string | number | undefined): string | null {
  if (!total) return null;
  const num = typeof total === "string" ? parseInt(total) : total;

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

function formatNumber(value: number | string | undefined): string | null {
  if (!value) return null;
  const num = typeof value === "string" ? parseInt(value) : value;

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

function formatValidatorAddress(address: string): string {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function processUserFortuneData(data: any) {
  if (!data?.items || data.items.length === 0) return null;

  const lastTx = data.items[0];
  const txTimestamp = new Date(lastTx.timestamp).getTime() / 1000;

  return {
    lastTxHash: lastTx.hash,
    lastTxStatus: lastTx.status,
    lastTxTimestamp: new Date(lastTx.timestamp).toLocaleString(),
    lastTxUnixTimestamp: txTimestamp,
    confirmationTime: lastTx.confirmation_duration
      ? `${(lastTx.confirmation_duration[1] / 1000).toFixed(3)} secs`
      : "N/A",
  };
}
