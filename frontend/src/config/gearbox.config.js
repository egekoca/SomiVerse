/**
 * Gearbox Protocol Configuration
 * Composable Leverage Protocol - Lending Pools
 * 
 * Gearbox allows lenders to deposit assets and earn passive yield
 * Single-asset deposits, no impermanent loss
 */

export const GEARBOX_CONFIG = {
  // Gearbox Protocol V3 addresses on Somnia Mainnet
  // Found from: https://app.gearbox.finance/pools/5031/0x6f652fbcfc2107ef9c99456311b5650cd52d6419/dashboard
  
  // Pool contract address (SOMI v3 pool)
  poolAddress: '0x6f652fbcfc2107ef9c99456311b5650cd52d6419',
  
  // Gearbox V3 uses Credit Manager and Credit Facade
  // These will be detected from pool contract or set manually
  creditManager: null, // Will be detected from pool
  creditFacade: null,   // Optional
  poolService: null,    // Optional
  
  // Supported lending tokens (Somnia Mainnet)
  // Based on Gearbox app: https://app.gearbox.finance/pools/5031/...
  supportedTokens: {
    SOMI: {
      symbol: 'SOMI',
      name: 'Somnia Token',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Native SOMI
      decimals: 18,
      icon: '◈',
      wrappedAddress: '0x046EDe9564A72571df6F5e44d0405360c0f4dCab' // WSOMI (Wrapped SOMI)
    },
    WSOMI: {
      symbol: 'WSOMI',
      name: 'Wrapped Somnia Token',
      address: '0x046EDe9564A72571df6F5e44d0405360c0f4dCab', // WSOMI token address
      decimals: 18,
      icon: '◈'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: null, // TODO: Find USDC.e address on Somnia mainnet
      decimals: 18,
      icon: '$'
    }
  },
  
  // Lending settings
  settings: {
    xpReward: 75, // XP reward for lending actions
    minDeposit: 0.01, // Minimum deposit amount
    // Note: APY is dynamic and fetched from pools
  },
  
  // Pool configuration (SOMI v3 pool)
  // Contract addresses from: https://explorer.somnia.network/tx/0xb8c2a23861704844f286fc4313cb8a0f7b739ee5cd9ddde5c62d3b2c95eebc07
  pools: [
    {
      id: 'somi_v3',
      token: 'WSOMI',
      poolAddress: '0x6f652fbCfC2107ef9C99456311B5650cd52D6419', // PoolV3 contract
      lpToken: '0x6f652fbCfC2107ef9C99456311B5650cd52D6419', // dWSOMI-V3-1 (same as pool, Diesel token)
      apy: 0, // Will be fetched from contract
      totalSupply: 0, // Will be fetched from contract
      utilizationRate: 0 // Will be fetched from contract
    }
  ]
};

// Gearbox V3 Credit Facade ABI (for lending operations)
export const GEARBOX_CREDIT_FACADE_ABI = [
  // Collateral operations
  'function addCollateral(address token, uint256 amount) returns (uint256)',
  'function addCollateral(address token, uint256 amount, address onBehalfOf) returns (uint256)',
  'function removeCollateral(address token, uint256 amount) returns (uint256)',
  
  // Credit account info
  'function creditAccount() view returns (address)',
  'function creditAccounts(address) view returns (address)',
  
  // Limits
  'function maxLeverage() view returns (uint256)',
  'function minHealthFactor() view returns (uint256)'
];

// Gearbox V3 Credit Manager ABI
export const GEARBOX_CREDIT_MANAGER_ABI = [
  // Pool operations (for lenders)
  'function addLiquidity(address token, uint256 amount, address onBehalfOf, uint256 referralCode) returns (uint256)',
  'function removeLiquidity(address token, uint256 amount, address to) returns (uint256)',
  
  // Pool data
  'function getTotalBorrowed(address token) view returns (uint256)',
  'function getAvailableLiquidity(address token) view returns (uint256)',
  'function getTotalLiquidity(address token) view returns (uint256)',
  
  // Credit account
  'function creditAccounts(address) view returns (address)',
  'function creditFacade() view returns (address)'
];

// Gearbox V3 Pool ABI (for lending pools)
// Based on actual transactions:
// Deposit: https://explorer.somnia.network/tx/0xb8c2a23861704844f286fc4313cb8a0f7b739ee5cd9ddde5c62d3b2c95eebc07
// Withdraw: https://explorer.somnia.network/tx/0xe4e8bd7a2db633a6e01e295d962c07a9baae9620d2f8188ba1059ff70a93cce3
export const GEARBOX_POOL_ABI = [
  // Deposit/Withdraw (actual functions used)
  'function depositWithReferral(uint256 amount, address onBehalfOf, uint256 referralCode) returns (uint256)',
  // Gerçek transaction'da redeem(uint256 shares, address receiver, address owner) kullanılıyor
  // Function selector: 0xba087652
  'function redeem(uint256 shares, address receiver, address owner) returns (uint256)',
  'function addLiquidity(uint256 amount, address onBehalfOf, uint256 referralCode) returns (uint256)',
  'function removeLiquidity(uint256 amount, address to) returns (uint256)',
  
  // Conversion functions (for calculating shares from assets)
  'function convertToShares(uint256 assets) view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function previewRedeem(uint256 shares) view returns (uint256)',
  'function previewDeposit(uint256 assets) view returns (uint256)',
  
  // Balance (Diesel/LP token is the same contract)
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Pool info
  'function underlyingToken() view returns (address)',
  'function dieselToken() view returns (address)',
  'function getLendAPY() view returns (uint256)',
  'function getBorrowAPY() view returns (uint256)',
  'function availableLiquidity() view returns (uint256)',
  'function totalBorrowed() view returns (uint256)',
  
  // Pool state checks
  'function paused() view returns (bool)'
  // Note: creditManager() may not exist on all pool contracts
];

// WETH/Wrapped Token ABI (for wrapping native tokens)
export const WETH_ABI = [
  'function deposit() payable',
  'function withdraw(uint256 amount)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

// ERC20 ABI (for approvals)
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)'
];

export default GEARBOX_CONFIG;

