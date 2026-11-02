/* 除法森林 — 图标、音效反馈与装饰层 */
(function () {
  'use strict';

  var S = window.DFStore;

  var STAR_PATH = 'M12 2.6l2.9 6.05 6.66.86-4.9 4.7 1.26 6.63L12 17.6l-5.92 3.24 1.26-6.63-4.9-4.7 6.66-.86z';

  var ICON = {
    arrow: '<path d="M4.5 12h14M13 6.6l5.4 5.4-5.4 5.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    flame: '<path d="M12 2.8c.5 3.1 2.7 4.3 4.1 6.3a7 7 0 1 1-11.4.1c.9 1.4 2.1 2 3.1 2 .7-2.7-.8-5.3 4.2-8.4z" fill="#F2552C" stroke="#1B1F17" stroke-width="1.3" stroke-linejoin="round"/>',
    sound: '<path d="M4 9.6h3.1L12 5.4v13.2L7.1 14.4H4z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M15.8 9.2a4 4 0 0 1 0 5.6M18.4 6.6a8 8 0 0 1 0 10.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2.4" fill="currentColor"/>',
    tree: '<path d="M12 21v-6.4M12 14.6 8.8 12M12 16.4l3.4-2.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' +
      '<path d="M7.4 14.4a4.6 4.6 0 0 1-.6-8.6 5.4 5.4 0 0 1 10.4 0 4.6 4.6 0 0 1-.6 8.6z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>',
    divide: '<path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="12" cy="6.6" r="1.9" fill="currentColor"/><circle cx="12" cy="17.4" r="1.9" fill="currentColor"/>',
    hand: '<path d="M7.4 12.6V6.8a1.5 1.5 0 0 1 3 0v4.6M10.4 11V5.2a1.5 1.5 0 0 1 3 0V11M13.4 11V6.4a1.5 1.5 0 0 1 3 0V12.4M16.4 10.6a1.5 1.5 0 0 1 3 0v3.6a6.6 6.6 0 0 1-6.6 6.6h-.6a6 6 0 0 1-4.8-2.4L4.6 14.8a1.6 1.6 0 0 1 2.4-2.1l.4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    reset: '<path d="M5.4 9.4A7 7 0 1 1 5 13.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M4.6 4.8v4.8h4.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    lock: '<rect x="4.8" y="10.2" width="14.4" height="10.2" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.9"/>' +
      '<path d="M8.4 10.2V7.8a3.6 3.6 0 0 1 7.2 0v2.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    check: '<path d="M5 12.6l4.6 4.6L19 7.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    bolt: '<path d="M13.4 2.4 4.8 13.6h5.4L9.9 21.6l8.8-11.4h-5.6z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>'
  };

  function icon(name, size) {
    var s = size || 18;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true">' + ICON[name] + '</svg>';
  }

  function star(size, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" width="' + size + '" height="' + size +
      '" aria-hidden="true"><path d="' + STAR_PATH + '" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  }

  function stars3(rating) {
    var out = '';
    for (var i = 0; i < 3; i += 1) {
      out += star(11, i < rating ? 'on' : 'off');
    }
    return out;
  }

  var toastEl = document.getElementById('toast');
  var celebrateEl = document.getElementById('celebrate');
  var toastTimer = null;

  function toast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('show');
    }, 1800);
  }

  function confetti(count) {
    if (!celebrateEl) return;
    var colors = ['#FFD23F', '#FF5A4A', '#12824A', '#7CCF5A', '#FF9A1F', '#1B1F17'];
    for (var i = 0; i < count; i += 1) {
      var piece = document.createElement('span');
      var size = 6 + Math.random() * 8;
      piece.className = 'confetti-piece';
      piece.style.left = (Math.random() * 100) + 'vw';
      piece.style.width = size + 'px';
      piece.style.height = (size * 1.4) + 'px';
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty('--dx', (Math.random() * 180 - 90) + 'px');
      piece.style.setProperty('--spin', (360 + Math.random() * 720) + 'deg');
      piece.style.animationDuration = (1.8 + Math.random() * 1.2) + 's';
      piece.style.animationDelay = (Math.random() * 0.2) + 's';
      celebrateEl.appendChild(piece);
      window.setTimeout(function (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }, 4200, piece);
    }
  }

  function starBurst(el) {
    var rect = el.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    for (var i = 0; i < 8; i += 1) {
      var spark = document.createElement('span');
      spark.innerHTML = star(14 + Math.random() * 12);
      spark.style.cssText = 'position:fixed;left:' + cx + 'px;top:' + cy + 'px;color:#FFD23F;' +
        'pointer-events:none;z-index:55;transform:translate(-50%,-50%);transition:transform .75s ease-out,opacity .75s ease-out;';
      var svg = spark.firstChild;
      if (svg) svg.style.color = '#FFD23F';
      document.body.appendChild(spark);
      (function (node) {
        var angle = Math.random() * Math.PI * 2;
        var dist = 46 + Math.random() * 74;
        window.requestAnimationFrame(function () {
          node.style.transform = 'translate(calc(-50% + ' + (Math.cos(angle) * dist).toFixed(1) + 'px), calc(-50% + ' +
            (Math.sin(angle) * dist).toFixed(1) + 'px)) scale(.4) rotate(' + (Math.random() * 200 - 100).toFixed(0) + 'deg)';
          node.style.opacity = '0';
        });
        window.setTimeout(function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        }, 900);
      })(spark);
    }
  }

  /* 背景上零星飘着几片小叶子，代替乘法星球的小星光 */
  function buildSky() {
    var sky = document.getElementById('sky');
    if (!sky) return;
    for (var i = 0; i < 14; i += 1) {
      var spark = document.createElement('i');
      var size = 7 + Math.random() * 9;
      spark.className = 'spark' + (i % 3 === 0 ? ' is-warm' : '');
      spark.style.width = size + 'px';
      spark.style.height = (size * 0.62) + 'px';
      spark.style.setProperty('--tilt', Math.round(Math.random() * 180) + 'deg');
      spark.style.left = (Math.random() * 100) + '%';
      spark.style.top = (Math.random() * 100) + '%';
      spark.style.animationDelay = (Math.random() * 4) + 's';
      spark.style.animationDuration = (3.5 + Math.random() * 3) + 's';
      sky.appendChild(spark);
    }
  }

  /* 顶栏的松果余额 */
  function syncStars(animate) {
    var el = document.getElementById('cone-total');
    if (!el) return;
    var next = String(S.balance());
    if (el.textContent === next) return;
    el.textContent = next;
    if (!animate) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  function syncSound() {
    var btn = document.getElementById('sound-toggle');
    if (!btn) return;
    var on = window.DFAudio.isEnabled();
    btn.classList.toggle('is-muted', !on);
    btn.setAttribute('aria-label', on ? '关闭声音' : '打开声音');
    btn.setAttribute('aria-pressed', String(on));
  }

  window.DFUI = {
    icon: icon,
    star: star,
    stars3: stars3,
    toast: toast,
    confetti: confetti,
    starBurst: starBurst,
    buildSky: buildSky,
    syncStars: syncStars,
    syncSound: syncSound
  };
})();
