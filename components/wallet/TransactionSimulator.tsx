"use client"

import React, { useState } from 'react'
import { ethers } from 'ethers'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle, ArrowRight, Shield, Activity, Loader2 } from "lucide-react"
import { simulateTransaction } from "@/lib/simulation/alchemy"
import { SimulationResult } from "@/types/simulation"
import styles from './TransactionSimulator.module.css'

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

  const isDanger = result && !result.success;

  return (
    <div className={`${styles.cyberContainer} ${isDanger ? styles.dangerState : ''} max-w-md w-full mx-auto`}>
      {/* Decorative Circuit Lines */}
      <div className={styles.circuitLineTop} />
      <div className={styles.circuitLineBottom} />

      <div className={styles.headerPlate}>
        <span className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          SIM_PROTOCOL_V1
        </span>
        <div className={styles.statusLight} />
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <Label className={styles.microLabel}>TARGET_ADDRESS_HEX</Label>
          <Input
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            className={styles.cyberInput}
          />
        </div>

        <div>
          <Label className={styles.microLabel}>VALUE_ETH</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className={styles.cyberInput}
          />
        </div>

        <Button
          onClick={handleSimulate}
          disabled={simulating || !toAddress || !amount}
          className={`w-full ${styles.cyberButton}`}
        >
          {simulating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              PROCESSING...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 mr-2" />
              EXECUTE_SIMULATION
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className={`mt-6 pt-4 border-t ${isDanger ? 'border-red-500/30' : 'border-cyan-500/30'}`}>
          <div className="flex items-center gap-2 mb-4">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span className={`font-bold tracking-widest ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? 'SIMULATION_CLEAN' : 'CRITICAL_FAILURE'}
            </span>
          </div>

          {result.error && (
            <p className="text-red-400 text-sm font-mono mb-4 border border-red-500/30 p-2 bg-red-500/10">
              ERR: {result.error}
            </p>
          )}

          {result.assetChanges.length > 0 && (
            <div className="space-y-2">
              <p className={styles.microLabel}>DETECTED_ASSET_FLOW:</p>
              {result.assetChanges.map((change, idx) => (
                <div key={idx} className={styles.assetRow}>
                  <div className="flex items-center gap-2">
                    <span className={change.changeType === 'IN' ? styles.plusIcon : styles.minusIcon}>
                      {change.changeType === 'IN' ? '+' : '-'}
                    </span>
                    <span>{change.amount} {change.symbol}</span>
                  </div>
                  {change.changeType === 'OUT' && (
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-2 flex justify-between text-[10px] opacity-50 font-mono border-t border-dashed border-cyan-500/30">
            <span>GAS_EST: {result.gasUsed}</span>
            <span>SID: {result.simulationId.slice(0, 8)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
