// Grid Animation 多帧遮罩底图脚本（完全兼容PS环境）
function main() {
    // 步骤1：输入与Grid画布一致的核心参数（必须匹配！）
    alert("请输入与Grid画布完全一致的参数，否则动画会错位！");

    // 单个Grid宽度
    var gridWidth = prompt("单个Grid单元宽度（像素）：", 50);
    if (!isValidNumber(gridWidth, 1)) {
        alert("无效的Grid宽度！");
        return;
    }
    gridWidth = parseInt(gridWidth);

    // Grid间距
    var spacing = prompt("Grid之间的间距（像素）：", 10);
    if (!isValidNumber(spacing, 0)) {
        alert("无效的间距！");
        return;
    }
    spacing = parseInt(spacing);

    // Grid数量（决定帧数量）
    var gridCount = prompt("Grid总数量（即动画总帧数）：", 10);
    if (!isValidNumber(gridCount, 1)) {
        alert("无效的数量！");
        return;
    }
    gridCount = parseInt(gridCount);

    // Grid高度（单个Grid的高度）
    var gridHeight = prompt("单个Grid单元高度（像素）：", 200);
    if (!isValidNumber(gridHeight, 1)) {
        alert("无效的高度！");
        return;
    }
    gridHeight = parseInt(gridHeight);

    // 步骤2：设置遮罩样式（遮挡非当前帧的区域）
    var maskColor = prompt("遮罩颜色（r,g,b，如0,0,0为黑色）：", "0,0,0");
    var rgbStrs = maskColor.split(",");
    var rgb = [];
    for (var i = 0; i < rgbStrs.length; i++) {
        rgb.push(Number(rgbStrs[i]));
    }
    var rgbValid = true;
    for (var i = 0; i < rgb.length; i++) {
        var c = rgb[i];
        if (isNaN(c) || c < 0 || c > 255) {
            rgbValid = false;
            break;
        }
    }
    if (rgb.length !== 3 || !rgbValid) {
        alert("颜色格式错误！请使用r,g,b（0-255）");
        return;
    }

    var maskOpacity = prompt("遮罩透明度（0-100，100为完全遮挡）：", 100);
    if (!isValidNumber(maskOpacity, 0, 100)) {
        alert("透明度需为0-100！");
        return;
    }
    maskOpacity = parseInt(maskOpacity);

    // 步骤3：设置动画参数
    var frameDelay = prompt("每帧持续时间（秒，如0.1=100毫秒）：", 0.1);
    if (!isValidNumber(frameDelay, 0.01, 5)) {
        alert("帧延迟需为0.01-5秒！");
        return;
    }
    frameDelay = parseFloat(frameDelay);

    // 步骤4：创建遮罩文档（尺寸与Grid画布完全一致）
    var totalWidth = gridWidth * gridCount + spacing * (gridCount - 1);
    var maskDoc = app.documents.add(
        totalWidth,
        gridHeight,
        app.activeDocument.resolution,
        "Grid动画多帧遮罩",
        NewDocumentMode.RGB,
        DocumentFill.TRANSPARENT
    );

    // 步骤5：为每个Grid创建单独的帧图层（核心：一帧对应一个可见Grid）
    var frames = []; // 存储所有帧信息
    for (var i = 0; i < gridCount; i++) {
        // 1. 计算当前帧对应的Grid位置
        var gridX = i * (gridWidth + spacing); // 第i个Grid的左边界

        // 2. 创建新图层（每个帧一个图层）
        var frameLayer = maskDoc.artLayers.add();
        frameLayer.name = "帧" + (i + 1); // 图层命名：帧1、帧2...

        // 3. 在图层上绘制"反向遮罩"：遮挡除当前Grid外的所有区域
        // 先选中整个画布（替换原有选区）
        maskDoc.selection.select([
            [0, 0],
            [totalWidth, 0],
            [totalWidth, gridHeight],
            [0, gridHeight]
        ], SelectionType.REPLACE);

        // 减去当前Grid的区域（从现有选区中移除）
        maskDoc.selection.select([
            [gridX, 0],
            [gridX + gridWidth, 0],
            [gridX + gridWidth, gridHeight],
            [gridX, gridHeight]
        ], SelectionType.SUBTRACT);

        // 4. 填充遮罩颜色并设置透明度
        var fillColor = new SolidColor();
        fillColor.rgb.red = rgb[0];
        fillColor.rgb.green = rgb[1];
        fillColor.rgb.blue = rgb[2];
        maskDoc.selection.fill(fillColor);
        frameLayer.opacity = maskOpacity;

        // 5. 取消选区，隐藏当前图层（后续通过帧控制显示）
        maskDoc.selection.deselect();
        frameLayer.visible = false;

        // 6. 记录帧信息（关联图层）
        frames.push({ layer: frameLayer });
    }

    // 步骤6：创建动画帧（每帧仅显示对应图层）
    var animation = maskDoc.animation;
    animation.convertToFrameAnimation(); // 切换到帧动画模式

    // 为每个帧设置可见图层和延迟
    for (var f = 0; f < gridCount; f++) {
        // 添加新帧
        if (f > 0) animation.addFrame();
        // 隐藏所有图层
        maskDoc.artLayers.everyItem().visible = false;
        // 显示当前帧对应的图层
        frames[f].layer.visible = true;
        // 设置帧延迟
        animation.frames[f].delay = frameDelay;
    }

    // 设置动画循环（0=无限循环）
    animation.frames[0].loopCount = 0;

    // 步骤7：完成提示（含GIF导出指导）
    alert(
        "多帧遮罩底图生成完成！\n" +
        "尺寸：" + totalWidth + "×" + gridHeight + "像素（与Grid画布匹配）\n" +
        "总帧数：" + gridCount + "，每帧延迟：" + frameDelay + "秒\n\n" +
        "【导出GIF步骤】\n" +
        "1. 菜单：文件 > 导出 > 存储为Web所用格式（旧版）\n" +
        "2. 格式选择GIF，循环选项选“永远”\n" +
        "3. 点击存储，即可生成动画GIF"
    );
}

// 工具函数：验证数字有效性
function isValidNumber(value, min, max) {
    var num = parseFloat(value);
    return !isNaN(num) && num >= min && (max === undefined || num <= max);
}

main();
