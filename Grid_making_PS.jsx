var period = 8; // 周期8像素
var step = period / 2; // 单条宽度4像素（必须是4！）
var doc = app.activeDocument;

if (!doc) {
  alert("请先打开光栅动画文档！");
  exit();
}

// 创建白色画布的条纹文档（初始全白，避免全黑）
var stripeDoc = app.documents.add(
  doc.width, 
  doc.height, 
  doc.resolution, 
  "光栅条纹（调试版）", 
  NewDocumentMode.RGB, 
  DocumentFill.WHITE
);

// 用RGB值直接设置颜色（最稳定的方式，避免gray属性兼容问题）
function setBlack() {
  app.foregroundColor.rgb.red = 0;
  app.foregroundColor.rgb.green = 0;
  app.foregroundColor.rgb.blue = 0;
}
function setWhite() {
  app.foregroundColor.rgb.red = 255;
  app.foregroundColor.rgb.green = 255;
  app.foregroundColor.rgb.blue = 255;
}

// 从黑色开始填充
setBlack();
var currentColor = "黑色";
var totalSteps = Math.ceil(stripeDoc.width / step); // 总条纹数
var currentStep = 1;

// 逐条纹填充（每步都弹窗提示）
for (var x = 0; x < stripeDoc.width; x += step) {
  var endX = Math.min(x + step, stripeDoc.width); // 当前条纹结束位置
  
  // 选择当前条纹区域（x到endX，高度全屏）
  stripeDoc.selection.select([[x, 0], [endX, 0], [endX, stripeDoc.height], [x, stripeDoc.height]], SelectionType.REPLACE);
  
  // 填充当前颜色
  stripeDoc.selection.fill(app.foregroundColor);
  
  // 弹窗提示当前操作（必须手动点击确定才能继续，方便观察）
  alert(
    "第" + currentStep + "/" + totalSteps + "条\n" +
    "填充区域：" + x + "px 到 " + endX + "px\n" +
    "填充颜色：" + currentColor
  );
  
  // 切换颜色（黑→白→黑...）
  if (currentColor === "黑色") {
    setWhite();
    currentColor = "白色";
  } else {
    setBlack();
    currentColor = "黑色";
  }
  
  stripeDoc.selection.deselect();
  currentStep++;
}

alert("所有条纹填充完成！如果仍全黑，说明从未执行白色填充。");
