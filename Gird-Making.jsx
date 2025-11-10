// 从左侧开始排列的Grid动画画布脚本（带间距）
function main() {
    if (app.documents.length === 0) {
        alert("请先打开作为单个Grid单元的原图！");
        return;
    }
    var srcDoc = app.activeDocument;

    // 步骤1：获取原图尺寸
    var originalWidth = srcDoc.width;
    var originalHeight = srcDoc.height;
    alert("检测到原图尺寸：" + Math.round(originalWidth) + "×" + Math.round(originalHeight) + "像素");

    // 单个Grid宽度
    var targetGridWidth = prompt(
        "请输入单个Grid单元的目标宽度（像素）：",
        Math.min(100, Math.round(originalWidth))
    );
    if (targetGridWidth === null || isNaN(targetGridWidth) || parseInt(targetGridWidth) <= 0) {
        alert("无效的宽度值，请重新运行脚本。");
        return;
    }
    targetGridWidth = parseInt(targetGridWidth);

    // Grid间距
    var spacing = prompt(
        "请输入Grid之间的间距（像素，建议5-20）：",
        10
    );
    if (spacing === null || isNaN(spacing) || parseInt(spacing) < 0) {
        alert("无效的间距值，请重新运行脚本。");
        return;
    }
    spacing = parseInt(spacing);

    // 排列数量
    var gridCount = prompt(
        "请输入横向排列的Grid数量：",
        10
    );
    if (gridCount === null || isNaN(gridCount) || parseInt(gridCount) <= 0) {
        alert("无效的数量值，请重新运行脚本。");
        return;
    }
    gridCount = parseInt(gridCount);

    // 计算新画布尺寸（宽度=总内容宽+总间距）
    var totalContentWidth = targetGridWidth * gridCount;
    var totalSpacingWidth = spacing * (gridCount - 1);
    var newDocWidth = totalContentWidth + totalSpacingWidth;
    var newDocHeight = Math.round(originalHeight * (targetGridWidth / originalWidth)); // 等比例高度
    var newDoc = app.documents.add(
        newDocWidth,
        newDocHeight,
        srcDoc.resolution,
        "左侧对齐Grid动画画布",
        NewDocumentMode.RGB,
        DocumentFill.TRANSPARENT
    );

    // 临时文档处理缩放
    var tempDoc = app.documents.add(
        originalWidth,
        originalHeight,
        srcDoc.resolution,
        "临时缩放文档",
        NewDocumentMode.RGB,
        DocumentFill.TRANSPARENT
    );
    
    app.activeDocument = srcDoc;
    srcDoc.selection.selectAll();
    srcDoc.selection.copy();
    
    app.activeDocument = tempDoc;
    tempDoc.paste();
    var scaledLayer = tempDoc.layers[0];
    var scaleRatio = targetGridWidth / originalWidth;
    scaledLayer.resize(scaleRatio * 100, scaleRatio * 100, AnchorPosition.TOPLEFT);

    // 从左侧开始排列Grid（关键：左边界严格对齐0坐标）
    for (var i = 0; i < gridCount; i++) {
        // 复制缩放后的Grid
        app.activeDocument = tempDoc;
        scaledLayer.copy();
        
        // 粘贴到新文档并定位
        app.activeDocument = newDoc;
        var newLayer = newDoc.artLayers.add();
        newDoc.activeLayer = newLayer;
        newDoc.paste();
        var currentLayer = newDoc.layers[0];

        // 核心修正：先将图层左边界归零，再计算偏移（确保从左侧开始）
        var layerLeft = currentLayer.bounds[0]; // 图层当前左边界（可能不为0）
        currentLayer.translate(-layerLeft, 0); // 先移动到左边界=0的位置

        // 再移动到目标位置：第i个Grid的左边界 = i*(单个宽度+间距)
        currentLayer.translate(i * (targetGridWidth + spacing), 0);
    }

    // 清理临时文档
    tempDoc.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = newDoc;

    // 完成提示
    alert("Grid动画画布生成完成！\n" +
          "尺寸：" + newDocWidth + "×" + newDocHeight + "像素\n" +
          "Grid数量：" + gridCount + "，间距：" + spacing + "像素\n" +
          "所有Grid从画布最左侧开始排列，左边界对齐0坐标");
}

main();