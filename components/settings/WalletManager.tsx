"use client"

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Wallet, Edit2, Check, X } from 'lucide-react'

interface UserWallet {
    id: string
    address: string
    label: string
    chain: string
    created_at: string
}

export function WalletManager() {
    const [wallets, setWallets] = useState<UserWallet[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Add wallet form state
    const [newAddress, setNewAddress] = useState('')
    const [newLabel, setNewLabel] = useState('')
    const [error, setError] = useState('')

    // Edit wallet state
    const [editLabel, setEditLabel] = useState('')

    useEffect(() => {
        loadWallets()
    }, [])

    async function loadWallets() {
        setLoading(true)
        const supabase = createBrowserClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            logger.warn('No user found when loading wallets')
            setLoading(false)
            return
        }

        const { data, error: fetchError } = await supabase
            .from('user_wallets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (fetchError) {
            logger.error('Failed to load wallets', { error: fetchError })
            setError('Failed to load wallets')
        } else {
            setWallets(data || [])
        }

        setLoading(false)
    }

    async function handleAddWallet() {
        if (!newAddress.trim()) {
            setError('Wallet address is required')
            return
        }

        //Validate Ethereum address format (basic check)
        if (!/^0x[a-fA-F0-9]{40}$/.test(newAddress.trim())) {
            setError('Invalid Ethereum address format')
            return
        }

        setError('')
        const supabase = createBrowserClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error: insertError } = await supabase
            .from('user_wallets')
            .insert([{
                user_id: user.id,
                address: newAddress.trim(),
                label: newLabel.trim() || `Wallet ${wallets.length + 1}`,
                chain: 'ethereum',
            }])
            .select()
            .single()

        if (insertError) {
            logger.error('Failed to add wallet', { error: insertError })
            setError('Failed to add wallet. It may already exist.')
        } else {
            logger.info('Wallet added successfully', { walletId: data.id })
            setWallets([data, ...wallets])
            setNewAddress('')
            setNewLabel('')
            setAdding(false)
        }
    }

    async function handleUpdateLabel(walletId: string) {
        if (!editLabel.trim()) {
            setError('Label cannot be empty')
            return
        }

        const supabase = createBrowserClient()

        const { error: updateError } = await supabase
            .from('user_wallets')
            .update({ label: editLabel.trim() })
            .eq('id', walletId)

        if (updateError) {
            logger.error('Failed to update wallet label', { error: updateError, walletId })
            setError('Failed to update label')
        } else {
            logger.info('Wallet label updated', { walletId })
            setWallets(wallets.map(w => w.id === walletId ? { ...w, label: editLabel.trim() } : w))
            setEditingId(null)
            setEditLabel('')
        }
    }

    async function handleDeleteWallet(walletId: string) {
        if (!confirm('Are you sure you want to delete this wallet?')) {
            return
        }

        const supabase = createBrowserClient()

        const { error: deleteError } = await supabase
            .from('user_wallets')
            .delete()
            .eq('id', walletId)

        if (deleteError) {
            logger.error('Failed to delete wallet', { error: deleteError, walletId })
            setError('Failed to delete wallet')
        } else {
            logger.info('Wallet deleted', { walletId })
            setWallets(wallets.filter(w => w.id !== walletId))
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-white/5 rounded animate-pulse" />
                <div className="h-20 bg-white/5 rounded animate-pulse" />
                <div className="h-20 bg-white/5 rounded animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6" />
                        My Wallets
                    </h2>
                    <p className="text-white/60 text-sm mt-1">
                        Add Ethereum wallets to track your DeFi positions
                    </p>
                </div>

                {!adding && (
                    <Button
                        onClick={() => setAdding(true)}
                        className="bg-gradient-to-r from-[rgb(var(--color-bee-gold))] to-[rgb(var(--color-bee-amber))]"
                        aria-label="Add new wallet to track DeFi positions"
                    >
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        Add Wallet
                    </Button>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm" role="alert" aria-live="polite">
                    {error}
                </div>
            )}

            {/* Add wallet form */}
            {adding && (
                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Add New Wallet</h3>

                    <div>
                        <label htmlFor="wallet-address" className="block text-sm font-medium text-white/80 mb-2">
                            Wallet Address
                        </label>
                        <Input
                            id="wallet-address"
                            type="text"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="0x..."
                            className="bg-white/5 border-white/10 text-white"
                            aria-label="Wallet address"
                            aria-describedby="wallet-address-help"
                            aria-invalid={!!error}
                        />
                        <p id="wallet-address-help" className="text-xs text-white/40 mt-1">
                            Ethereum address (0x followed by 40 hex characters)
                        </p>
                    </div>

                    <div>
                        <label htmlFor="wallet-label" className="block text-sm font-medium text-white/80 mb-2">
                            Label (optional)
                        </label>
                        <Input
                            id="wallet-label"
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="My Main Wallet"
                            className="bg-white/5 border-white/10 text-white"
                            aria-label="Wallet label (optional)"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleAddWallet}
                            className="bg-gradient-to-r from-[rgb(var(--color-bee-gold))] to-[rgb(var(--color-bee-amber))]"
                            aria-label="Save wallet"
                        >
                            <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                            Add Wallet
                        </Button>
                        <Button
                            onClick={() => {
                                setAdding(false)
                                setNewAddress('')
                                setNewLabel('')
                                setError('')
                            }}
                            variant="outline"
                            aria-label="Cancel adding wallet"
                        >
                            <X className="w-4 h-4 mr-2" aria-hidden="true" />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Wallet list */}
            <div className="space-y-3">
                {wallets.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <Wallet className="w-12 h-12 mx-auto text-white/20 mb-4" />
                        <p className="text-white/60">No wallets added yet</p>
                        <p className="text-white/40 text-sm mt-1">
                            Add a wallet to start tracking your DeFi positions
                        </p>
                    </div>
                ) : (
                    wallets.map((wallet) => (
                        <div key={wallet.id} className="glass-card p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    {editingId === wallet.id ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="text"
                                                value={editLabel}
                                                onChange={(e) => setEditLabel(e.target.value)}
                                                className="bg-white/5 border-white/10 text-white max-w-xs"
                                                autoFocus
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateLabel(wallet.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingId(null)
                                                    setEditLabel('')
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white">{wallet.label}</h3>
                                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                                                    {wallet.chain}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/60 font-mono mt-1">
                                                {wallet.address}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {editingId !== wallet.id && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingId(wallet.id)
                                                setEditLabel(wallet.label)
                                            }}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteWallet(wallet.id)}
                                            className="text-red-400 hover:text-red-300 hover:border-red-500/50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
