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

export interface SimulationResult {
  success: boolean;
  assetChanges: AssetChange[];
  gasUsed: string;
  error?: string;
  simulationId: string;
}

export interface TransactionParams {
  from: string;
  to: string;
  value: string;
  data: string;
}
