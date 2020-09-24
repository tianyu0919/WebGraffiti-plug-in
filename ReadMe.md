# 涂鸦工具 V1.0

## 使用说明

​	将js文件夹下的 Graffiti.js 文件和css文件夹下的 Graffiti.css 文件引入HTML，然后如代码：

```html
<body>
    <!-- 创建一个盒子，类名/ID随便 -->
    <div class="GraffitiBox">
    </div>
</body>
```

​	创建一个用来加载画布的DIV，然后开始渲染：

```javascript
let canvasBox = document.querySelector(".canvasBox");
Graffiti.render('.GraffitiBox'); // 渲染。
```

