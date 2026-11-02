/* 除法森林 — 除法数据、口诀与题目生成 */
(function () {
  'use strict';

  var CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  function cnNumber(n) {
    if (n < 10) return CN[n];
    if (n === 10) return '十';
    if (n < 20) return '十' + CN[n % 10];
    var tens = Math.floor(n / 10);
    var ones = n % 10;
    return CN[tens] + '十' + (ones ? CN[ones] : '');
  }

  /**
   * 求商用的就是乘法口诀：小数在前，积小于十用「得」，积为十读「一十」。
   * 例：12 ÷ 3 -> 三四十二；10 ÷ 2 -> 二五一十；6 ÷ 1 -> 一六得六
   */
  function chant(a, b) {
    var small = Math.min(a, b);
    var big = Math.max(a, b);
    var product = a * b;
    if (product < 10) return CN[small] + CN[big] + '得' + CN[product];
    if (product === 10) return CN[small] + CN[big] + '一十';
    return CN[small] + CN[big] + cnNumber(product);
  }

  /**
   * 九张除法表 = 森林里的九家小动物。
   * 「÷3 的表」就是三只小猴平均分桃子：除数决定有几位朋友来分。
   */
  var FAMILIES = [
    null,
    { id: 'hedgehog', animal: '小刺猬', food: 'apple', foodName: '苹果', unit: '个', home: '刺猬小屋', color: '#c98a55' },
    { id: 'rabbit', animal: '小兔', food: 'carrot', foodName: '胡萝卜', unit: '根', home: '兔子洞', color: '#ff8a5c' },
    { id: 'monkey', animal: '小猴', food: 'peach', foodName: '桃子', unit: '个', home: '猴子山', color: '#f59a7a' },
    { id: 'squirrel', animal: '松鼠', food: 'acorn', foodName: '橡果', unit: '颗', home: '松鼠树洞', color: '#d9822b' },
    { id: 'bear', animal: '小熊', food: 'fish', foodName: '小鱼', unit: '条', home: '小熊木屋', color: '#4aa8e8' },
    { id: 'panda', animal: '熊猫', food: 'bamboo', foodName: '竹笋', unit: '根', home: '竹林小院', color: '#8fbf4a' },
    { id: 'fox', animal: '小狐狸', food: 'grape', foodName: '葡萄', unit: '串', home: '狐狸葡萄架', color: '#9b6be0' },
    { id: 'bird', animal: '小鸟', food: 'cherry', foodName: '樱桃', unit: '颗', home: '小鸟树梢', color: '#ff5a6e' },
    { id: 'deer', animal: '小鹿', food: 'mushroom', foodName: '蘑菇', unit: '朵', home: '小鹿草坡', color: '#e8574a' }
  ];

  function family(divisor) {
    return FAMILIES[Math.max(1, Math.min(9, Number(divisor) || 1))];
  }

  function shuffle(list) {
    var arr = list.slice();
    for (var i = arr.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  /* 从候选里挑 3 个不同的干扰项，不够就在范围内随机补齐 */
  function pickOptions(answer, pool, lo, hi) {
    var seen = Object.create(null);
    var clean = [];
    pool.forEach(function (v) {
      if (v >= lo && v <= hi && v !== answer && !seen[v]) {
        seen[v] = true;
        clean.push(v);
      }
    });
    var picked = shuffle(clean).slice(0, 3);
    while (picked.length < 3) {
      var filler = lo + Math.floor(Math.random() * (hi - lo + 1));
      if (filler !== answer && picked.indexOf(filler) === -1) picked.push(filler);
    }
    return shuffle(picked.concat(answer));
  }

  /* 常见错因：差一、把除数当成商、把被除数和除数弄反 */
  function quotientOptions(d, q) {
    return pickOptions(q, [q - 1, q + 1, q - 2, q + 2, d, q + 3, q - 3], 1, 9);
  }

  function divisorOptions(d, q) {
    return pickOptions(d, [d - 1, d + 1, d - 2, d + 2, q, d + 3], 1, 9);
  }

  function dividendOptions(d, q) {
    var n = d * q;
    return pickOptions(n, [d * (q - 1), d * (q + 1), (d - 1) * q, (d + 1) * q, n + 1, n - 1, n + 2, n - 2, d + q], 1, 81);
  }

  /* 图画题的食物太多会挤满屏幕，超过 40 个就改成算式题 */
  var STORY_MAX = 40;

  function answerOf(type, d, q) {
    if (type === 'divisor') return d;
    if (type === 'dividend') return d * q;
    return q;
  }

  function optionsOf(type, d, q) {
    if (type === 'divisor') return divisorOptions(d, q);
    if (type === 'dividend') return dividendOptions(d, q);
    return quotientOptions(d, q);
  }

  /**
   * 题目统一用 a = 除数（所属那张表）、b = 商 记录；被除数 = a × b。
   * type：quotient 求商 / divisor 找除数 / dividend 找被除数 /
   *       share 平均分图画题 / group 每份几个、能分几份的图画题
   */
  function makeQuestion(d, q, type) {
    var n = d * q;
    if ((type === 'share' || type === 'group') && n > STORY_MAX) type = 'quotient';
    return {
      id: n + '/' + d + '-' + type,
      a: d,
      b: q,
      divisor: d,
      quotient: q,
      dividend: n,
      type: type,
      answer: answerOf(type, d, q),
      options: optionsOf(type, d, q),
      chant: chant(d, q),
      family: family(d)
    };
  }

  /* 题型比例：求商约四成，平均分图画题近两成、包含分一成，找除数和找被除数各一成五 */
  function pickType(rand) {
    var r = rand();
    if (r < 0.42) return 'quotient';
    if (r < 0.6) return 'share';
    if (r < 0.7) return 'group';
    if (r < 0.85) return 'divisor';
    return 'dividend';
  }

  /**
   * 生成一关：从指定的几张除法表里不重复抽题。
   */
  function makeQuiz(tables, count) {
    count = count || 10;
    var pool = [];
    tables.forEach(function (table) {
      for (var q = 1; q <= 9; q += 1) pool.push([table, q]);
    });
    pool = shuffle(pool);

    var picked = pool.slice(0, Math.min(count, pool.length));
    while (picked.length < count) {
      picked.push([tables[Math.floor(Math.random() * tables.length)], 1 + Math.floor(Math.random() * 9)]);
    }

    return picked.map(function (pair, index) {
      var q = makeQuestion(pair[0], pair[1], pickType(Math.random));
      q.number = index + 1;
      return q;
    });
  }

  function formulasOf(table) {
    var out = [];
    for (var q = 1; q <= 9; q += 1) {
      out.push({
        a: table,
        b: q,
        divisor: table,
        quotient: q,
        dividend: table * q,
        chant: chant(table, q)
      });
    }
    return out;
  }

  /* 朗读用：「十二除以三等于四。三四十二。」 */
  function speech(d, q) {
    return cnNumber(d * q) + '除以' + cnNumber(d) + '等于' + cnNumber(q) + '。' + chant(d, q) + '。';
  }

  function formula(q) {
    if (q.type === 'divisor') return q.dividend + ' ÷ ? = ' + q.quotient;
    if (q.type === 'dividend') return '? ÷ ' + q.divisor + ' = ' + q.quotient;
    return q.dividend + ' ÷ ' + q.divisor + ' = ' + q.quotient;
  }

  /* 图画题的题干 */
  function story(q) {
    var f = q.family;
    if (q.type === 'group') {
      return q.dividend + ' ' + f.unit + f.foodName + '，每只' + f.animal + '分 ' + q.divisor + ' ' + f.unit +
        '，可以分给几只？';
    }
    return q.dividend + ' ' + f.unit + f.foodName + '，平均分给 ' + q.divisor + ' 只' + f.animal +
      '，每只分到几' + f.unit + '？';
  }

  window.DFData = {
    CN: CN,
    cnNumber: cnNumber,
    chant: chant,
    shuffle: shuffle,
    families: FAMILIES,
    family: family,
    pickType: pickType,
    pickOptions: pickOptions,
    makeQuestion: makeQuestion,
    makeQuiz: makeQuiz,
    formulasOf: formulasOf,
    speech: speech,
    formula: formula,
    story: story
  };
})();
