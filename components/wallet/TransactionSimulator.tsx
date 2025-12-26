"use client"

import React, { useState } from 'react'
import { ethers } from 'ethers'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle, ArrowRight, Shield, Activity, Loader2 } from "lucide-react"
import { simulateTransaction } from "@/lib/simulation/alchemy"
import { SimulationResult } from "@/types/simulation"

export function TransactionSimulator() {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [simulating, setSimulating] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)

  const handleSimulate = async () => {
    if (!toAddress || !amount) return

    setSimulating(true)
    setResult(null)

    try {
      // Construct a mock transaction
      const tx = {
        from: '0x0000000000000000000000000000000000000000', // Mock sender
        to: toAddress,
        value: ethers.parseEther(amount).toString(),
        data: '0x' // Simple transfer for now
      }

      const simResult = await simulateTransaction(tx)
      setResult(simResult)
    } catch (error) {
      console.error("Simulation error", error)
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Simulate_Tx
          </h2>
          <p className="text-white/40 text-xs font-mono mt-1">Safety Check Before Signing</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-white/60 text-xs uppercase tracking-wider">Recipient Address</Label>
          <Input
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            className="bg-white/5 border-white/10 text-white font-mono mt-1"
          />
        </div>

        <div>
          <Label className="text-white/60 text-xs uppercase tracking-wider">Amount (ETH)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="bg-white/5 border-white/10 text-white font-mono mt-1"
          />
        </div>

        <Button
          onClick={handleSimulate}
          disabled={simulating || !toAddress || !amount}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono uppercase tracking-wider"
        >
          {simulating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 mr-2" />
              Run Simulation
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className={`mt-6 p-4 rounded-xl border ${result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span className={`font-bold uppercase tracking-wider ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? 'Likely Success' : 'Likely Failure'}
            </span>
          </div>

          {result.error && (
            <p className="text-red-300 text-sm font-mono mb-2">{result.error}</p>
          )}

          {result.assetChanges.length > 0 && (
            <div className="space-y-2">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Asset Changes:</p>
              {result.assetChanges.map((change, idx) => (
                <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${change.changeType === 'OUT' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {change.changeType}
                    </span>
                    <span className="text-white font-mono text-sm">{change.amount} {change.symbol}</span>
                  </div>
                  {change.changeType === 'OUT' && (
                    <ArrowRight className="w-4 h-4 text-white/20" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs font-mono text-white/40">
            <span>Gas: {result.gasUsed}</span>
            <span>ID: {result.simulationId.slice(0, 8)}...</span>
          </div>
        </div>
      )}
    </div>
  )
}
