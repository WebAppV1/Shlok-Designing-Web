/**
 * data.js
 * A tiny client-side "backend" for the demo. Everything is persisted to
 * localStorage so the Admin Panel, Dealer Portal and Catalog all read/write
 * the same data set, the way they would talk to a real database in
 * production. Replace this module with real API calls when this prototype
 * is connected to a server.
 */

const DB = {
  KEYS: {
    designs: 'shlok_designs',
    customOrders: 'shlok_custom_orders',
    dealerOrders: 'shlok_dealer_orders',
    production: 'shlok_production',
    inventory: 'shlok_inventory',
    dealers: 'shlok_dealers',
    dealerSession: 'shlok_dealer_session',
    adminSession: 'shlok_admin_session',
  },

  STAGES: ['Raw Material', 'Dyeing', 'Jacquard Weaving', 'Finishing & Zari Work', 'Quality Check', 'Ready to Dispatch'],

  seedIfEmpty() {
    if (!localStorage.getItem(this.KEYS.designs)) {
      localStorage.setItem(this.KEYS.designs, JSON.stringify(this.defaultDesigns()));
    }
    if (!localStorage.getItem(this.KEYS.production)) {
      localStorage.setItem(this.KEYS.production, JSON.stringify(this.defaultProduction()));
    }
    if (!localStorage.getItem(this.KEYS.inventory)) {
      localStorage.setItem(this.KEYS.inventory, JSON.stringify(this.defaultInventory()));
    }
    if (!localStorage.getItem(this.KEYS.dealers)) {
      localStorage.setItem(this.KEYS.dealers, JSON.stringify(this.defaultDealers()));
    }
    if (!localStorage.getItem(this.KEYS.customOrders)) {
      localStorage.setItem(this.KEYS.customOrders, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.dealerOrders)) {
      localStorage.setItem(this.KEYS.dealerOrders, JSON.stringify(this.defaultDealerOrders()));
    }
  },

  defaultDesigns() {
    return [
      {
        id: 'SD-101',
        name: 'Rani Zari Brocade',
        category: 'Banarasi Brocade',
        fabric: 'Silk Blend, Zari Booti',
        colorway: 'Maroon / Antique Gold',
        image: '../assets/img/saree-maroon-gold.jpg',
        moq: 25,
        description: 'Dense zari booti brocade on a deep wine base — our signature festive/bridal design, woven on the triple pana rapier jacquard.',
      },
      {
        id: 'SD-102',
        name: 'Champagne Mist Tissue',
        category: 'Tissue Zari',
        fabric: 'Tissue Silk, Zari Buti',
        colorway: 'Champagne Gold / Coral Booti',
        image: '../assets/img/saree-beige-gold.jpg',
        moq: 30,
        description: 'Light tissue-zari fabric with a scattered coral booti — soft drape, suited for daytime festive wear.',
      },
      {
        id: 'SD-103',
        name: 'Teal Reserve Katan',
        category: 'Katan Silk',
        fabric: 'Katan Silk, Zari Border',
        colorway: 'Teal / Gold',
        image: '../assets/img/thread-spools.jpg',
        moq: 20,
        description: 'Upcoming colourway from our current dye lot — teal body with a gold zari border, in development.',
      },
    ];
  },

  defaultProduction() {
    const today = new Date();
    const iso = (daysAgo) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString();
    };
    return [
      { id: 'BATCH-2207', designId: 'SD-101', qty: 60, stage: 'Jacquard Weaving', startedAt: iso(6), updatedAt: iso(1), notes: 'On triple pana rapier loom #2' },
      { id: 'BATCH-2208', designId: 'SD-102', qty: 40, stage: 'Dyeing', startedAt: iso(3), updatedAt: iso(0), notes: 'Coral booti dye lot 14' },
      { id: 'BATCH-2209', designId: 'SD-101', qty: 25, stage: 'Quality Check', startedAt: iso(10), updatedAt: iso(1), notes: 'Final zari inspection' },
      { id: 'BATCH-2210', designId: 'SD-103', qty: 30, stage: 'Raw Material', startedAt: iso(1), updatedAt: iso(1), notes: 'Awaiting teal filament stock' },
      { id: 'BATCH-2211', designId: 'SD-102', qty: 50, stage: 'Ready to Dispatch', startedAt: iso(14), updatedAt: iso(2), notes: 'Packed, awaiting dealer pickup' },
    ];
  },

  defaultInventory() {
    return [
      { material: 'Zari Gold Filament (Cone)', unit: 'kg', stock: 42, reorder: 20 },
      { material: 'Silk Yarn — Maroon', unit: 'kg', stock: 18, reorder: 25 },
      { material: 'Silk Yarn — Teal', unit: 'kg', stock: 9, reorder: 15 },
      { material: 'Reactive Dye — Coral', unit: 'ltr', stock: 6, reorder: 10 },
      { material: 'Grey Base Fabric (Tissue)', unit: 'mtr', stock: 210, reorder: 100 },
    ];
  },

  defaultDealers() {
    return [
      { id: 'D-01', company: 'Meera Textiles', contact: 'Meera Shah', phone: '9825000001', password: 'meera123' },
      { id: 'D-02', company: 'Om Sarees Wholesale', contact: 'Om Patel', phone: '9825000002', password: 'om123' },
    ];
  },

  defaultDealerOrders() {
    return [
      { id: 'ORD-3001', dealerId: 'D-01', designId: 'SD-101', qty: 25, status: 'In Production', placedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: 'ORD-3002', dealerId: 'D-01', designId: 'SD-102', qty: 15, status: 'Ready to Dispatch', placedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
    ];
  },

  // ---- generic get/set ----
  get(key) { return JSON.parse(localStorage.getItem(key) || '[]'); },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },

  designs() { return this.get(this.KEYS.designs); },
  design(id) { return this.designs().find((d) => d.id === id); },

  production() { return this.get(this.KEYS.production); },
  saveProduction(list) { this.set(this.KEYS.production, list); },

  inventory() { return this.get(this.KEYS.inventory); },
  saveInventory(list) { this.set(this.KEYS.inventory, list); },

  dealers() { return this.get(this.KEYS.dealers); },
  dealerByPhone(phone) { return this.dealers().find((d) => d.phone === phone); },

  customOrders() { return this.get(this.KEYS.customOrders); },
  addCustomOrder(order) {
    const list = this.customOrders();
    list.unshift(order);
    this.set(this.KEYS.customOrders, list);
  },
  updateCustomOrderStatus(id, status) {
    const list = this.customOrders().map((o) => (o.id === id ? { ...o, status } : o));
    this.set(this.KEYS.customOrders, list);
  },

  dealerOrders() { return this.get(this.KEYS.dealerOrders); },
  addDealerOrder(order) {
    const list = this.dealerOrders();
    list.unshift(order);
    this.set(this.KEYS.dealerOrders, list);
  },
  updateDealerOrderStatus(id, status) {
    const list = this.dealerOrders().map((o) => (o.id === id ? { ...o, status } : o));
    this.set(this.KEYS.dealerOrders, list);
  },

  nextId(prefix, list) {
    const n = 1000 + list.length + Math.floor(Math.random() * 90);
    return `${prefix}-${n}`;
  },

  // ---- sessions ----
  setDealerSession(dealer) { sessionStorage.setItem(this.KEYS.dealerSession, JSON.stringify(dealer)); },
  getDealerSession() {
    const v = sessionStorage.getItem(this.KEYS.dealerSession);
    return v ? JSON.parse(v) : null;
  },
  clearDealerSession() { sessionStorage.removeItem(this.KEYS.dealerSession); },

  setAdminSession() { sessionStorage.setItem(this.KEYS.adminSession, 'true'); },
  getAdminSession() { return sessionStorage.getItem(this.KEYS.adminSession) === 'true'; },
  clearAdminSession() { sessionStorage.removeItem(this.KEYS.adminSession); },
};

DB.seedIfEmpty();
