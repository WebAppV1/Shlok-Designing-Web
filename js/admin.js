/**
 * admin.js
 * Auth-guards the dashboard, wires up the tab navigation, and renders
 * each panel from DB. All edits (stage changes, status changes) write
 * straight back to localStorage via the DB helpers in data.js.
 */

if (!DB.getAdminSession()) {
  window.location.href = 'login.html';
}

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  DB.clearAdminSession();
  window.location.href = 'login.html';
});

// ---------- Tabs ----------
document.querySelectorAll('.admin-side button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-side button').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

function statusBadgeClass(status) {
  const map = {
    New: 'badge-pending',
    'In Production': 'badge-progress',
    'Ready to Dispatch': 'badge-done',
    Dispatched: 'badge-done',
    'On Hold': 'badge-hold',
    Reviewing: 'badge-pending',
    Quoted: 'badge-progress',
    Confirmed: 'badge-done',
    Declined: 'badge-hold',
  };
  return map[status] || 'badge-pending';
}

// ---------- Overview ----------
function renderOverview() {
  const designs = DB.designs();
  const batches = DB.production();
  const dealerOrders = DB.dealerOrders();
  const inventory = DB.inventory();
  const lowStock = inventory.filter((i) => i.stock <= i.reorder).length;
  const readyUnits = batches.filter((b) => b.stage === 'Ready to Dispatch').reduce((s, b) => s + b.qty, 0);

  document.getElementById('statTiles').innerHTML = `
    <div class="stat-tile"><b>${batches.length}</b><span>Active Batches</span></div>
    <div class="stat-tile"><b>${dealerOrders.length}</b><span>Dealer Orders</span></div>
    <div class="stat-tile"><b>${readyUnits}</b><span>Units Ready to Dispatch</span></div>
    <div class="stat-tile"><b style="color:${lowStock ? 'var(--wine-700)' : 'var(--wine-800)'}">${lowStock}</b><span>Materials Below Reorder Level</span></div>
  `;

  const totals = designs.map((d) => ({
    name: d.name,
    id: d.id,
    total: batches.filter((b) => b.designId === d.id).reduce((s, b) => s + b.qty, 0),
  }));
  const max = Math.max(...totals.map((t) => t.total), 1);

  document.getElementById('chart').innerHTML = totals.map((t) => `
    <div class="chart-bar">
      <div class="bar" style="height:${Math.max((t.total / max) * 140, 4)}px;" title="${t.total} pcs"></div>
      <span>${t.id}<br>${t.total} pcs</span>
    </div>
  `).join('');
}

// ---------- Production ----------
function renderProduction() {
  const tbody = document.getElementById('productionTableBody');
  const batches = DB.production();

  tbody.innerHTML = batches.map((b) => {
    const design = DB.design(b.designId);
    return `
      <tr>
        <td class="mono">${b.id}</td>
        <td>${design ? design.name : b.designId}</td>
        <td>${b.qty}</td>
        <td>
          <select class="status-select" data-batch="${b.id}">
            ${DB.STAGES.map((s) => `<option value="${s}" ${s === b.stage ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td class="text-sm text-muted">${fmtDate(b.updatedAt)}</td>
        <td class="text-sm">${b.notes || ''}</td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.status-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      const batches = DB.production();
      const updated = batches.map((b) =>
        b.id === sel.dataset.batch ? { ...b, stage: sel.value, updatedAt: new Date().toISOString() } : b
      );
      DB.saveProduction(updated);
      showToast(`${sel.dataset.batch} moved to "${sel.value}"`);
      renderOverview();
      renderProduction();
    });
  });
}

// ---------- Dealer Orders ----------
function renderOrders() {
  const tbody = document.getElementById('ordersTableBody');
  const orders = DB.dealerOrders();
  const dealers = DB.dealers();
  const statuses = ['New', 'In Production', 'Ready to Dispatch', 'Dispatched', 'On Hold'];

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted" style="text-align:center;padding:32px;">No dealer orders yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map((o) => {
    const design = DB.design(o.designId);
    const d = dealers.find((x) => x.id === o.dealerId);
    return `
      <tr>
        <td class="mono">${o.id}</td>
        <td>${d ? d.company : o.dealerId}</td>
        <td>${design ? design.name : o.designId}</td>
        <td>${o.qty}</td>
        <td class="text-sm text-muted">${fmtDate(o.placedAt)}</td>
        <td>
          <select class="status-select" data-order="${o.id}">
            ${statuses.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.status-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      DB.updateDealerOrderStatus(sel.dataset.order, sel.value);
      showToast(`${sel.dataset.order} updated to "${sel.value}"`);
      renderOrders();
    });
  });
}

// ---------- Inventory ----------
function renderInventory() {
  const tbody = document.getElementById('inventoryTableBody');
  const items = DB.inventory();

  tbody.innerHTML = items.map((i, idx) => {
    const low = i.stock <= i.reorder;
    return `
      <tr>
        <td>${i.material}</td>
        <td>
          <input type="number" class="stock-input" data-idx="${idx}" value="${i.stock}"
            style="width:80px;padding:6px 8px;border:1px solid var(--line);border-radius:5px;font-family:var(--font-mono);font-size:13px;">
          <span class="text-sm text-muted"> ${i.unit}</span>
        </td>
        <td class="text-sm text-muted">${i.reorder} ${i.unit}</td>
        <td><span class="badge ${low ? 'badge-hold' : 'badge-done'}">${low ? 'Reorder Now' : 'Sufficient'}</span></td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.stock-input').forEach((inp) => {
    inp.addEventListener('change', () => {
      const items = DB.inventory();
      items[inp.dataset.idx].stock = parseFloat(inp.value) || 0;
      DB.saveInventory(items);
      showToast('Inventory updated');
      renderInventory();
      renderOverview();
    });
  });
}

// ---------- Custom Requests ----------
function renderCustom() {
  const tbody = document.getElementById('customTableBody');
  const requests = DB.customOrders();
  const statuses = ['New', 'Reviewing', 'Quoted', 'Confirmed', 'Declined'];

  if (!requests.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted" style="text-align:center;padding:32px;">No custom requests submitted yet — try the Catalog page's request form.</td></tr>`;
    return;
  }

  tbody.innerHTML = requests.map((r) => {
    const ref = r.referenceDesign ? DB.design(r.referenceDesign) : null;
    return `
      <tr>
        <td class="mono">${r.id}</td>
        <td>${r.name}<br><span class="text-sm text-muted">${r.phone}</span></td>
        <td class="text-sm">${r.phone}</td>
        <td class="text-sm">${ref ? ref.name : '—'}</td>
        <td>${r.qty || '—'}</td>
        <td class="text-sm" style="max-width:240px;">${r.details}</td>
        <td>
          <select class="status-select" data-custom="${r.id}">
            ${statuses.map((s) => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.status-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      DB.updateCustomOrderStatus(sel.dataset.custom, sel.value);
      showToast(`${sel.dataset.custom} updated to "${sel.value}"`);
      renderCustom();
    });
  });
}

renderOverview();
renderProduction();
renderOrders();
renderInventory();
renderCustom();
