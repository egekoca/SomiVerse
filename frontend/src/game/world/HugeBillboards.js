import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class HugeBillboards {
  constructor(scene) {
    this.scene = scene;
    this.billboards = [];
    this.billboardData = []; // Store billboard data for updates
    this.time = 0;
    this.imageChangeInterval = 30000; // 30 seconds in milliseconds
  }

  async create() {
    const textureLoader = new THREE.TextureLoader();
    const mapLimit = CONFIG.city.mapLimit; // 200
    const distance = mapLimit + 15;
    const width = mapLimit * 1.0;
    const height = width / 4;
    const elevation = height / 2 + 10;

    // Billboard 1 (North): somiversebillboard1.jpeg and somiversebillboard2.jpeg
    // Billboard 2 (West): somiversebillboard3.jpeg and somiversebillboard4.jpeg
    const billboardConfigs = [
      {
        position: { x: 0, z: -distance, rotY: 0 }, // North
        images: ['/somiversebillboard1.jpeg', '/somiversebillboard2.jpeg']
      },
      {
        position: { x: -distance, z: 0, rotY: Math.PI / 2 }, // West
        images: ['/somiversebillboard3.jpeg', '/somiversebillboard4.jpeg']
      }
    ];

    // Load textures for each billboard
    for (const config of billboardConfigs) {
      const textures = [];
      
      for (const imagePath of config.images) {
        try {
          const texture = await new Promise((resolve, reject) => {
            textureLoader.load(imagePath, resolve, undefined, reject);
          });
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 16;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = true;
          textures.push(texture);
        } catch (e) {
          console.error(`Failed to load billboard texture ${imagePath}:`, e);
        }
      }

      if (textures.length > 0) {
        const billboardGroup = this.createBillboard(
          config.position,
          width,
          height,
          textures[0], // Start with first texture
          elevation,
          textures // Store all textures for rotation
        );
        
        // Store billboard data for updates
        this.billboardData.push({
          group: billboardGroup,
          textures: textures,
          currentTextureIndex: 0,
          lastChangeTime: Date.now()
        });
      }
    }
  }

  createBillboard(pos, width, height, initialTexture, elevation, allTextures) {
    const group = new THREE.Group();
    group.position.set(pos.x, elevation, pos.z);
    group.rotation.y = pos.rotY;

    // Billboard Material (Emissive for night visibility)
    const material = new THREE.MeshBasicMaterial({
      map: initialTexture,
      side: THREE.FrontSide,
      transparent: false,
      toneMapped: false
    });

    // Main Plane
    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { 
      isLink: true, 
      url: 'https://somnia.network/',
      isBillboard: true,
      material: material,
      textures: allTextures,
      currentIndex: 0
    };
    group.add(mesh);

    // Backing (so it's not invisible from behind, or maybe just dark)
    const backGeo = new THREE.PlaneGeometry(width, height);
    const backMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.rotation.y = Math.PI;
    backMesh.position.z = -2.0; // Increased distance to prevent Z-fighting (was -0.1)
    group.add(backMesh);

    // Frame/Border (Neon style)
    const frameThickness = 2;
    const frameGeo = new THREE.BoxGeometry(width + frameThickness, height + frameThickness, 1);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -1.0; // Moved behind main mesh (was -0.5)
    group.add(frame);

    // Neon Edge
    const edgeGeo = new THREE.BoxGeometry(width + frameThickness + 1, height + frameThickness + 1, 0.5);
    const edgeMat = new THREE.MeshBasicMaterial({ 
      color: 0xaa00ff, // Purple neon matching theme
      transparent: true, 
      opacity: 0.5 
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.z = -1.0; // Match frame depth
    group.add(edge);
    
    // Bottom Supports (Pillars)
    const pillarHeight = elevation;
    const pillarGeo = new THREE.BoxGeometry(4, pillarHeight, 4);
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    
    // Left Pillar
    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-width / 2 + 10, -height/2 - pillarHeight/2, 0);
    group.add(leftPillar);

    // Right Pillar
    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(width / 2 - 10, -height/2 - pillarHeight/2, 0);
    group.add(rightPillar);

    this.scene.add(group);
    this.billboards.push(group);
    
    // Return the group so it can be stored in billboardData
    return group;
  }

  getBillboards() {
    return this.billboards;
  }

  /**
   * Update billboard textures (rotate every 30 seconds)
   */
  update(deltaTime, playerPosition) {
    if (!this.billboardData || this.billboardData.length === 0) {
      return;
    }

    const now = Date.now();
    
    this.billboardData.forEach((data) => {
      // Safety check: ensure data and group exist
      if (!data || !data.group || !data.textures || data.textures.length === 0) {
        return;
      }

      // Check if 30 seconds have passed
      if (now - data.lastChangeTime >= this.imageChangeInterval) {
        // Switch to next texture
        data.currentTextureIndex = (data.currentTextureIndex + 1) % data.textures.length;
        const newTexture = data.textures[data.currentTextureIndex];
        
        // Update material
        const mesh = data.group.children.find(child => child.userData && child.userData.isBillboard);
        if (mesh && mesh.material) {
          mesh.material.map = newTexture;
          mesh.material.needsUpdate = true;
        }
        
        data.lastChangeTime = now;
      }
    });
  }

  /**
   * Check if player is near any billboard
   * Returns the nearest billboard group if within range
   */
  getNearestBillboard(playerPosition, range = 50) {
    if (!playerPosition || !this.billboardData || this.billboardData.length === 0) {
      return null;
    }

    let nearest = null;
    let minDist = Infinity;

    this.billboardData.forEach(data => {
      // Safety check: ensure data and group exist
      if (!data || !data.group || !data.group.position) {
        return;
      }

      const billboardPos = data.group.position;
      const dx = billboardPos.x - playerPosition.x;
      const dz = billboardPos.z - playerPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < range && distance < minDist) {
        minDist = distance;
        nearest = data.group;
      }
    });

    return nearest;
  }
}

export default HugeBillboards;

