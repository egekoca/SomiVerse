/**
 * Modal Content Generators
 * Content generator functions for each building type
 */
import { FaucetService } from '../services/FaucetService.js';
import { ProfileService } from '../services/ProfileService.js';

export function generateSwapContent() {
  return `
    <style>
      .swap-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .swap-box {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(var(--theme-rgb), 0.3);
        padding: 12px;
        border-radius: 4px;
      }
      .swap-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.8em;
        color: rgba(255, 255, 255, 0.6);
        font-family: 'Courier New', monospace;
      }
      .input-row {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(var(--theme-rgb), 0.5);
        padding: 5px 10px;
        border-radius: 4px;
      }
      .input-row:focus-within {
        border-color: var(--theme-color);
        box-shadow: 0 0 10px rgba(var(--theme-rgb), 0.2);
      }
      .cyber-input {
        background: transparent;
        border: none;
        color: #fff;
        font-size: 1.2em;
        width: 100%;
        font-family: 'Courier New', monospace;
        outline: none;
      }
      .token-selector {
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(255, 255, 255, 0.1);
        padding: 4px 8px;
        border-radius: 15px;
        cursor: pointer;
        white-space: nowrap;
        font-weight: bold;
        transition: all 0.2s;
      }
      .token-selector:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .percent-row {
        display: flex;
        gap: 8px;
        margin-top: 10px;
        justify-content: flex-end;
      }
      .percent-btn {
        background: transparent;
        border: 1px solid rgba(var(--theme-rgb), 0.3);
        color: var(--theme-color);
        padding: 2px 8px;
        font-size: 0.7em;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Courier New', monospace;
      }
      .percent-btn:hover {
        background: rgba(var(--theme-rgb), 0.2);
        border-color: var(--theme-color);
      }
      .swap-divider {
        display: flex;
        justify-content: center;
        margin: -10px 0;
        z-index: 2;
      }
      .switch-btn {
        background: #000;
        border: 1px solid var(--theme-color);
        color: var(--theme-color);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
      }
      .switch-btn:hover {
        background: var(--theme-color);
        color: #000;
        transform: rotate(180deg);
      }
      .swap-details {
        background: rgba(0, 0, 0, 0.2);
        padding: 10px;
        border-radius: 4px;
        font-size: 0.85em;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        color: rgba(255, 255, 255, 0.7);
      }
      .detail-row.highlight {
        color: var(--theme-color);
        font-weight: bold;
        margin-top: 8px;
        border-top: 1px dashed rgba(255, 255, 255, 0.2);
        padding-top: 8px;
      }
      .swap-btn {
        width: 100%;
        padding: 15px;
        font-size: 1.1em;
        margin-top: 10px;
      }
    </style>

    <div class="swap-container">
      <div class="swap-box from-box">
        <div class="swap-header">
          <span class="swap-label">FROM</span>
          <span class="swap-balance">Balance: 12.5</span>
        </div>
        <div class="input-row">
          <input type="number" class="cyber-input" placeholder="0.0" value="1">
          <div class="token-selector">
            <span class="token-icon">◈</span>
            <span class="token-name">STT</span>
            <span class="token-arrow">▼</span>
          </div>
        </div>
        <div class="percent-row">
          <button class="percent-btn">25%</button>
          <button class="percent-btn">50%</button>
          <button class="percent-btn">75%</button>
          <button class="percent-btn">MAX</button>
        </div>
      </div>

      <div class="swap-divider">
        <button class="switch-btn">⇅</button>
      </div>

      <div class="swap-box to-box">
        <div class="swap-header">
          <span class="swap-label">TO (ESTIMATED)</span>
        </div>
        <div class="input-row">
          <input type="number" class="cyber-input" placeholder="0.0" value="3.2000" readonly>
          <div class="token-selector">
            <span class="token-icon">$</span>
            <span class="token-name">USDT</span>
            <span class="token-arrow">▼</span>
          </div>
        </div>
      </div>

      <div class="swap-details">
        <div class="detail-row">
          <span>Rate</span>
          <span>1 STT = 3.2000 USDT</span>
        </div>
        <div class="detail-row">
          <span>Price Impact</span>
          <span class="text-green">< 0.1%</span>
        </div>
        <div class="detail-row">
          <span>Fee</span>
          <span>0.3%</span>
        </div>
        <div class="detail-row highlight">
          <span>Points Reward</span>
          <span class="text-neon">+150</span>
        </div>
      </div>

      <button class="primary-btn swap-btn" data-action="swap">
        <span class="btn-text">SWAP TOKENS</span>
        <span class="btn-loader hidden">PROCESSING...</span>
      </button>
      
      <div class="faucet-message hidden"></div>
    </div>
  `;
}

export function generateLendingContent() {
  return `
    <div class="defi-row">
      <span class="defi-label">TOTAL DEPOSITS</span>
      <span class="defi-value">$12,450,000</span>
    </div>
    <div class="defi-row">
      <span class="defi-label">APY (INTEREST)</span>
      <span class="defi-value text-green">+4.5%</span>
    </div>
    <div class="defi-row">
      <span class="defi-label">BORROW LIMIT</span>
      <span class="defi-value">80%</span>
    </div>
    <button class="primary-btn" data-action="lend">ADD FUNDS</button>
  `;
}

export function generateMintContent() {
  return `
    <div class="nft-preview">
      <div class="nft-preview-box">?</div>
      <div class="nft-preview-label">PREVIEW</div>
    </div>
    <div class="defi-row">
      <span class="defi-label">COLLECTION</span>
      <span class="defi-value">CYBER PUNKS</span>
    </div>
    <div class="defi-row">
      <span class="defi-label">PRICE</span>
      <span class="defi-value">0.05 ETH</span>
    </div>
    <button class="primary-btn" data-action="mint">MINT NFT</button>
  `;
}

/**
 * Generate Faucet content with live data
 */
export function generateFaucetContent(walletAddress = null) {
  const amount = FaucetService.getAmount();
  const canClaim = walletAddress ? FaucetService.canClaim(walletAddress) : false;
  const cooldownText = walletAddress ? FaucetService.formatCooldownTime(walletAddress) : null;
  
  let buttonText = 'CONNECT WALLET';
  let buttonDisabled = '';
  let statusClass = '';
  let countdownDisplay = '';
  
  if (walletAddress) {
    if (canClaim) {
      buttonText = `CLAIM ${amount} STT`;
      statusClass = 'ready';
    } else {
      buttonText = 'ON COOLDOWN';
      buttonDisabled = 'disabled';
      statusClass = 'cooldown';
      countdownDisplay = `
        <div class="cooldown-timer">
          <span class="cooldown-label">NEXT CLAIM IN</span>
          <span class="cooldown-value">${cooldownText}</span>
        </div>
      `;
    }
  }

  return `
    <div class="faucet-container">
      <div class="faucet-status ${statusClass}">
        ${canClaim ? 'READY TO CLAIM' : (walletAddress ? 'ON COOLDOWN' : 'WALLET NOT CONNECTED')}
      </div>
      
      ${countdownDisplay}
      
      <div class="defi-row">
        <span class="defi-label">NETWORK</span>
        <span class="defi-value">SOMNIA</span>
      </div>
      <div class="defi-row">
        <span class="defi-label">REWARD</span>
        <span class="defi-value">${amount} STT</span>
      </div>
      <div class="defi-row">
        <span class="defi-label">COOLDOWN PERIOD</span>
        <span class="defi-value">24 HOURS</span>
      </div>
      <div class="defi-row">
        <span class="defi-label">XP REWARD</span>
        <span class="defi-value text-green">+25 XP</span>
      </div>
      
      <button class="primary-btn faucet-btn ${statusClass}" data-action="faucet" ${buttonDisabled}>
        <span class="btn-text">${buttonText}</span>
        <span class="btn-loader hidden">PROCESSING...</span>
      </button>
      
      <div class="faucet-message hidden"></div>
    </div>
  `;
}

export default {
  generateSwapContent,
  generateLendingContent,
  generateMintContent,
  generateFaucetContent
};
