/**
 * track.js
 * Looks up a production batch by ID and renders its stage progress
 * against DB.STAGES.
 */

function renderResult(batch) {
  const result = document.getElementById('result');

  if (!batch) {
    result.innerHTML = `
      <div class="empty-state card pad-lg" style="max-width:560px;margin:0 auto;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <p style="margin-bottom:0;">No batch found with that ID. Double-check it and try again, or contact the studio directly.</p>
      </div>`;
    return;
  }

  const design = DB.design(batch.designId);
  const stageIndex = DB.STAGES.indexOf(batch.stage);
  const pct = Math.round(((stageIndex + 1) / DB.STAGES.length) * 100);

  result.innerHTML = `
    <div class="card pad-lg" style="max-width:720px;margin:0 auto;">
      <div class="flex between center-v" style="margin-bottom:6px;flex-wrap:wrap;gap:10px;">
        <div>
          <span class="mono text-sm text-muted">${batch.id}</span>
          <h3 style="margin:2px 0 0;">${design ? design.name : 'Design'}</h3>
        </div>
        <span class="badge badge-progress">${batch.stage}</span>
      </div>
      <p class="text-sm text-muted" style="margin-bottom:22px;">Quantity: ${batch.qty} pcs · Started ${fmtDate(batch.startedAt)} · Last updated ${fmtDate(batch.updatedAt)}</p>

      <div style="background:var(--ivory-100);border-radius:999px;height:8px;overflow:hidden;margin-bottom:18px;">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--wine-700),var(--gold-500));"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;">
        ${DB.STAGES.map((s, i) => `
          <div style="text-align:center;">
            <div style="width:26px;height:26px;border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;
              background:${i <= stageIndex ? 'var(--wine-700)' : 'var(--ivory-100)'};
              color:${i <= stageIndex ? '#fff' : 'var(--ink-500)'};
              border:1px solid ${i <= stageIndex ? 'var(--wine-700)' : 'var(--line)'};
              font-family:var(--font-mono);font-size:11px;">${i + 1}</div>
            <span style="font-size:10.5px;color:var(--ink-500);line-height:1.3;display:block;">${s}</span>
          </div>
        `).join('')}
      </div>

      ${batch.notes ? `<p class="text-sm" style="margin-top:20px;margin-bottom:0;padding-top:16px;border-top:1px solid var(--line);"><strong>Floor note:</strong> ${batch.notes}</p>` : ''}
    </div>
  `;
}

function lookupBatch() {
  const id = document.getElementById('batchInput').value.trim().toUpperCase();
  const batch = DB.production().find((b) => b.id === id);
  renderResult(batch);
}

document.getElementById('trackBtn').addEventListener('click', lookupBatch);
document.getElementById('batchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') lookupBatch();
});

// Show the default sample batch on load
lookupBatch();
