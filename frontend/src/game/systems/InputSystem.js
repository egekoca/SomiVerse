import { CONFIG } from '../config.js';

/**
 * Input System
 * Klavye girdileri yönetimi
 */
export class InputSystem {
  constructor() {
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      up: false,
      down: false,
      left: false,
      right: false
    };
    
    this.enabled = true;
    this.actionCallback = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => this.handleKey(e, true));
    window.addEventListener('keyup', (e) => this.handleKey(e, false));
  }

  onAction(callback) {
    this.actionCallback = callback;
  }

  handleKey(e, state) {
    if (!this.enabled) return;
    
    const k = e.key.toLowerCase();
    
    // Action key (Enter) - Trigger only on key down
    if (k === 'enter' && state && this.actionCallback) {
      this.actionCallback();
      return;
    }

    if (['w', 'arrowup'].includes(k)) {
      this.keys.w = state;
      this.keys.up = state;
    }
    if (['a', 'arrowleft'].includes(k)) {
      this.keys.a = state;
      this.keys.left = state;
    }
    if (['s', 'arrowdown'].includes(k)) {
      this.keys.s = state;
      this.keys.down = state;
    }
    if (['d', 'arrowright'].includes(k)) {
      this.keys.d = state;
      this.keys.right = state;
    }
  }

  getMovement() {
    if (!this.enabled) return { dx: 0, dz: 0, isMoving: false };
    
    const speed = CONFIG.player.speed;
    
    // Calculate raw direction (-1, 0, or 1 for each axis)
    const up = this.keys.w || this.keys.up;
    const down = this.keys.s || this.keys.down;
    const left = this.keys.a || this.keys.left;
    const right = this.keys.d || this.keys.right;
    
    // Cancel out opposite directions
    let dx = (right ? 1 : 0) - (left ? 1 : 0);
    let dz = (down ? 1 : 0) - (up ? 1 : 0);
    
    const isMoving = dx !== 0 || dz !== 0;
    
    // Normalize diagonal movement (prevent faster speed)
    if (dx !== 0 && dz !== 0) {
      const normalize = 1 / Math.SQRT2; // ≈ 0.7071
      dx *= normalize;
      dz *= normalize;
    }

    return {
      dx: dx * speed,
      dz: dz * speed,
      isMoving
    };
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    // Tüm tuşları sıfırla
    Object.keys(this.keys).forEach(key => {
      this.keys[key] = false;
    });
  }

  isEnabled() {
    return this.enabled;
  }
}

export default InputSystem;
