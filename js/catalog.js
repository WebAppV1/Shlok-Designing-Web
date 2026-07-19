/**
 * catalog.js
 * Renders the design catalog grid and handles the custom-order form.
 * Submitted requests are written to DB.customOrders() so they show up
 * live in the Admin Dashboard's "Custom Requests" table.
 */

function renderCatalog() {
  const grid = document.getElementById('designGrid');
  const designs = DB.designs();

  grid.innerHTML = designs.map((d) => `
    <div class="service-card" style="padding:0;overflow:hidden;">
      <div style="aspect-ratio:4/3;overflow:hidden;">
        <img src="${d.image}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div style="padding:20px 22px 24px;">
        <span class="badge badge-progress" style="margin-bottom:10px;">${d.category}</span>
        <h3>${d.name}</h3>
        <p class="text-sm">${d.description}</p>
        <p class="text-sm text-muted" style="margin-bottom:4px;"><strong>Fabric:</strong> ${d.fabric}</p>
        <p class="text-sm text-muted" style="margin-bottom:14px;"><strong>Colourway:</strong> ${d.colorway}</p>
        <div class="flex between center-v">
          <span class="mono text-sm text-muted">${d.id} · MOQ ${d.moq}</span>
          <a href="#custom-order" class="btn btn-sm btn-ghost" onclick="preselectDesign('${d.id}')">Request similar</a>
        </div>
      </div>
    </div>
  `).join('');

  const refSelect = document.getElementById('co-ref');
  refSelect.innerHTML = `<option value="">— None, fully custom —</option>` +
    designs.map((d) => `<option value="${d.id}">${d.id} · ${d.name}</option>`).join('');
}

function preselectDesign(id) {
  document.getElementById('co-ref').value = id;
}

function initCustomOrderForm() {
  const form = document.getElementById('customOrderForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const order = {
      id: DB.nextId('CO', DB.customOrders()),
      name: document.getElementById('co-name').value.trim(),
      phone: document.getElementById('co-phone').value.trim(),
      email: document.getElementById('co-email').value.trim(),
      referenceDesign: document.getElementById('co-ref').value || null,
      qty: document.getElementById('co-qty').value || null,
      details: document.getElementById('co-details').value.trim(),
      status: 'New',
      date: new Date().toISOString(),
    };

    DB.addCustomOrder(order);
    form.reset();
    showToast(`Request submitted — reference ${order.id}. We'll call you shortly.`);
  });
}

renderCatalog();
initCustomOrderForm();
