/* 乘法星球 — 家长学习报告交互 */
(function () {
  'use strict';

  var View = window.MPReportView;

  function confirmReset(root) {
    var box = root.querySelector('#rp-confirm');
    if (!box) return;
    box.hidden = false;
    var wrap = root.querySelector('.rp-danger');
    if (wrap) wrap.classList.add('is-open');
    var btn = box.querySelector('[data-action="reset-stats-ok"]');
    if (btn) btn.focus({ preventScroll: true });
  }

  function cancelReset(root) {
    var box = root.querySelector('#rp-confirm');
    if (!box) return;
    box.hidden = true;
    var wrap = root.querySelector('.rp-danger');
    if (wrap) wrap.classList.remove('is-open');
  }

  function mount(root) {
    cancelReset(root);
  }

  window.MPReport = {
    view: View.view,
    mount: mount,
    confirmReset: confirmReset,
    cancelReset: cancelReset
  };
})();
