/* 乘法星球 — 数据、口诀与题目生成 */
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
   * 生成传统口诀：小数在前，积小于十用「得」，积为十读「一十」。
   * 例：3×4 -> 三四十二；2×5 -> 二五一十；1×6 -> 一六得六
   */
  function chant(a, b) {
    var small = Math.min(a, b);
    var big = Math.max(a, b);
    var product = a * b;
    if (product < 10) return CN[small] + CN[big] + '得' + CN[product];
    if (product === 10) return CN[small] + CN[big] + '一十';
    return CN[small] + CN[big] + cnNumber(product);
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

  function unique(list) {
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < list.length; i += 1) {
      var v = list[i];
      if (v > 0 && v <= 81 && !seen[v]) {
        seen[v] = true;
        out.push(v);
      }
    }
    return out;
  }

  function buildProductOptions(a, b) {
    var answer = a * b;
    var pool = unique([
      a * (b - 1),
      a * (b + 1),
      (a - 1) * b,
      (a + 1) * b,
      answer - 1,
      answer + 1,
      answer + 2,
      answer - 2
    ]).filter(function (v) { return v !== answer; });

    var picked = shuffle(pool).slice(0, 3);
    while (picked.length < 3) {
      var filler = 2 + Math.floor(Math.random() * 79);
      if (filler !== answer && picked.indexOf(filler) === -1) picked.push(filler);
    }
    return shuffle(picked.concat(answer));
  }

  function buildMissingOptions(b) {
    var pool = [b - 1, b + 1, b + 2, b - 2, b + 3, b - 3].filter(function (v) {
      return v >= 1 && v <= 9 && v !== b;
    });
    var picked = shuffle(pool).slice(0, 3);
    return shuffle(picked.concat(b));
  }

  function makeQuestion(a, b, type) {
    var answer = type === 'missing' ? b : a * b;
    var options = type === 'missing' ? buildMissingOptions(b) : buildProductOptions(a, b);
    return {
      id: a + 'x' + b + '-' + type,
      a: a,
      b: b,
      product: a * b,
      type: type,
      answer: answer,
      options: options,
      chant: chant(a, b)
    };
  }

  /**
   * 生成一关题目：从指定表集合中不重复抽题，约四分之一为「缺数」题。
   */
  function makeQuiz(tables, count) {
    count = count || 10;
    var pool = [];
    tables.forEach(function (table) {
      for (var b = 1; b <= 9; b += 1) pool.push([table, b]);
    });
    pool = shuffle(pool);

    var picked = pool.slice(0, Math.min(count, pool.length));
    // 题量不足时补足（正常不会发生）
    while (picked.length < count) {
      picked.push([tables[Math.floor(Math.random() * tables.length)], 1 + Math.floor(Math.random() * 9)]);
    }

    return picked.map(function (pair, index) {
      var type = Math.random() < 0.25 ? 'missing' : 'product';
      var q = makeQuestion(pair[0], pair[1], type);
      q.number = index + 1;
      return q;
    });
  }

  function formulasOf(table) {
    var out = [];
    for (var b = 1; b <= 9; b += 1) {
      out.push({
        a: table,
        b: b,
        product: table * b,
        chant: chant(table, b)
      });
    }
    return out;
  }

  window.MPData = {
    CN: CN,
    cnNumber: cnNumber,
    chant: chant,
    shuffle: shuffle,
    makeQuestion: makeQuestion,
    makeQuiz: makeQuiz,
    formulasOf: formulasOf
  };
})();
