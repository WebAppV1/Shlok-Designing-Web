/**
 * dealer.js
 * Guards the dealer dashboard behind a session check, then renders
 * stock, the order form, and this dealer's order history.
 */

const dealer = DB.getDealerSession();
if (!dealer) {
  window.location.href = 'login.html';
}

document.getElementById('dealerName').textContent = dealer ? `${dealer.contact} · ${dealer.company}` : '';
document.getElementById('welcomeHeading').textContent = dealer ? `Welcome back, ${dealer.contact.split(' ')[0]}` : 'Welcome back';

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  DB.clearDealerSession();
  window.location.href = 'login.html';
});

function stageBadgeClass(stage) {
  if (stage === 'Ready to Dispatch') return 'badge-done';
  if (stage === 'Quality Check' || stage === 'Finishing & Zari Work') return 'badge-progress';
  if (stage === 'Raw Material') return 'badge-hold';
  return 'badge-progress';
}

function statusBadgeClass(status) {
  const map = {
    'New': 'badge-pending',
    'In Production': 'badge-progress',
    'Ready to Dispatch': 'badge-done',
    'Dispatched': 'badge-done',
    'On Hold': 'badge-hold',
  };
  return map[status] || 'badge-pending';
}

function renderStock() {
  const grid = document.getElementById('stockGrid');
  const designs = DB.designs();
  const batches = DB.production();

  grid.innerHTML = designs.map((d) => {
    const readyQty = batches
      .filter((b) => b.designId === d.id && b.stage === 'Ready to Dispatch')
      .reduce((sum, b) => sum + b.qty, 0);
    const inProgress = batches
      .filter((b) => b.designId === d.id && b.stage !== 'Ready to Dispatch')
      .reduce((sum, b) => sum + b.qty, 0);

    return `
      <div class="service-card" style="padding:0;overflow:hidden;">
        <div style="aspect-ratio:4/3;overflow:hidden;">
          <img src="${d.image}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div style="padding:18px 20px 22px;">
          <h3 style="font-size:16px;">${d.name}</h3>
          <p class="text-sm mono text-muted" style="margin-bottom:10px;">${d.id} · MOQ ${d.moq}</p>
          <div class="flex gap-8" style="flex-wrap:wrap;">
            <span class="badge badge-done">${readyQty} ready</span>
            <span class="badge badge-progress">${inProgress} in production</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const select = document.getElementById('designSelect');
  select.innerHTML = designs.map((d) => `<option value="${d.id}">${d.id} · ${d.name}</option>`).join('');
}

function renderOrders() {
  const tbody = document.getElementById('ordersTableBody');
  const orders = DB.dealerOrders().filter((o) => o.dealerId === dealer.id);

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;padding:32px;">No orders placed yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map((o) => {
    const design = DB.design(o.designId);
    return `
      <tr>
        <td class="mono">${o.id}</td>
        <td>${design ? design.name : o.designId}</td>
        <td>${o.qty}</td>
        <td>${fmtDate(o.placedAt)}</td>
        <td><span class="badge ${statusBadgeClass(o.status)}">${o.status}</span></td>
      </tr>
    `;
  }).join('');
}

function initOrderForm() {
  document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const designId = document.getElementById('designSelect').value;
    const qty = parseInt(document.getElementById('qtyInput').value, 10);
    if (!qty || qty < 1) return;

    const order = {
      id: DB.nextId('ORD', DB.dealerOrders()),
      dealerId: dealer.id,
      designId,
      qty,
      status: 'New',
      placedAt: new Date().toISOString(),
    };
    DB.addDealerOrder(order);
    document.getElementById('qtyInput').value = '';
    showToast(`Order ${order.id} placed — the studio will confirm shortly.`);
    renderOrders();
  });
}

if (dealer) {
  renderStock();
  renderOrders();
  initOrderForm();
}
