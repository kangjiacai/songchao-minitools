/* 把当前这套衣着画成一张完整竖图。图内文字用画布绘制，避免 SVG 丢字。 */
(function () {
  var CANVAS = { w: 1080, h: 1620 };
  var DEST = { x: 200, y: 36, w: 680, h: 1292 };
  var SANS = '"PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "WenQuanYi Micro Hei", "Microsoft YaHei", sans-serif';
  var SERIF = '"Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", "WenQuanYi Micro Hei", serif';

  function render(svg, meta) {
    return new Promise(function (resolve, reject) {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var clone;
      var xml;
      var blob;
      var url;
      var img;
      canvas.width = CANVAS.w;
      canvas.height = CANVAS.h;
      if (!ctx) {
        reject(new Error('no-canvas'));
        return;
      }
      ctx.fillStyle = '#F7F2EA';
      ctx.fillRect(0, 0, CANVAS.w, CANVAS.h);
      clone = svg.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', String(DEST.w));
      clone.setAttribute('height', String(DEST.h));
      clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      xml = new XMLSerializer().serializeToString(clone);
      blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      url = URL.createObjectURL(blob);
      img = new Image();
      img.onload = function () {
        try {
          ctx.imageSmoothingEnabled = true;
          if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, DEST.x, DEST.y, DEST.w, DEST.h);
          drawType(ctx, meta);
          URL.revokeObjectURL(url);
          resolve(canvas);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('svg-image'));
      };
      img.src = url;
    });
  }

  function drawType(ctx, meta) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#8A847A';
    ctx.font = '24px ' + SANS;
    ctx.fillText('宋式衣橱', 540, 1364);
    ctx.fillStyle = '#3A3732';
    ctx.font = '64px ' + SERIF;
    ctx.fillText(meta.title || '', 540, 1432);
    ctx.fillStyle = 'rgba(58, 55, 50, 0.45)';
    ctx.fillRect(490, 1456, 100, 2);
    ctx.fillStyle = '#3A3732';
    ctx.font = '28px ' + SANS;
    ctx.fillText(meta.caption || '', 540, 1506);
    ctx.fillStyle = '#8A847A';
    ctx.font = '24px ' + SANS;
    ctx.fillText(meta.note || '', 540, 1552);
    ctx.font = '22px ' + SANS;
    ctx.fillText(meta.disclaimer || '', 540, 1588);
  }

  window.WardrobePoster = {
    canvas: CANVAS,
    dest: DEST,
    viewBox: { w: 400, h: 760 },
    render: render
  };
})();
