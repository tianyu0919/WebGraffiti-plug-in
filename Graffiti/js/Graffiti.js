(function () {
    let Graffiti = {
        el: null,
        canvas: null,
        type: null,
        options: null,
        render(options) { // 开始渲染
            this.options = options;
            let ParentBox;
            if (typeof options.el === 'string') {
                ParentBox = document.querySelector(options.el);
            } else if (typeof options.el === 'object') {
                ParentBox = options.el;
            }
            let canvasBox = document.createElement('div');
            canvasBox.classList.add('canvasBox');

            let canvas = document.createElement('canvas');
            canvas.setAttribute('id', 'Canvas');
            canvas.innerText = '您的浏览器不支持该插件！';
            canvas.dataset.toggle = false;
            canvas.addEventListener('mousedown', draw);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', draw);
            canvasBox.appendChild(canvas); // 添加canvas画布

            // 背景画布，用来存储已经画完了的图片。
            let bgCanvas = document.createElement('canvas');
            bgCanvas.setAttribute('id', 'bgCanvas');
            bgCanvas.innerText = '您的浏览器不支持该插件！';
            this.canvas = bgCanvas;
            canvasBox.appendChild(bgCanvas); // 添加canvas画布
            Graffiti.el = canvasBox;
            ParentBox.appendChild(canvasBox);
            (function () {
                ParentBox.querySelectorAll('canvas').forEach(v => {
                    let w = options.img.naturalWidth;
                    let h = options.img.naturalHeight;
                    // if (w > 1000 || h > 1000) {
                    //     let tempW = w / 4,
                    //         tempH = h / 4;
                    //     v.width = tempW;
                    //     v.height = tempH;
                    //     v.style.width = tempW + 'px';
                    //     v.style.height = tempH + 'px';
                    // } else {
                    v.width = w + 40;
                    v.height = h + 40;
                    v.style.width = w + 40 + 'px';
                    v.style.height = h + 40 + 'px';
                    // }
                    if (v.id === 'bgCanvas') {
                        let bgCtx = v.getContext('2d');
                        // options.img.setAttribute('crossOrigin', 'anonymous');
                        // let newImg = new Image();
                        // newImg.setAttribute('src',options.img.src);
                        // newImg.setAttribute('crossOrigin', 'anonymous');
                        let src = options.img.getAttribute('src');
                        if (src.includes("http")) {
                            options.img.setAttribute('crossOrigin', 'anonymous');
                        }
                        setTimeout(() => {
                            bgCtx.drawImage(options.img, 20, 20, w, h);
                        }, 100)
                    }
                });
            })();

            let holdAllBox = document.createElement('div');
            holdAllBox.classList.add('hold-all');
            holdAllBox.innerHTML = `<span class='rotate rotateLeft' title='向左旋转' data-type='rotate-left'></span>
                                    <span class='rotate rotateRight' title='向右旋转' data-type='rotate-right'></span>
                                    <span class='line' title='线条' data-type='line'></span>
                                    <span class='rect' title='矩形' data-type='rect'></span>
                                    <span class='ellipse' title='椭圆' data-type='ellipse'></span>
                                    <span class='paint-brush' title='画笔' data-type='paint-brush'></span>
                                    <span class='text' title='写字' data-type='text'></span>
                                    <span data-type='save'>存</span>`;
            holdAllBox.addEventListener('click', holdBoxEventLoop, false);
            ParentBox.appendChild(holdAllBox);
        },
        async save() { // 保存
            try {
                let file = await getImgFile(this.canvas);

                console.log(file);
                // let base64Img = this.canvas.toDataURL('image/png', 1);
                // this.canvas.setAttribute('crossOrigin', 'anonymous');
                // let aLink = document.createElement('a');
                // aLink.setAttribute('href', base64Img);
                // aLink.download = '保存的图片！';
                // aLink.click();
                // this.options.success({
                //     msg: '保存成功',
                //     base64: base64Img
                // });
            } catch (error) {
                this.options.error(error);
            }
        }
    }

    // 工具箱点击事件
    function holdBoxEventLoop(ev) {
        if (ev.target.tagName === 'SPAN') {
            let _this = ev.target;
            Graffiti.type = _this.dataset.type;
            if (_this.classList.contains('active')) {
                _this.classList.toggle('active');
            } else {
                removeClass(_this.parentNode, 'span', 'active');
                if (!_this.classList.contains('rotate')) {
                    _this.classList.add('active');
                } else {
                    let canvasBox = _this.parentElement.previousElementSibling;
                    let alreadyRotate = canvasBox.style.transform;
                    let type = _this.dataset.type;
                    if (!alreadyRotate) {
                        alreadyRotate = 0;
                    } else {
                        alreadyRotate = parseInt(alreadyRotate.split('(')[1].split('deg)')[0]);
                    }
                    if (type === 'rotate-left') { // 向左
                        alreadyRotate -= 90;
                    } else { // 向右
                        alreadyRotate += 90;
                    }
                    canvasBox.style = `transform:rotate(${alreadyRotate}deg)`;
                }
            }
            if (_this.dataset.type === 'save') {
                Graffiti.save();
            }
        }
    }

    // 移除类名
    function removeClass(parent, nodeName, className) {
        let parentElement = null;
        if (typeof parent === 'string') {
            parentElement = document.querySelector(parent);
        } else if (typeof parent === 'object') {
            parentElement = parent;
        }
        parentElement.querySelectorAll(nodeName).forEach((v, i, a) => {
            v.classList.remove(className);
        })
    }

    let objEvent = {
        oldX: null, // 点击的时候存储的坐标
        oldY: null, // 点击的时候存储的坐标
        newX: null, // 移动的时候存储的新坐标
        newY: null // 移动的时候存储的新坐标
    }

    // 画布的点击事件
    function draw(ev) {
        let ctx = this.getContext('2d');
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        let bgCtx = Graffiti.canvas.getContext('2d');
        bgCtx.strokeStyle = 'red';
        bgCtx.fillStyle = 'red';
        bgCtx.font = '16px sans-serif';
        switch (ev.type) {
            case 'mousedown': {
                console.log(Graffiti.el);
                this.dataset.toggle = true;
                objEvent.oldX = ev.offsetX;
                objEvent.oldY = ev.offsetY;
                if (Graffiti.type === 'text') { // 如果选中的是字体
                    let oText = document.createElement('textarea');
                    oText.classList.add('text');
                    oText.style.cssText = `position: absolute;left: ${objEvent.oldX}px; top: ${objEvent.oldY}px;outline: none; z-index: 4;`;
                    Graffiti.el.appendChild(oText);
                    // 给鼠标一个反应时间
                    setTimeout(() => {
                        oText.focus();
                    }, 100);

                    // 写字的函数
                    write(oText, bgCtx, {
                        x: objEvent.oldX,
                        y: objEvent.oldY
                    });
                    Graffiti.type = null; // 点击一次，然后关闭字体
                    Graffiti.el.parentElement.querySelector('span.text').classList.remove('active');
                }
                // 如果是画笔工具
                if (Graffiti.type === 'paint-brush') {
                    bgCtx.beginPath();
                    bgCtx.moveTo(objEvent.oldX, objEvent.oldY);
                }
                break;
            }
            case 'mousemove': {
                if (this.dataset.toggle === "true") {
                    objEvent.newX = ev.offsetX;
                    objEvent.newY = ev.offsetY;
                    // 判断画的类型是什么
                    if (Graffiti.type != 'paint-brush') { // 如果不是画笔，则在前景图上进行绘画
                        ctx.clearRect(0, 0, this.width, this.height);
                        canvasStroke(objEvent, Graffiti.type, ctx);
                    } else { // 否则，如果是画笔，则在后面的图上直接绘画
                        canvasStroke(objEvent, Graffiti.type, bgCtx);
                    }
                }
                break;
            }
            case 'mouseup': {
                this.dataset.toggle = false;
                objEvent.newX = ev.offsetX;
                objEvent.newY = ev.offsetY;
                ctx.clearRect(0, 0, this.width, this.height);
                if (Graffiti.type != 'paint-brush' || Graffiti.type != 'text') { // 如果不是画笔，则抬起鼠标之后在后方图上进行绘画。
                    canvasStroke(objEvent, Graffiti.type, bgCtx);
                }
                bgCtx.save();
                break;
            }
            default: {
                console.log('没有找到对应的操作');
                break;
            }
        }
    }

    // 鼠标按下移动时候的事件。进行绘画
    function canvasStroke(obj, Graffiti, ctxType) {
        if (Graffiti != 'paint-brush') { // 如果不是画笔工具的话，则开始新的路径，不然会连接到一起。
            ctxType.beginPath();
        }
        console.log(Graffiti);
        switch (Graffiti) {
            case 'line': {
                // console.log('我要画线了');
                ctxType.moveTo(obj.oldX, obj.oldY);
                ctxType.lineTo(obj.newX, obj.newY);
                ctxType.stroke();
                break;
            }
            case 'rect': {
                // console.log('我要画矩形了');
                ctxType.rect(obj.oldX, obj.oldY, obj.newX - obj.oldX, obj.newY - obj.oldY);
                ctxType.stroke();
                break;
            }
            case 'ellipse': {
                // console.log('我要画椭圆了');
                ctxType.ellipse(obj.oldX, obj.oldY, Math.abs(obj.newX - obj.oldX), Math.abs(obj.newY - obj.oldY), 0, 0, Math.PI * 2);
                ctxType.stroke();
                break;
            }
            case "paint-brush": {
                // console.log('我选中的画笔');
                ctxType.lineTo(obj.newX, obj.newY);
                ctxType.stroke();
                break;
            }
            default: {
                // console.log('我这啥也不是！');
                break;
            }
        }
    }

    // 字体写字函数
    /**
     * @param {*} dom 传入的自己
     * @param {*} ctxType 传入的画笔
     */
    function write(dom, ctxType, obj) {
        dom.addEventListener('blur', function (ev) {
            this.remove();
            // let value = this.value.split(/([a-zA-Z0-9]+)/g);
            // console.log(value);
            ctxType.fillText(this.value, obj.x, obj.y + 8);
        })
        // dom.remove();
    }

    /**
     * 转换图像格式，将Image转换为File文件
     * @param {Element} imgElement Image文件
     * @param {String} Suffix 后缀名
     */
    function getImgFile(imgElement, Suffix = "jpeg") {
        let p = new Promise((resolve, reject) => {
            var blob = null;
            blob = imgElement.toDataURL('image/jpeg', 1);

            let arr = blob.split(','); // 分隔base64拿到图像基本信息，和图像流文件
            let mime = arr[0].match(/:(.*?);/)[1]; // 正则表达式
            let suffix = mime.split('/')[1]; // 拿到最后的后缀名
            let bstr = atob(arr[1]); // 转换流文件
            let n = bstr.length; // 获取总长度
            let u8arr = new Uint8Array(n); // 进行转换
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n); // 进行转换
            }

            resolve(new File([u8arr], `名字随便起的.${suffix}`, {
                type: mime
            }))
        });
        return p;
    }

    return window.Graffiti = Graffiti;
})();