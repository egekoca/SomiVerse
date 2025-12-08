/**
 * SomiVerse - Cyberpunk Metropolis
 * Main entry point
 */

import './styles/main.css';

import { Game } from './game/Game.js';
import { Loader } from './components/Loader.js';
import { Modal } from './components/Modal.js';
import { ActionButton } from './components/ActionButton.js';
import { Header } from './components/Header.js';
import { ProfileModal } from './components/ProfileModal.js';
import { ProfileService } from './services/ProfileService.js';
import { LevelUpPopup } from './components/LevelUpPopup.js';

async function main() {
  // Create UI components
  const loader = new Loader();
  const modal = new Modal();
  const actionButton = new ActionButton();
  const profileModal = new ProfileModal();
  const header = new Header(profileModal);
  const levelUpPopup = new LevelUpPopup();

  // Track previous level for level up detection
  let previousLevel = null;

  // Initialize game
  const game = new Game({
    loader,
    modal,
    actionButton
  });

  await game.init();
  game.start();

  // Wallet connection events
  window.addEventListener('walletConnected', (e) => {
    console.log('Wallet connected:', e.detail.account);
    console.log('Profile:', e.detail.profile);
    // Set initial level when wallet connects
    if (e.detail.profile && e.detail.profile.level !== undefined) {
      previousLevel = e.detail.profile.level;
    } else {
      // Fallback: try to get from ProfileService
      const currentProfile = ProfileService.getCurrentProfile();
      if (currentProfile && currentProfile.level !== undefined) {
        previousLevel = currentProfile.level;
      }
    }
  });

  window.addEventListener('walletDisconnected', () => {
    console.log('Wallet disconnected');
    previousLevel = null;
  });

  // XP events - detect level up
  window.addEventListener('xpGained', (e) => {
    const { amount, totalXP, level } = e.detail;
    console.log(`+${amount} XP! Total: ${totalXP} (Level ${level})`);
    
    // Check if level increased
    if (previousLevel !== null && level > previousLevel) {
      // Level up detected!
      levelUpPopup.show(level, previousLevel);
    }
    
    // Update previous level
    previousLevel = level;
  });

  // Global access for debugging
  window.game = game;
  window.header = header;
  window.profile = ProfileService;
}

// Start when page loads
document.addEventListener('DOMContentLoaded', main);
