const WHEELS = {
  aroma: { title: 'Aroma Wheel', img: 'assets/aroma_wheel.png' },
  taste: { title: 'Taste Wheel', img: 'assets/taste_wheel.png' },
  fault: { title: 'Fault Wheel', img: 'assets/fault_wheel.png' },
};

function renderImageViewer(container, title, src, backHash) {
  container.appendChild(Util.pageHeader(title, backHash));
  const wrap = Util.el('div', { class: 'wheel-img-wrap' });
  const img = Util.el('img', { src, alt: title });
  img.addEventListener('click', () => wrap.classList.toggle('zoomed'));
  wrap.appendChild(img);
  container.appendChild(wrap);
  container.appendChild(Util.el('div', { class: 'hint', style: 'text-align:center; margin-top:8px;' }, 'Tap the image to zoom in/out.'));
}

function renderWheel(container, key) {
  const w = WHEELS[key];
  if (!w) { container.appendChild(Util.el('div', { class: 'card' }, 'Unknown wheel.')); return; }
  renderImageViewer(container, w.title, w.img, '#/lab-work');
}

function renderDiagnostics(container) {
  renderImageViewer(container, 'Diagnostics', 'assets/diagnostic.png', '#/settings');
}

window.renderWheel = renderWheel;
window.renderDiagnostics = renderDiagnostics;
