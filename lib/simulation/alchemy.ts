
import { ethers } from 'ethers';

export interface SimulationResult {
  success: boolean;
  assetChanges: AssetChange[];
  gasUsed: string;
  error?: string;
  simulationId: string;
}

export interface AssetChange {
  assetType: 'NATIVE' | 'ERC20' | 'ERC721' | 'ERC1155';
  changeType: 'IN' | 'OUT';
  address: string;
  name: string;
  symbol: string;
  amount: string;
  decimals: number;
  logo?: string;
}

export interface TransactionParams {
  from: string;
  to: string;
  value: string;
  data: string;
}

// Mock simulator for now since we don't have Alchemy keys
export async function simulateTransaction(params: TransactionParams): Promise<SimulationResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Basic validation simulation
  if (!ethers.isAddress(params.to)) {
    return {
      success: false,
      assetChanges: [],
      gasUsed: '0',
      error: 'Invalid recipient address',
      simulationId: 'sim_failed_validation'
    };
  }

  // Simulate a high-value transfer warning logic
  const valueEth = parseFloat(ethers.formatEther(params.value));
  if (valueEth > 5) {
     return {
      success: true,
      assetChanges: [
        {
          assetType: 'NATIVE',
          changeType: 'OUT',
          address: '0x0000000000000000000000000000000000000000',
          name: 'Ethereum',
          symbol: 'ETH',
          amount: valueEth.toString(),
          decimals: 18,
          logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
        }
      ],
      gasUsed: '21000',
      simulationId: `sim_${Date.now()}`
    };
  }

  // Mock success response
  return {
    success: true,
    assetChanges: [
      {
        assetType: 'NATIVE',
        changeType: 'OUT',
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        amount: ethers.formatEther(params.value),
        decimals: 18,
        logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
      }
    ],
    gasUsed: '21000',
    simulationId: `sim_${Date.now()}`
  };
}
