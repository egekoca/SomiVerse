/**
 * Modal Component
 * HUD-style modal window system with action handlers
 */
import { FaucetService } from '../services/FaucetService.js';

export class Modal {
  constructor() {
    this.overlay = null;
    this.modal = null;
    this.titleEl = null;
    this.bodyEl = null;
    this.isOpen = false;
    this.onClose = null;
    this.currentType = null;
    this.walletAddress = null;
    
    this.create();
    this.setupWalletListener();
  }

  create() {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'modal-overlay';
    
    // Modal
    this.modal = document.createElement('div');
    this.modal.id = 'game-modal';
    this.modal.innerHTML = `
      <div class="modal-header">
        <div>
          <h2 class="modal-title" id="m-title">TITLE</h2>
          <div class="modal-subtitle">SECURE CONNECTION ESTABLISHED</div>
        </div>
        <div class="system-status">
          NET: ONLINE<br>
          PING: 12ms<br>
          ID: #8842-X
        </div>
        <button class="close-btn" id="modal-close">×</button>
      </div>
      <div class="modal-body" id="m-body"></div>
      <div class="modal-footer">
        <span>/// SYSTEM READY</span>
        <span>V.2.1.0</span>
      </div>
    `;

    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);

    // Element references
    this.titleEl = this.modal.querySelector('#m-title');
    this.bodyEl = this.modal.querySelector('#m-body');

    // Event listeners
    this.modal.querySelector('#modal-close').addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    // Interaction delegation
    this.bodyEl.addEventListener('click', (e) => {
      // Action buttons
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        this.handleAction(actionBtn.dataset.action, actionBtn);
        return;
      }

      // Swap Percent buttons
      if (e.target.classList.contains('percent-btn')) {
        this.handleSwapPercent(e.target.textContent);
      }

      // Swap Switch button
      if (e.target.closest('.switch-btn')) {
        this.handleSwapSwitch();
      }
    });

    // Input listener for swap calculation
    this.bodyEl.addEventListener('input', (e) => {
      if (e.target.classList.contains('cyber-input') && e.target.closest('.from-box')) {
        this.handleSwapInput(e.target.value);
      }
    });
  }

  setupWalletListener() {
    // Listen for wallet connection
    window.addEventListener('walletConnected', (e) => {
      this.walletAddress = e.detail.account;
      // Refresh content if faucet modal is open
      if (this.isOpen && this.currentType === 'CLAIM') {
        this.refreshFaucetContent();
      }
    });

    window.addEventListener('walletDisconnected', () => {
      this.walletAddress = null;
      if (this.isOpen && this.currentType === 'CLAIM') {
        this.refreshFaucetContent();
      }
    });
  }

  open(title, content, color = null, type = null) {
    this.titleEl.textContent = title;
    this.bodyEl.innerHTML = content;
    this.currentType = type;
    
    if (color) {
      const colorHex = '#' + color.toString(16).padStart(6, '0');
      document.documentElement.style.setProperty('--theme-color', colorHex);
    }
    
    this.overlay.classList.add('active');
    this.isOpen = true;

    // Initialize faucet service if needed
    if (type === 'CLAIM') {
      FaucetService.init();
    }

    // Auto-focus on first interactive element
    setTimeout(() => {
      const focusable = this.bodyEl.querySelector('input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled])');
      if (focusable) {
        focusable.focus();
      }
    }, 50);
  }

  close() {
    this.overlay.classList.remove('active');
    this.isOpen = false;
    this.currentType = null;
    if (this.onClose) this.onClose();
  }

  /**
   * Handle action button clicks
   */
  async handleAction(action, button) {
    switch (action) {
      case 'faucet':
        await this.handleFaucetClaim(button);
        break;
      case 'swap':
        await this.simulateTransaction(button, 'SWAP COMPLETED: 1.5 ETH -> 4500 USDC', 50);
        break;
      case 'lend':
        await this.simulateTransaction(button, 'DEPOSIT SUCCESSFUL: 1000 USDC', 75);
        break;
      case 'mint':
        await this.simulateTransaction(button, 'NFT MINTED: CYBER PUNK #8842', 150);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  // --- SWAP HANDLERS ---

  handleSwapPercent(percentStr) {
    const fromInput = this.bodyEl.querySelector('.from-box .cyber-input');
    // Extract balance (mock)
    const balanceText = this.bodyEl.querySelector('.swap-balance').textContent;
    const balance = parseFloat(balanceText.split(': ')[1]);

    let amount = 0;
    if (percentStr === 'MAX') {
      amount = balance;
    } else {
      const percent = parseInt(percentStr) / 100;
      amount = balance * percent;
    }

    fromInput.value = amount.toFixed(4);
    this.handleSwapInput(amount);
  }

  handleSwapSwitch() {
    const fromSymbolEl = this.bodyEl.querySelector('.from-box .token-name');
    const toSymbolEl = this.bodyEl.querySelector('.to-box .token-name');
    
    const temp = fromSymbolEl.textContent;
    fromSymbolEl.textContent = toSymbolEl.textContent;
    toSymbolEl.textContent = temp;

    // Trigger recalculation (mock rate inversion)
    const fromInput = this.bodyEl.querySelector('.from-box .cyber-input');
    this.handleSwapInput(fromInput.value);
  }

  handleSwapInput(value) {
    const toInput = this.bodyEl.querySelector('.to-box .cyber-input');
    const amount = parseFloat(value);
    
    if (isNaN(amount)) {
      toInput.value = '';
      return;
    }

    // Mock rate: 1 STT = 3.2 USDT
    // Check current direction by symbol
    const fromSymbol = this.bodyEl.querySelector('.from-box .token-name').textContent;
    
    let rate = 3.2;
    if (fromSymbol !== 'STT') rate = 1 / 3.2; // Inverse if switched

    toInput.value = (amount * rate).toFixed(4);
  }

  /**
   * Simulate transaction for demo purposes
   */
  async simulateTransaction(button, successMessage, xpReward) {
    if (!this.walletAddress) {
      window.dispatchEvent(new CustomEvent('requestWalletConnect'));
      this.showMessage('Please connect your wallet first.', 'warning');
      return;
    }

    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    const originalText = btnText ? btnText.textContent : '';

    if (btnText) btnText.classList.add('hidden');
    if (btnLoader) btnLoader.classList.remove('hidden');
    button.disabled = true;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show XP Popup instead of inline message for major actions
    this.showXPPopup(successMessage.split(':')[0], xpReward);
    
    // Reset button
    if (btnText) btnText.classList.remove('hidden');
    if (btnLoader) btnLoader.classList.add('hidden');
    button.disabled = false;

    // Add XP locally for demo
    if (window.profile && typeof window.profile.addXP === 'function') {
        window.profile.addXP(this.walletAddress, xpReward);
    }
  }

  /**
   * Show Full Screen XP Popup
   */
  showXPPopup(actionName, xpAmount) {
    const popup = document.createElement('div');
    popup.className = 'xp-popup';
    popup.innerHTML = `
      <div class="xp-popup-content">
        <button class="xp-close-btn">×</button>
        <div class="xp-header">MISSION ACCOMPLISHED</div>
        <div class="xp-action">${actionName}</div>
        <div class="xp-amount">+${xpAmount} <span class="xp-label">XP</span></div>
      </div>
    `;
    document.body.appendChild(popup);
    
    // Add styles dynamically if not present
    if (!document.getElementById('xp-popup-style')) {
      const style = document.createElement('style');
      style.id = 'xp-popup-style';
      style.textContent = `
        .xp-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          background: rgba(0,0,0,0.7);
          animation: fadeIn 0.3s forwards;
        }
        .xp-popup-content {
          position: relative;
          background: rgba(10, 10, 20, 0.95);
          border: 2px solid var(--theme-color, #00ffcc);
          padding: 30px 50px;
          text-align: center;
          border-radius: 10px;
          box-shadow: 0 0 30px rgba(var(--theme-rgb), 0, 255, 204), 0.5);
          transform: scale(0.8);
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .xp-close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.5em;
          cursor: pointer;
          transition: color 0.2s;
          line-height: 1;
          padding: 0 5px;
        }
        .xp-close-btn:hover {
          color: #fff;
        }
        .xp-header {
          color: #fff;
          font-family: 'Courier New', monospace;
          font-size: 1.2em;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }
        .xp-action {
          color: var(--theme-color, #00ffcc);
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        .xp-amount {
          font-size: 3em;
          color: #fff;
          font-weight: bold;
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        .xp-label {
          font-size: 0.4em;
          color: #888;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.5); } to { transform: scale(1); } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      `;
      document.head.appendChild(style);
    }

    // Close handler
    const closeBtn = popup.querySelector('.xp-close-btn');
    const removePopup = () => {
      if (popup.parentNode) {
        popup.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => {
          if (popup.parentNode) popup.parentNode.removeChild(popup);
        }, 300);
      }
    };

    closeBtn.addEventListener('click', removePopup);
    
    // Allow closing by clicking outside content
    popup.addEventListener('click', (e) => {
      if (e.target === popup) removePopup();
    });

    // Auto-remove after animation (increased delay to allow reading)
    setTimeout(removePopup, 3000);
  }

  /**
   * Handle faucet claim
   */
  async handleFaucetClaim(button) {
    // Check wallet connection
    if (!this.walletAddress) {
      window.dispatchEvent(new CustomEvent('requestWalletConnect'));
      this.showMessage('Please connect your wallet first.', 'warning');
      return;
    }

    // Check if can claim
    if (!FaucetService.canClaim(this.walletAddress)) {
      const remaining = FaucetService.formatCooldownTime(this.walletAddress);
      this.showMessage(`Please wait ${remaining} before claiming again.`, 'warning');
      return;
    }

    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (btnText) btnText.classList.add('hidden');
    if (btnLoader) btnLoader.classList.remove('hidden');
    button.disabled = true;

    try {
      const result = await FaucetService.claimTokens(this.walletAddress);
      
      // Use XP Popup instead of inline message
      this.showXPPopup('FAUCET CLAIM SUCCESSFUL', 25);
      
      // Show transaction link separately or in notification
      // For now, let's show it inline briefly
      if (result.txHash) {
        this.showMessage('Transaction Sent', 'success');
      }

      setTimeout(() => {
        this.refreshFaucetContent();
      }, 2000);

    } catch (error) {
      this.showMessage(error.message, 'error');
      if (btnText) btnText.classList.remove('hidden');
      if (btnLoader) btnLoader.classList.add('hidden');
      button.disabled = false;
    }
  }

  // ... existing methods (refreshFaucetContent, showMessage, etc.) ...
  
  /**
   * Refresh faucet modal content
   */
  async refreshFaucetContent() {
    const { generateFaucetContent } = await import('./ModalContent.js');
    this.bodyEl.innerHTML = generateFaucetContent(this.walletAddress);
  }

  showMessage(text, type = 'info', xpAmount = 0) {
    let messageEl = this.bodyEl.querySelector('.faucet-message');
    
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.className = 'faucet-message';
      this.bodyEl.appendChild(messageEl);
    }

    const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
    // XP badge is removed from inline message as we have popup now
    
    messageEl.innerHTML = `
      <div class="msg-row">
        <span class="msg-icon">${icon}</span>
        <span class="msg-text">${text.toUpperCase()}</span>
      </div>
    `;
    
    messageEl.className = `faucet-message ${type}`;
    messageEl.classList.remove('hidden');

    if (type !== 'error') {
      setTimeout(() => {
        messageEl.classList.add('hidden');
      }, 5000);
    }
  }

  showTxLink(txHash) {
    const explorerUrl = `https://dream-explorer.somnia.network/tx/${txHash}`;
    let linkEl = this.bodyEl.querySelector('.tx-link');
    if (!linkEl) {
      linkEl = document.createElement('a');
      linkEl.className = 'tx-link';
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
      this.bodyEl.appendChild(linkEl);
    }
    linkEl.href = explorerUrl;
    linkEl.textContent = `View Transaction: ${txHash.slice(0, 10)}...`;
    linkEl.classList.remove('hidden');
  }

  setContent(content) {
    this.bodyEl.innerHTML = content;
  }

  setTitle(title) {
    this.titleEl.textContent = title;
  }

  setOnClose(callback) {
    this.onClose = callback;
  }

  setWalletAddress(address) {
    this.walletAddress = address;
  }

  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

export default Modal;
