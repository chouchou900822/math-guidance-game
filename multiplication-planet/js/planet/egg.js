(function () {
  'use strict';

  var S = window.MPStore;
  var A = window.MPAudio;
  var FX = window.MPPlanetFx;
  var active = [];
  var live = null;
  var liveTimer = 0;

  /* 鼠标/触摸操作时不显示焦点环；一旦用键盘就恢复，兼顾手感与可访问性 */
  function markPointer() {
    document.documentElement.classList.add('is-pointer');
  }
  function markKeyboard(event) {
    if (!event.key || event.metaKey || event.ctrlKey || event.altKey) return;
    document.documentElement.classList.remove('is-pointer');
  }
  document.addEventListener('pointerdown', markPointer, true);
  document.addEventListener('keydown', markKeyboard, true);
  var EGGS = {
    ocean: {
      id: 'ocean', name: '极光鲸歌', color: '#63edcf', accent: '#81bdff', sound: 'ocean',
      clue: '海面下面，谁在轻轻唱歌？', tip: '小鲸鱼跃出海面，天空亮起极光。',
      greeting: ['海浪在和你打招呼。', '听，小鲸鱼游近了一点。', '它准备好跳跃啦！'],
      fact: '地球表面大约七成都被海洋覆盖。'
    },
    peach: {
      id: 'peach', name: '桃桃泡泡雨', color: '#ffaccb', accent: '#fff2b6', sound: 'pop',
      clue: '这瓶星球汽水，会冒出什么？', tip: '桃瓣和亮晶晶的泡泡，一起飞上天空。',
      greeting: ['啵！一颗小泡泡醒了。', '桃子味的云飘过来啦。', '给汽水一点点魔法吧！'],
      fact: '泡泡的彩色光泽，来自薄薄的水膜对光的作用。'
    },
    mint: {
      id: 'mint', name: '萤火森林', color: '#7cf2b1', accent: '#f3ffad', sound: 'forest',
      clue: '树叶深处，藏着一盏小灯。', tip: '嫩芽伸个懒腰，萤火虫点亮整片森林。',
      greeting: ['小叶子挠了挠你的手心。', '草丛里好像有光！', '森林的朋友们醒来了。'],
      fact: '萤火虫发出的光几乎不产生热量，叫作冷光。'
    },
    gold: {
      id: 'gold', name: '金闪闪宝藏', color: '#ffdb75', accent: '#fff7d7', sound: 'sparkle',
      clue: '敲一敲，矿洞里有什么回声？', tip: '小小矿洞打开了，金色晶石跳着舞出现。',
      greeting: ['叮！听见宝藏的回声了吗？', '石缝里闪过一道金光。', '这里一定藏着好东西。'],
      fact: '黄金能被压成非常薄的金箔，比一根头发还薄。'
    },
    candy: {
      id: 'candy', name: '糖果圆舞曲', color: '#ff9ec7', accent: '#83e4ff', sound: 'candy',
      clue: '奶油旋转时，糖果会跳什么舞？', tip: '彩色糖果沿着两条螺旋，跳起圆舞曲。',
      greeting: ['一颗糖果蹦了出来。', '奶油丝带绕了一个圈。', '糖果乐队正在排练！'],
      fact: '螺旋形藏在蜗牛壳、旋转的水流和星系里。'
    },
    violet: {
      id: 'violet', name: '口袋里的彩虹', color: '#c3acff', accent: '#83edff', sound: 'glass',
      clue: '给水晶一束光，会发生什么？', tip: '水晶慢慢展开，把一束光变成小彩虹。',
      greeting: ['叮，水晶唱了一个音符。', '你找到一小片彩虹！', '光正在水晶里面旅行。'],
      fact: '白光穿过棱镜，可以分成不同颜色的光。'
    },
    lava: {
      id: 'lava', name: '火山打喷嚏', color: '#ff9960', accent: '#ffe99c', sound: 'boom',
      clue: '暖乎乎的星球，鼻子有点痒。', tip: '阿嚏！火山喷出一串暖暖的金色火花。',
      greeting: ['咕嘟，地底冒了一个小泡。', '小火山的鼻子有点痒。', '准备好看一场火花秀！'],
      fact: '岩浆喷出地表后叫熔岩，冷却后会变成岩石。'
    },
    galaxy: {
      id: 'galaxy', name: '星座邮差', color: '#b7bdff', accent: '#ffbadf', sound: 'space',
      clue: '远方有一封信，谁会送来呢？', tip: '星星连成一幅画，彗星带着问候划过。',
      greeting: ['一颗星星眨了眨眼。', '星星之间连起了悄悄话。', '远方的信快要到啦。'],
      fact: '星座里的星星看起来靠近，实际可能相距很远。'
    },
    saturn: {
      id: 'saturn', name: '光环小飞船', color: '#ffe4a4', accent: '#b1e8ff', sound: 'whoosh',
      clue: '沿着光环，能找到小小领航员吗？', tip: '小飞船沿着星环出发，和卫星打个招呼。',
      greeting: ['光环上亮起了一盏路灯。', '小飞船正在检查行李。', '下一站，星环的另一边！'],
      fact: '土星环并不是实心圆盘，而是无数冰块和碎石。'
    },
    binary: {
      id: 'binary', name: '1024 号来信', color: '#70ffbb', accent: '#d0ffe9', sound: 'digital',
      clue: '0 和 1 正在给你发送秘密消息。', tip: '电路逐个点亮，0 和 1 拼出来自 1024 的问候。',
      greeting: ['滴，收到一条小小的信号。', '0 和 1 正在排队。', '信号连接成功，等待解码！'],
      fact: '从 1 开始，连续翻倍 10 次，就会得到 1024。'
    }
  };

  function spec(id) { return EGGS[id] || EGGS.ocean; }
  function total() { return Object.keys(EGGS).length; }
  function found() { return Object.keys(EGGS).filter(function (id) { return S.hasEgg(id); }).length; }

  function announceLive(text) {
    if (!live) {
      live = document.createElement('span');
      live.className = 'egg-live';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    window.clearTimeout(liveTimer);
    live.textContent = '';
    liveTimer = window.setTimeout(function () { live.textContent = text; }, 40);
  }

  function attach(host, canvas, skin, ctl, opts) {
    if (!host || !canvas || !ctl) return null;
    opts = opts || {};
    var current = skin;
    var press = null;
    var holdTimer = 0;
    var toastTimer = 0;
    var busyTimer = 0;
    var nextFire = 0;
    var taps = 0;
    var suppressClick = false;
    var dead = false;
    var toast = document.createElement('span');
    toast.className = 'egg-toast';
    toast.setAttribute('aria-hidden', 'true');
    host.appendChild(toast);
    var guide = null;
    if (opts.guide !== false) {
      guide = document.createElement('span');
      guide.className = 'egg-guide';
      guide.setAttribute('aria-hidden', 'true');
      host.appendChild(guide);
    }
    var charge = document.createElement('span');
    charge.className = 'egg-charge';
    charge.setAttribute('aria-hidden', 'true');
    charge.innerHTML = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"/></svg>';
    host.appendChild(charge);
    host.tabIndex = 0;
    host.setAttribute('role', 'button');
    host.setAttribute('aria-keyshortcuts', 'Enter Space Shift+Enter ArrowLeft ArrowRight');

    function announce(text) {
      toast.textContent = text;
      toast.classList.add('is-on');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () { toast.classList.remove('is-on'); }, 2800);
      announceLive(text);
    }

    function buzz(pattern) {
      if (!navigator.vibrate) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      try { navigator.vibrate(pattern); } catch (err) {}
    }

    function sync() {
      var e = spec(current.id);
      host.style.setProperty('--egg-color', e.color);
      host.setAttribute('aria-label', current.name + '互动星球。轻点或按回车打招呼；长按或 Shift 加回车唤醒' + e.name + '；左右拖动或按方向键旋转。');
      if (guide) guide.innerHTML = '<i></i><span>轻点打招呼 · 长按唤醒 · 左右拖动</span>';
      var chip = host.parentNode && host.parentNode.querySelector('.skin-chip-egg');
      if (chip) {
        chip.textContent = '彩蛋 ' + found() + '/' + total();
        chip.classList.toggle('is-full', found() === total());
      }
    }

    function clearPress() {
      window.clearTimeout(holdTimer);
      host.classList.remove('is-charging', 'is-dragging');
      var previous = press;
      press = null;
      if (previous && typeof previous.id === 'number' && host.hasPointerCapture(previous.id)) {
        host.releasePointerCapture(previous.id);
      }
    }

    function fire(charged, point) {
      if (dead || !host.isConnected || document.hidden) return false;
      if (Date.now() < nextFire) return false;
      nextFire = Date.now() + (charged ? 0 : 350);
      var e = spec(current.id);
      FX.play(host, e, { charged: !!charged, x: point ? point.x : 0.5, y: point ? point.y : 0.5 });
      if (ctl.kick) ctl.kick(!!charged);
      if (A && A.egg) A.egg(e.sound, !!charged);
      buzz(charged ? [18, 24, 42] : 8);
      host.classList.toggle('is-awake', !!charged);
      window.clearTimeout(busyTimer);
      busyTimer = window.setTimeout(function () { host.classList.remove('is-awake'); }, 3000);
      if (charged) {
        var isNew = S.markEgg(current.id);
        var complete = isNew && found() === total();
        announce(complete ? '发现「' + e.name + '」！十个小秘密全部找到，你真是位细心的宇宙观察员。'
          : isNew ? '发现「' + e.name + '」！' + found() + ' / ' + total() : e.name + ' · ' + e.tip);
        if (complete) {
          if (window.MPUI) window.MPUI.confetti(42);
          if (A && A.win) A.win();
        }
        sync();
        if (opts.onFound) opts.onFound(current.id, isNew);
      } else {
        announce(e.greeting[taps % e.greeting.length] + ' 长按试试？');
        taps += 1;
      }
      return true;
    }

    function point(event) {
      var r = host.getBoundingClientRect();
      return { x: Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)),
        y: Math.max(0, Math.min(1, (event.clientY - r.top) / r.height)) };
    }

    function beginHold() {
      host.classList.add('is-charging');
      buzz(8);
      if (guide) guide.textContent = '魔法正在醒来……';
      holdTimer = window.setTimeout(function () {
        if (!press || press.dragged) return;
        press.fired = true;
        host.classList.remove('is-charging');
        fire(true, press.point);
      }, 800);
    }

    function onDown(event) {
      if (!event.isPrimary || event.button !== 0 || press) return;
      suppressClick = false;
      host.focus({ preventScroll: true });
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX,
        dragged: false, fired: false, point: point(event) };
      host.setPointerCapture(event.pointerId);
      beginHold();
    }

    function onMove(event) {
      if (press) {
        if (press.id !== event.pointerId) return;
        var dx = event.clientX - press.x;
        var dy = event.clientY - press.y;
        if (Math.abs(dx) + Math.abs(dy) > 10) {
          if (!press.dragged && Math.abs(dy) > Math.abs(dx) && event.pointerType === 'touch') {
            suppressClick = true;
            clearPress();
            sync();
            return;
          }
          press.dragged = true;
          window.clearTimeout(holdTimer);
          host.classList.remove('is-charging');
          host.classList.add('is-dragging');
          if (guide) guide.textContent = '转到另一面，看看藏着什么';
        }
        if (press.dragged && ctl.turn) ctl.turn((event.clientX - press.lastX) / host.clientWidth * 5);
        press.lastX = event.clientX;
        return;
      }
      if (event.pointerType === 'touch') return;
      var p = point(event);
      if (ctl.look) ctl.look((p.x - 0.5) * 2, true);
      host.style.setProperty('--aim-x', ((p.x - 0.5) * 2).toFixed(3));
      host.style.setProperty('--aim-y', ((p.y - 0.5) * 2).toFixed(3));
    }

    function onUp(event) {
      if (!press || press.id !== event.pointerId) return;
      var tap = !press.dragged && !press.fired;
      var p = press.point;
      suppressClick = true;
      clearPress();
      sync();
      if (tap) fire(false, p);
    }

    function onClick(event) {
      if (suppressClick) { suppressClick = false; return; }
      if (event.detail === 0) fire(false);
    }

    function onLeave() {
      if (press) return;
      if (ctl.look) ctl.look(0, false);
      host.style.setProperty('--aim-x', '0');
      host.style.setProperty('--aim-y', '0');
    }

    function cancel() {
      clearPress();
      onLeave();
      sync();
    }

    function onKey(event) {
      if (event.target !== host) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (ctl.turn) ctl.turn(event.key === 'ArrowLeft' ? -0.24 : 0.24);
        return;
      }
      if (event.key === 'Escape') { cancel(); return; }
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (event.repeat || press) return;
      suppressClick = false;
      if (event.shiftKey) { fire(true); return; }
      press = { id: 'keyboard', dragged: false, fired: false, point: { x: 0.5, y: 0.5 } };
      beginHold();
    }

    function onKeyUp(event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (!press || press.id !== 'keyboard') return;
      event.preventDefault();
      var tap = !press.fired;
      clearPress();
      sync();
      if (tap) fire(false);
    }

    function onHidden() {
      if (!document.hidden) return;
      cancel();
      FX.stop(host);
      window.clearTimeout(busyTimer);
      host.classList.remove('is-awake');
    }

    var events = { pointerdown: onDown, pointermove: onMove, pointerup: onUp, pointerleave: onLeave,
      pointercancel: cancel, lostpointercapture: function (event) {
        if (press && press.id === event.pointerId && !host.hasPointerCapture(event.pointerId)) cancel();
      }, click: onClick, keydown: onKey, keyup: onKeyUp,
      blur: cancel, contextmenu: function (event) { event.preventDefault(); } };
    Object.keys(events).forEach(function (name) { host.addEventListener(name, events[name]); });
    document.addEventListener('visibilitychange', onHidden);
    sync();
    var handle = {
      setSkin: function (next) {
        if (!next || current.id === next.id) return;
        cancel();
        FX.stop(host);
        window.clearTimeout(toastTimer);
        window.clearTimeout(busyTimer);
        toast.classList.remove('is-on');
        host.classList.remove('is-awake');
        current = next;
        nextFire = 0;
        taps = 0;
        sync();
      },
      fire: fire,
      spec: function () { return spec(current.id); },
      stop: function () {
        dead = true;
        Object.keys(events).forEach(function (name) { host.removeEventListener(name, events[name]); });
        document.removeEventListener('visibilitychange', onHidden);
        clearPress();
        window.clearTimeout(toastTimer);
        window.clearTimeout(busyTimer);
        FX.stop(host);
        toast.remove();
        if (guide) guide.remove();
        charge.remove();
        active = active.filter(function (item) { return item !== handle; });
      }
    };
    active.push(handle);
    return handle;
  }

  window.MPEgg = {
    map: EGGS, spec: spec, total: total, found: found, attach: attach,
    stopAll: function () { active.slice().forEach(function (ctl) { ctl.stop(); }); }
  };
})();
