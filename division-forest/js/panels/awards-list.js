/* 除法森林 — 奖章清单与图标 */
(function () {
  'use strict';

  var GROUPS = [
    { id: 'learn', name: '学习', sub: '看懂每一道除法', color: '#12824a' },
    { id: 'drill', name: '练习', sub: '答得多，也答得准', color: '#f2552c' },
    { id: 'collect', name: '收藏', sub: '把大树和图鉴集齐', color: '#e09b00' },
    { id: 'keep', name: '坚持', sub: '每天来一次', color: '#1f8fb8' }
  ];

  var ICONS = {
    star: '<path d="M12 3.4l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.7l6-.8z"/>',
    medal: '<circle cx="12" cy="9.2" r="5.4"/><path d="M8.6 13.7 6.2 21l5.8-2.5L17.8 21l-2.4-7.3"/>',
    map: '<path d="M3.2 6.6 9 4.1l6 2.5 5.8-2.5v13.3L15 20l-6-2.5-5.8 2.5z"/><path d="M9 4.1v13.4M15 6.6V20"/>',
    crown: '<path d="M3.2 8.2 7.8 12 12 4.6 16.2 12l4.6-3.8-1.9 10.2H5.1z"/>',
    flame: '<path d="M12 2.8c.6 3 2.6 4.3 4 6.2a7 7 0 1 1-11 .1c.9 1.3 2 2 3 2 .7-2.6-.8-5.2 4-8.3z"/>',
    stack: '<rect x="4" y="4.4" width="16" height="4.2" rx="1.4"/><rect x="4" y="9.9" width="16" height="4.2" rx="1.4"/><rect x="4" y="15.4" width="16" height="4.2" rx="1.4"/>',
    bolt: '<path d="M13.2 2.4 5 13.4h5.2L9.8 21.6 18 10.6h-5.2z"/>',
    target: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1"/>',
    book: '<path d="M4 5.4A2.4 2.4 0 0 1 6.4 3H20v14.6H6.4A2.4 2.4 0 0 0 4 20z"/><path d="M4 20a2.4 2.4 0 0 1 2.4-2.4H20V21H6.4"/>',
    sparkle: '<path d="M11 2.6l2 5.8 5.8 2-5.8 2-2 5.8-2-5.8L3.2 10.4l5.8-2z"/><path d="M18.4 15.4l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z"/>',
    tree: '<path d="M7.4 14.4a4.6 4.6 0 0 1-.6-8.6 5.4 5.4 0 0 1 10.4 0 4.6 4.6 0 0 1-.6 8.6z"/><path d="M12 21v-6.4M12 15.6l-3-2.4M12 17l3.2-2.6"/>',
    cone: '<path d="M12 3.4c4.4 1.8 6.2 6 5.8 10.2-.5 4.4-3.2 7-5.8 7.6-2.6-.6-5.3-3.2-5.8-7.6C5.8 9.4 7.6 5.2 12 3.4z"/><path d="M7.6 9.8q4.4 2.4 8.8 0M7 13.8q5 2.8 10 0M8.4 17.6q3.6 2 7.2 0"/>',
    divide: '<path d="M5 12h14"/><circle cx="12" cy="6.6" r="1.6"/><circle cx="12" cy="17.4" r="1.6"/>',
    basket: '<path d="M3.6 10.4h16.8l-2 9.2H5.6z"/><path d="M8 10.4 10.4 4M16 10.4 13.6 4M8.6 13.6v3.4M12 13.6v3.4M15.4 13.6v3.4"/>',
    rocket: '<path d="M12 2.6c3.4 2 5.4 5.5 5.4 9.3L12 17.2l-5.4-5.3c0-3.8 2-7.3 5.4-9.3z"/><circle cx="12" cy="9" r="1.9"/><path d="M8.2 15.6 5.6 20l4.2-1.6M15.8 15.6 18.4 20l-4.2-1.6"/>',
    calendar: '<rect x="3.4" y="5.4" width="17.2" height="15.2" rx="2.6"/><path d="M3.4 10h17.2M8.2 2.8v5M15.8 2.8v5"/>',
    sunrise: '<circle cx="12" cy="14.4" r="4"/><path d="M12 2.8v3.4M4.4 6.8l2.2 2.2M19.6 6.8l-2.2 2.2M2.4 14.4h2.2M19.4 14.4h2.2M4.4 21.2h15.2"/>',
    shield: '<path d="M12 2.8l7.2 2.6v6.1c0 4.3-3 7.6-7.2 9.7-4.2-2.1-7.2-5.4-7.2-9.7V5.4z"/><path d="M8.8 11.8l2.3 2.3 4.1-4.4"/>',
    check: '<circle cx="12" cy="12" r="8.6"/><path d="M8.2 12.3l2.6 2.6 5-5.4"/>'
  };

  function goal(value, target, label) {
    var v = Math.max(0, Number(value) || 0);
    return {
      done: v >= target,
      p: target > 0 ? Math.min(1, v / target) : 0,
      label: label
    };
  }

  var LIST = [
    {
      id: 'first-light', group: 'learn', name: '第一颗星', desc: '任意一张表练到 1 星', icon: 'star',
      stat: function (c) { return goal(c.lit, 1, c.lit + ' / 1 张'); }
    },
    {
      id: 'perfect-one', group: 'learn', name: '单表满星', desc: '一张表拿到 3 星', icon: 'medal',
      stat: function (c) { return goal(c.perfect, 1, c.perfect + ' / 1 张'); }
    },
    {
      id: 'all-lit', group: 'learn', name: '九屋亮灯', desc: '九张表全部点亮', icon: 'map',
      stat: function (c) { return goal(c.lit, 9, c.lit + ' / 9 张'); }
    },
    {
      id: 'all-perfect', group: 'learn', name: '满星森林', desc: '九张表全部练到 3 星', icon: 'crown',
      stat: function (c) { return goal(c.perfect, 9, c.perfect + ' / 9 张'); }
    },

    {
      id: 'combo-8', group: 'drill', name: '连击高手', desc: '单关连对 8 题', icon: 'flame',
      stat: function (c) { return goal(c.bestCombo, 8, '最高连击 ' + c.bestCombo); }
    },
    {
      id: 'answers-100', group: 'drill', name: '百题斩', desc: '累计答满 100 题', icon: 'stack',
      stat: function (c) { return goal(c.answered, 100, c.answered + ' / 100 题'); }
    },
    {
      id: 'answers-300', group: 'drill', name: '三百题', desc: '累计答满 300 题', icon: 'bolt',
      stat: function (c) { return goal(c.answered, 300, c.answered + ' / 300 题'); }
    },
    {
      id: 'accuracy-90', group: 'drill', name: '稳准狠', desc: '答满 100 题，正确率 ≥ 90%', icon: 'target',
      stat: function (c) {
        var p = Math.min(c.answered / 100, c.accuracy / 0.9);
        return {
          done: c.answered >= 100 && c.accuracy >= 0.9,
          p: Math.max(0, Math.min(1, p)),
          label: c.answered < 100
            ? '已答 ' + c.answered + ' / 100 题'
            : '正确率 ' + Math.round(c.accuracy * 100) + '% / 90%'
        };
      }
    },

    {
      id: 'seen-81', group: 'collect', name: '除法点读', desc: '81 道除法都点读过一遍', icon: 'divide',
      stat: function (c) { return goal(c.seen, 81, c.seen + ' / 81 道'); }
    },
    {
      id: 'cones-1024', group: 'collect', name: '松果收藏家', desc: '累计获得 1024 颗松果', icon: 'cone',
      stat: function (c) { return goal(c.stars, 1024, c.stars + ' / 1024 颗'); }
    },
    {
      id: 'trees-5', group: 'collect', name: '种树能手', desc: '种下 5 棵大树', icon: 'tree',
      stat: function (c) { return goal(c.skins, 5, c.skins + ' / 5 棵'); }
    },
    {
      id: 'harvest-clear', group: 'collect', name: '丰收小当家', desc: '通关 1024 丰收节', icon: 'basket',
      stat: function (c) {
        return {
          done: c.harvestCleared,
          p: c.harvestCleared ? 1 : 0,
          label: c.harvestCleared ? '已通关' : '还没通关'
        };
      }
    },

    {
      id: 'streak-7', group: 'keep', name: '七日不辍', desc: '连续 7 天来练习', icon: 'calendar',
      stat: function (c) { return goal(c.streak, 7, '连续 ' + c.streak + ' 天'); }
    },
    {
      id: 'daily-7', group: 'keep', name: '一周挑战', desc: '每日挑战连续完成 7 天', icon: 'sunrise',
      stat: function (c) { return goal(c.dailyStreak, 7, c.dailyStreak + ' / 7 天'); }
    },
    {
      id: 'daily-30', group: 'keep', name: '三十次挑战', desc: '累计完成 30 次每日挑战', icon: 'shield',
      stat: function (c) { return goal(c.dailyTotal, 30, c.dailyTotal + ' / 30 次'); }
    },
    {
      id: 'daily-perfect', group: 'keep', name: '今日全对', desc: '每日挑战 8 题全对', icon: 'check',
      stat: function (c) { return goal(c.dailyBestScore, 8, '最好 ' + c.dailyBestScore + ' / 8 题'); }
    }
  ];

  window.DFAwardsList = { groups: GROUPS, icons: ICONS, list: LIST };
})();
