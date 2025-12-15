'use client';

import { useEffect, useState } from 'react';
import { Loader2, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProtocolData {
  protocol: string;
  [key: string]: any;
}

interface WalletPositions {
  wallet: string;
  label?: string;
  protocols: {
    aave: ProtocolData | null;
    uniswap: ProtocolData | null;
    curve: ProtocolData | null;
    compound: ProtocolData | null;
    lido: ProtocolData | null;
  };
  timestamp: string;
}

interface ProtocolCardProps {
  name: string;
  data: ProtocolData;
}

function ProtocolCard({ name, data }: ProtocolCardProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-500" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Aave specific data */}
        {name === 'Aave' && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Collateral:</span>
              <span className="text-white font-medium">{parseFloat(data.totalCollateralETH).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Debt:</span>
              <span className="text-white font-medium">{parseFloat(data.totalDebtETH).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Health Factor:</span>
              <span className={`font-medium ${parseFloat(data.healthFactor) > 2 ? 'text-green-500' : parseFloat(data.healthFactor) > 1.5 ? 'text-yellow-500' : 'text-red-500'}`}>
                {parseFloat(data.healthFactor).toFixed(2)}
              </span>
            </div>
          </>
        )}

        {/* Uniswap specific data */}
        {name === 'Uniswap V3' && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Active Positions:</span>
              <span className="text-white font-medium">{data.totalPositions}</span>
            </div>
            {data.positions && data.positions.length > 0 && (
              <div className="text-xs text-gray-400 mt-2">
                {data.positions.slice(0, 2).map((pos: any, idx: number) => (
                  <div key={idx} className="truncate">
                    Pool #{pos.tokenId.slice(0, 6)}...
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Compound specific data */}
        {name === 'Compound' && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Supplied:</span>
              <span className="text-white font-medium">${parseFloat(data.supplied).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Borrowed:</span>
              <span className="text-white font-medium">${parseFloat(data.borrowed).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Net Position:</span>
              <span className={`font-medium ${data.netPosition >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(data.netPosition).toFixed(2)}
              </span>
            </div>
          </>
        )}

        {/* Lido specific data */}
        {name === 'Lido' && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Staked ETH:</span>
              <span className="text-white font-medium">{parseFloat(data.stETH).toFixed(4)} stETH</span>
            </div>
            <Badge variant="secondary" className="text-xs mt-2">
              {data.type}
            </Badge>
          </>
        )}

        {/* Curve specific data */}
        {name === 'Curve' && (
          <div className="text-xs text-gray-400">
            {data.note || 'No active positions'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DeFiPositions() {
  const [positions, setPositions] = useState<WalletPositions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/defi/positions');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setPositions(data.positions || []);
      }
    } catch (err) {
      setError('Failed to load DeFi positions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/50">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-medium mb-1">Error Loading Positions</h3>
              <p className="text-red-400/80 text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">DeFi Positions</CardTitle>
              <p className="text-sm text-gray-400 mt-0.5">
                Tracked across {positions?.length || 0} wallet{positions?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            Add Wallet
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {positions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Wallets Configured</h3>
            <p className="text-sm text-gray-400 mb-4">
              Add an Ethereum wallet address to start tracking your DeFi positions
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Add Your First Wallet
            </Button>
          </div>
        ) : (
          positions.map((walletData, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30">
              {/* Wallet Header */}
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-700/50">
                <Wallet className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {walletData.label || `Wallet ${idx + 1}`}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {walletData.wallet.slice(0, 6)}...{walletData.wallet.slice(-4)}
                </span>
              </div>

              {/* Protocol Positions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {walletData.protocols.aave && parseFloat(walletData.protocols.aave.totalCollateralETH) > 0 && (
                  <ProtocolCard name="Aave" data={walletData.protocols.aave} />
                )}

                {walletData.protocols.uniswap && walletData.protocols.uniswap.totalPositions > 0 && (
                  <ProtocolCard name="Uniswap V3" data={walletData.protocols.uniswap} />
                )}

                {walletData.protocols.compound && parseFloat(walletData.protocols.compound.supplied) > 0 && (
                  <ProtocolCard name="Compound" data={walletData.protocols.compound} />
                )}

                {walletData.protocols.lido && parseFloat(walletData.protocols.lido.stETH) > 0 && (
                  <ProtocolCard name="Lido" data={walletData.protocols.lido} />
                )}

                {walletData.protocols.curve && walletData.protocols.curve.positions && walletData.protocols.curve.positions.length > 0 && (
                  <ProtocolCard name="Curve" data={walletData.protocols.curve} />
                )}
              </div>

              {/* Show message if no positions */}
              {!walletData.protocols.aave?.totalCollateralETH &&
               !walletData.protocols.uniswap?.totalPositions &&
               !walletData.protocols.compound?.supplied &&
               !walletData.protocols.lido?.stETH &&
               (!walletData.protocols.curve?.positions || walletData.protocols.curve.positions.length === 0) && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No active DeFi positions found for this wallet
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
