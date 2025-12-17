/**
 * DeFi Protocol Integrations
 * 
 * This module provides functions to track positions across major DeFi protocols:
 * - Aave V3: Lending/borrowing positions
 * - Uniswap V3: Liquidity provider positions
 * - Curve Finance: Liquidity pool positions
 * - Compound V3: Supply/borrow positions
 * - Lido: Staked ETH positions
 */

import { ethers } from 'ethers';

// Initialize provider with RPC URL from environment
// Requires ETH_RPC_URL to be configured
// Initialize provider with RPC URL from environment
// Provide fallback for build time / public access
const rpcUrl = process.env.ETH_RPC_URL || 'https://cloudflare-eth.com';
const provider = new ethers.JsonRpcProvider(rpcUrl);

/**
 * AAVE V3 Position Tracking
 * Fetches user's lending and borrowing positions on Aave V3
 */
export async function getAavePositions(walletAddress: string) {
  const AAVE_POOL = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'; // Ethereum mainnet

  try {
    const poolContract = new ethers.Contract(
      AAVE_POOL,
      ['function getUserAccountData(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256)'],
      provider
    );

    const accountData = await poolContract.getUserAccountData(walletAddress);

    return {
      protocol: 'Aave',
      totalCollateralETH: ethers.formatEther(accountData[0]),
      totalDebtETH: ethers.formatEther(accountData[1]),
      availableBorrowsETH: ethers.formatEther(accountData[2]),
      currentLiquidationThreshold: accountData[3].toString(),
      ltv: accountData[4].toString(),
      healthFactor: ethers.formatUnits(accountData[5], 18),
    };
  } catch (error) {
    console.error('Aave fetch error:', error);
    return null;
  }
}

/**
 * Uniswap V3 LP Positions
 * Fetches user's liquidity provider positions on Uniswap V3
 */
export async function getUniswapPositions(walletAddress: string) {
  const POSITIONS_NFT = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

  try {
    const positionsContract = new ethers.Contract(
      POSITIONS_NFT,
      [
        'function balanceOf(address) view returns (uint256)',
        'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
        'function positions(uint256) view returns (uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)',
      ],
      provider
    );

    const balance = await positionsContract.balanceOf(walletAddress);
    const positions = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await positionsContract.tokenOfOwnerByIndex(walletAddress, i);
      const position = await positionsContract.positions(tokenId);

      positions.push({
        tokenId: tokenId.toString(),
        token0: position[2],
        token1: position[3],
        fee: position[4],
        liquidity: position[7].toString(), // uint128 liquidity amount, no decimal conversion
      });
    }

    return {
      protocol: 'Uniswap V3',
      positions,
      totalPositions: positions.length,
    };
  } catch (error) {
    console.error('Uniswap fetch error:', error);
    return null;
  }
}

/**
 * Curve Finance Positions
 * Fetches user's liquidity positions on Curve Finance
 * Note: Simplified implementation - production would iterate through known LP tokens
 */
export async function getCurvePositions(walletAddress: string) {
  // Use Curve's registry to find all pools user has liquidity in
  const CURVE_REGISTRY = '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5';

  try {
    const registryContract = new ethers.Contract(
      CURVE_REGISTRY,
      ['function get_pool_from_lp_token(address) view returns (address)'],
      provider
    );

    // This is simplified - in production, iterate through known Curve LP tokens
    return {
      protocol: 'Curve',
      positions: [],
      note: 'Curve integration requires iterating LP tokens',
    };
  } catch (error) {
    console.error('Curve fetch error:', error);
    return null;
  }
}

/**
 * Compound V3 Positions
 * Fetches user's supply and borrow positions on Compound V3
 */
export async function getCompoundPositions(walletAddress: string) {
  const COMET_USDC = '0xc3d688B66703497DAA19211EEdff47f25384cdc3'; // cUSDCv3

  try {
    const cometContract = new ethers.Contract(
      COMET_USDC,
      [
        'function balanceOf(address) view returns (uint256)',
        'function borrowBalanceOf(address) view returns (uint256)',
      ],
      provider
    );

    const supplied = await cometContract.balanceOf(walletAddress);
    const borrowed = await cometContract.borrowBalanceOf(walletAddress);

    // Calculate net position directly on BigInt values before formatting
    const netPositionRaw = supplied - borrowed;

    return {
      protocol: 'Compound V3',
      supplied: ethers.formatUnits(supplied, 6), // USDC has 6 decimals
      borrowed: ethers.formatUnits(borrowed, 6),
      netPosition: ethers.formatUnits(netPositionRaw, 6),
    };
  } catch (error) {
    console.error('Compound fetch error:', error);
    return null;
  }
}

/**
 * Lido Staked ETH
 * Fetches user's staked ETH balance on Lido
 */
export async function getLidoPosition(walletAddress: string) {
  const STETH = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';

  try {
    const stETHContract = new ethers.Contract(
      STETH,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    const balance = await stETHContract.balanceOf(walletAddress);

    return {
      protocol: 'Lido',
      stETH: ethers.formatEther(balance),
      type: 'Staking',
    };
  } catch (error) {
    console.error('Lido fetch error:', error);
    return null;
  }
}

/**
 * Master function to fetch all DeFi positions
 * Aggregates positions from all supported protocols
 */
export async function getAllDeFiPositions(walletAddress: string) {
  const [aave, uniswap, curve, compound, lido] = await Promise.all([
    getAavePositions(walletAddress),
    getUniswapPositions(walletAddress),
    getCurvePositions(walletAddress),
    getCompoundPositions(walletAddress),
    getLidoPosition(walletAddress),
  ]);

  return {
    wallet: walletAddress,
    protocols: {
      aave,
      uniswap,
      curve,
      compound,
      lido,
    },
    timestamp: new Date().toISOString(),
  };
}
