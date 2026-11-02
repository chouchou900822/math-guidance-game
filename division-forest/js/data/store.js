/* 除法森林 — 本地进度存储 */
(function () {
  'use strict';

  var KEY = 'division-forest-v1';

  /* stars / spent 记的是森林货币「松果」：沿用乘法星球的字段名，方便两边对照 */
  var DEFAULTS = {
    stars: 0,
    spent: 0,
    skins: ['apple'],
    skin: 'apple',
    tableStars: {},
    seen: {},
    muted: false,
    plays: 0,
    bestCombo: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    harvest: { cleared: false, best: 0, plays: 0 },
    stats: { facts: {}, days: {}, mastery: {} },
    daily: { lastDay: '', streak: 0, best: 0, total: 0, bestScore: 0, todayScore: 0 },
    awards: { unlocked: {} },
    eggs: {}
  };

  /* 演示模式只在内存里生效，绝不写入 localStorage */
  var demo = false;
  var demoEggs = {};

  /* 默认值是纯数据，深拷贝一份即可，避免各层共享同一个对象 */
  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function dayKey(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  /* 81 道除法的键：「除数-商」。12÷3 与 12÷4 用同一句口诀，但对孩子是两道不同的题 */
  function clamp9(v) {
    return Math.max(1, Math.min(9, Math.round(Number(v) || 1)));
  }

  function factKey(a, b) {
    return clamp9(a) + '-' + clamp9(b);
  }

  function load() {
    var data = cloneDefaults();
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return data;
      var saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') return data;
      window.DFStoreMigrate(data, saved);
    } catch (err) {
      // 隐私模式下 localStorage 不可用时，静默使用内存进度
    }
    return data;
  }

  var data = load();

  /* 只保留最近 120 天，避免存档无限增长 */
  function pruneDays(keep) {
    var cutoff = dayKey(new Date(Date.now() - keep * 86400000));
    Object.keys(data.stats.days).forEach(function (key) {
      if (key < cutoff) delete data.stats.days[key];
    });
  }

  function save() {
    if (demo) return;
    pruneDays(120);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {
      // 忽略写入失败，保证游戏可继续
    }
  }

  function perfectTables() {
    var count = 0;
    for (var t = 1; t <= 9; t += 1) {
      if ((data.tableStars[String(t)] || 0) >= 3) count += 1;
    }
    return count;
  }

  /* 记录类方法拆在 store-quiz.js，需要读写同一份状态 */
  window.DFStoreCtx = { data: data, save: save, dayKey: dayKey };

  window.DFStore = {
    get: function () { return data; },

    setMuted: function (muted) {
      data.muted = !!muted;
      save();
    },

    markSeen: function (a, b) {
      var key = factKey(a, b);
      if (data.seen[key]) return;
      data.seen[key] = true;
      save();
    },

    tableStar: function (table) {
      if (demo) return 3;
      return data.tableStars[String(table)] || 0;
    },

    litTables: function () {
      if (demo) return 9;
      var count = 0;
      for (var t = 1; t <= 9; t += 1) {
        if ((data.tableStars[String(t)] || 0) >= 1) count += 1;
      }
      return count;
    },

    perfectTables: function () {
      return demo ? 9 : perfectTables();
    },

    seenInTable: function (table) {
      if (demo) return 9;
      var count = 0;
      for (var b = 1; b <= 9; b += 1) {
        if (data.seen[factKey(table, b)]) count += 1;
      }
      return count;
    },

    seenTotal: function () {
      if (demo) return 81;
      var count = 0;
      for (var a = 1; a <= 9; a += 1) {
        for (var b = 1; b <= 9; b += 1) {
          if (data.seen[a + '-' + b]) count += 1;
        }
      }
      return count;
    },

    factKey: factKey,

    masteryOf: function (a, b) {
      var item = data.stats.mastery[factKey(a, b)];
      if (!item) return null;
      return {
        streak: item.streak || 0,
        pending: item.pending === true,
        wrongAt: item.wrongAt || 0,
        clearedAt: item.clearedAt || 0,
        lastAt: item.lastAt || 0
      };
    },

    /* ---------- 松果与大树 ---------- */

    /* 可支配松果 = 累计获得 - 已花费，累计值本身仍然保留 */
    balance: function () {
      if (demo) return 1024;
      return Math.max(0, data.stars - data.spent);
    },

    ownsSkin: function (id) {
      return demo || data.skins.indexOf(id) >= 0;
    },

    buySkin: function (id, cost) {
      if (!id || data.skins.indexOf(id) >= 0) return false;
      var price = Math.max(0, Number(cost) || 0);
      if (price > data.stars - data.spent) return false;
      data.spent += price;
      data.skins.push(id);
      save();
      return true;
    },

    equipSkin: function (id) {
      if (demo) {
        data.skin = id;
        return true;
      }
      if (data.skins.indexOf(id) < 0) return false;
      data.skin = id;
      save();
      return true;
    },

    harvestUnlocked: function () {
      return demo || perfectTables() >= 9;
    },

    harvestCleared: function () {
      return data.harvest.cleared === true;
    },

    harvestBest: function () {
      return data.harvest.best || 0;
    },

    /**
     * 丰收节答对 8 题即可带走「丰收金树」；10 题全对才是完整的 1024 ÷ 2¹⁰ = 1。
     */
    resetStats: function () {
      data.stats = { facts: {}, days: {}, mastery: {} };
      save();
    },

    /* ---------- 每日挑战 ---------- */

    /**
     * 每天一套题，首次完成额外奖励 5 颗松果。
     * 演示模式给一份「已经连续 4 天」的假进度，打开就能看到连续挑战的样子。
     */
    dailyState: function () {
      var today = dayKey(new Date());
      var done = data.daily.lastDay === today;
      return {
        done: done,
        score: done ? data.daily.todayScore : 0,
        streak: data.daily.streak,
        best: data.daily.best,
        total: data.daily.total,
        bestScore: data.daily.bestScore,
        today: today
      };
    },

    hasAward: function (id) {
      return !!data.awards.unlocked[id];
    },

    awardTime: function (id) {
      var ts = Number(data.awards.unlocked[id]) || 0;
      return ts > 1 ? ts : 0;
    },

    unlockAward: function (id) {
      if (!id || data.awards.unlocked[id]) return false;
      data.awards.unlocked[id] = Date.now();
      save();
      return true;
    },

    /* ---------- 皮肤彩蛋 ---------- */

    eggList: function () {
      return Object.keys(demo ? demoEggs : data.eggs);
    },

    hasEgg: function (id) {
      return !!(demo ? demoEggs : data.eggs)[id];
    },

    /* 首次发现返回 true */
    markEgg: function (id) {
      if (!id) return false;
      var bag = demo ? demoEggs : data.eggs;
      if (bag[id]) return false;
      bag[id] = Date.now();
      if (!demo) save();
      return true;
    },

    ownedSkinCount: function () {
      return demo ? 10 : data.skins.length;
    },

    /* 累计获得（不扣除已花），奖章按这个数字算 */
    totalStars: function () {
      return demo ? 1024 : data.stars;
    },

    /* ---------- 演示模式 ---------- */

    isDemo: function () { return demo; },

    setDemo: function (flag) {
      demo = !!flag;
      if (!demo) return;
      /* 演示模式换一份示例学习记录，展示报告页的完整形态；不写盘 */
      data.stats = { facts: {}, days: {}, mastery: {} };
      window.DFStoreDemo.seed(data, dayKey);
      /* 假造成「昨天刚挑战过、已连续 4 天」，完成今天的挑战就会变成 5 天 */
      data.daily = {
        lastDay: dayKey(new Date(Date.now() - 86400000)),
        streak: 4,
        best: 6,
        total: 12,
        bestScore: 8,
        todayScore: 0
      };
      data.awards = { unlocked: {} };
      /* 演示模式先发现 6 个彩蛋，剩下 4 个留给大家自己长按大树去找 */
      demoEggs = {};
      ['apple', 'peach', 'orange', 'pine', 'maple', 'firefly'].forEach(function (id, i) {
        demoEggs[id] = Date.now() - (6 - i) * 3600000;
      });
    }
  };

})();
