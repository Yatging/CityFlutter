// 8帧光栅动画生成脚本
// 添加用户输入帧数的功能
var frameCount = parseInt(prompt("请输入总帧数：", "8"), 10);
if (isNaN(frameCount) || frameCount <= 0) {
  alert("错误：请输入一个有效的正整数作为帧数！");
  exit();
}

// 周期像素与帧数一致
var period = frameCount;

// 添加用户输入条纹宽度的功能
var stripeWidth = parseInt(prompt("请输入条纹宽度（像素）：", "10"), 10);
if (isNaN(stripeWidth) || stripeWidth <= 0) {
  alert("错误：请输入一个有效的正整数作为条纹宽度！");
  exit();
}

// 步骤1：验证源文档和图层
var sourceDoc = app.activeDocument;
if (!sourceDoc) {
  alert("错误：未检测到激活的文档，请先打开包含8帧的PSD文件！");
  exit();
}
if (sourceDoc.layers.length !== frameCount) {
  alert("错误：当前文档有 " + sourceDoc.layers.length + " 个图层，需正好" + frameCount + "个直接图层！");
  exit();
}

// 步骤2：创建新文档（用于合成条纹）
var newDoc;
try {
  newDoc = app.documents.add(
    sourceDoc.width,
    sourceDoc.height,
    sourceDoc.resolution,
    "8帧光栅动画合成",
    NewDocumentMode.RGB,
    DocumentFill.TRANSPARENT
  );
} catch (e) {
  alert("创建新文档失败：" + e.message);
  exit();
}

// 步骤3：循环处理每个图层（核心逻辑）
for (var f = 0; f < frameCount; f++) {
  // 切换到源文档，确保操作对象正确
  app.activeDocument = sourceDoc;
  
  // 获取当前帧图层，并检查是否可用
  var currentLayer = sourceDoc.layers[f];
  if (!currentLayer) {
    alert("错误：第" + (f+1) + "帧图层不存在！");
    exit();
  }
  if (currentLayer.locked) {
    alert("错误：第" + (f+1) + "帧图层被锁定，请先解锁！");
    exit();
  }
  
  // 只显示当前帧，隐藏其他所有帧
  for (var i = 0; i < sourceDoc.layers.length; i++) {
    sourceDoc.layers[i].visible = (i === f);
  }
  
  // 关键修复：用复制粘贴代替duplicate，避免枚举值兼容问题
  currentLayer.copy(); // 复制当前图层到剪贴板
  app.activeDocument = newDoc; // 切换到新文档
  newDoc.paste(); // 粘贴到新文档（自动生成新图层）
  var pastedLayer = newDoc.layers[0]; // 获取刚粘贴的图层（位于顶层）
  
  // 提取当前帧对应的条纹列（批量处理以加快速度）
  for (var x = 0; x < newDoc.width; x += stripeWidth) {
    if (Math.floor(x / stripeWidth) % period !== f) { // 保留连续的条纹宽度
      var sel = newDoc.selection;
      sel.select([
        [x, 0], 
        [Math.min(x + stripeWidth, newDoc.width), 0], 
        [Math.min(x + stripeWidth, newDoc.width), newDoc.height], 
        [x, newDoc.height]
      ], SelectionType.REPLACE);
      sel.clear(); // 批量删除非目标列
      sel.deselect(); // 取消选区，避免影响下一次选择
    }
  }
}

// 完成提示
app.activeDocument = newDoc;
alert("成功生成8帧光栅动画！可在新文档中查看条纹效果。");
