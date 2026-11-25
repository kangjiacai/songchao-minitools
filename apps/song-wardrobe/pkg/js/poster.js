/* 竖图：当前着色后的人物，加上这一句词和四件衣色。 */
(function () {
  var SANS = '"PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "WenQuanYi Micro Hei", "Microsoft YaHei", sans-serif';
  var SERIF = '"Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", "WenQuanYi Micro Hei", serif';

  function render(source, meta) {
    var canvas = document.createElement('canvas');
    var ctx;
    canvas.width = 1080;
    canvas.height = 1680;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F7F2EA';
    ctx.fillRect(0, 0, 1080, 1680);
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 150, 28, 780, 1387);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#8A847A';
    ctx.font = '24px ' + SANS;
    ctx.fillText('宋式衣橱', 540, 1462);
    ctx.fillStyle = '#3A3732';
    ctx.font = '40px ' + SERIF;
    ctx.fillText(meta.line || '', 540, 1520);
    ctx.fillStyle = '#8A847A';
    ctx.font = '26px ' + SANS;
    ctx.fillText(meta.source || '', 540, 1564);
    ctx.font = '24px ' + SANS;
    ctx.fillStyle = '#3A3732';
    ctx.fillText(meta.colors || '', 540, 1610);
    ctx.fillStyle = '#8A847A';
    ctx.font = '20px ' + SANS;
    ctx.fillText(meta.disclaimer || '', 540, 1652);
    return canvas;
  }

  window.WardrobePoster = { render: render };
})();
