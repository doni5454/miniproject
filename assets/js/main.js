document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 700);
  }

  document.querySelectorAll('.faq-item').forEach((item) => {
    item.querySelector('.question')?.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });

  const toggleTheme = document.getElementById('themeToggle');
  const themeIcon = document.querySelector('#themeToggle i');
  const currentTheme = localStorage.getItem('bankguard-theme') || 'light';
  document.body.setAttribute('data-theme', currentTheme);
  if (themeIcon) themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

  toggleTheme?.addEventListener('click', () => {
    const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('bankguard-theme', next);
    if (themeIcon) themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    showToast(`Switched to ${next} mode`);
  });

  const navbar = document.querySelector('.navbar');
  const onScroll = () => navbar?.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll);
  onScroll();

  const counters = document.querySelectorAll('[data-count]');
  counters.forEach((counter) => {
    const target = Number(counter.dataset.count || 0);
    const suffix = counter.dataset.suffix || '';
    let current = 0;
    const step = Math.max(1, Math.round(target / 60));
    const update = () => {
      current += step;
      if (current >= target) {
        counter.textContent = `${target}${suffix}`;
        return;
      }
      counter.textContent = `${current}${suffix}`;
      requestAnimationFrame(update);
    };
    update();
  });

  const toast = document.getElementById('toast');
  window.showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const modal = document.getElementById('modal');
  const openModal = document.querySelectorAll('[data-open-modal]');
  openModal.forEach((btn) => btn.addEventListener('click', () => modal?.classList.add('open')));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  const form = document.getElementById('predictionForm');
  const resultPanel = document.getElementById('predictionResult');
  const loaderPanel = document.getElementById('predictionLoader');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());
    loaderPanel.style.display = 'block';
    resultPanel.style.display = 'none';
    setTimeout(() => {
      const churn = Math.min(96, Math.max(18, 30 + Number(values.age || 30) * 0.6 + (values.geography === 'France' ? 4 : values.geography === 'Germany' ? 9 : 6) + (values.gender === 'Female' ? 3 : 0) + Number(values.tenure || 0) * 0.8));
      const status = churn > 70 ? 'High Risk' : churn > 45 ? 'Medium Risk' : 'Low Risk';
      const riskColor = status === 'High Risk' ? 'var(--accent)' : status === 'Medium Risk' ? 'var(--warning)' : 'var(--secondary)';
      const riskBadge = document.getElementById('riskBadge');
      const probabilityValue = document.getElementById('probabilityValue');
      const confidenceValue = document.getElementById('confidenceValue');
      const riskMeter = document.getElementById('riskMeter');
      const recommendations = document.getElementById('recommendations');
      if (riskBadge) {
        riskBadge.textContent = status;
        riskBadge.style.background = status === 'High Risk' ? 'rgba(255,107,107,.16)' : status === 'Medium Risk' ? 'rgba(255,183,3,.16)' : 'rgba(32,201,151,.16)';
        riskBadge.style.color = riskColor;
      }
      if (probabilityValue) probabilityValue.textContent = `${Math.round(churn)}%`;
      if (confidenceValue) confidenceValue.textContent = `${Math.round(88 + Math.random() * 8)}%`;
      if (riskMeter) {
        const pct = Math.round(churn);
        riskMeter.style.background = `conic-gradient(${riskColor} 0deg, ${riskColor} ${pct * 3.6}deg, rgba(91,108,255,.14) ${pct * 3.6}deg)`;
        riskMeter.dataset.value = `${pct}%`;
      }
      if (recommendations) {
        recommendations.innerHTML = [
          churn > 70 ? '<div class="item">Launch a retention campaign with premium offer.</div>' : '<div class="item">Maintain engagement with tailored product bundles.</div>',
          '<div class="item">Review recent service interactions and support tickets.</div>',
          '<div class="item">Offer loyalty rewards to strengthen customer value.</div>'
        ].join('');
      }
      loaderPanel.style.display = 'none';
      resultPanel.style.display = 'block';
      showToast('Prediction completed successfully');
    }, 1400);
  });

  const charts = document.querySelectorAll('[data-chart]');
  if (window.Chart) {
    charts.forEach((canvas) => {
      const type = canvas.dataset.chart;
      const labels = JSON.parse(canvas.dataset.labels || '[]');
      const values = JSON.parse(canvas.dataset.values || '[]');
      const color = canvas.dataset.color || '#5b6cff';
      new Chart(canvas, {
        type,
        data: {
          labels,
          datasets: [{ label: canvas.dataset.label || 'Performance', data: values, borderColor: color, backgroundColor: [color, '#20c997', '#ffb703', '#ff6b6b', '#7d94ff'], fill: type === 'line' || type === 'area' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    });
  }
});
