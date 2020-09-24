(function () {
    let Graffiti = {
        canvas: null,
        type: null,
        render(className) { // 开始渲染
            let ParentBox = document.querySelector(className);
            let canvas = document.createElement('canvas');
            canvas.setAttribute('id', 'Canvas');
            canvas.innerText = '您的浏览器不支持该插件！';
            canvas.dataset.toggle = false;
            canvas.addEventListener('mousedown', draw);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', draw);
            ParentBox.appendChild(canvas); // 添加canvas画布

            // 背景画布，用来存储已经画完了的图片。
            let bgCanvas = document.createElement('canvas');
            bgCanvas.setAttribute('id', 'bgCanvas');
            bgCanvas.innerText = '您的浏览器不支持该插件！';
            this.canvas = bgCanvas;
            ParentBox.appendChild(bgCanvas); // 添加canvas画布

            (function () {
                ParentBox.querySelectorAll('canvas').forEach(v => {
                    v.width = v.clientWidth;
                    v.height = v.clientHeight;
                })
                window.onresize = arguments.callee;
            })();

            let holdAllBox = document.createElement('div');
            holdAllBox.classList.add('hold-all');
            holdAllBox.innerHTML = `<span class='line' title='线条' data-type='line'></span><span class='rect' title='矩形' data-type='rect'></span><span class='ellipse' title='椭圆' data-type='ellipse'></span><span data-type='save'>存</span>`
            holdAllBox.addEventListener('click', holdBoxEventLoop, false);
            ParentBox.appendChild(holdAllBox);
        },
        save() {
            let base64Img = this.canvas.toDataURL('image/png', 1);
            let aLink = document.createElement('a');
            aLink.setAttribute('href', base64Img);
            aLink.download = '保存的图片！';
            aLink.click();
        }
    }

    // 工具箱点击事件
    function holdBoxEventLoop(ev) {
        if (ev.target.tagName === 'SPAN') {
            let _this = ev.target;
            if (_this.classList.contains('active')) {
                _this.classList.toggle('active');
            } else {
                removeClass('.GraffitiBox', 'span', 'active');
                _this.classList.add('active');
            }
            if (_this.classList.contains('active')) {
                Graffiti.type = _this.dataset.type;
            } else {
                Graffiti.type = null;
            }
            if (_this.dataset.type === 'save') {
                Graffiti.save();
            }
        }
    }

    // 移除类名
    function removeClass(parent, nodeName, className) {
        document.querySelector(parent).querySelectorAll(nodeName).forEach((v, i, a) => {
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
        switch (ev.type) {
            case 'mousedown': {
                this.dataset.toggle = true;
                objEvent.oldX = ev.clientX;
                objEvent.oldY = ev.clientY;
                break;
            }
            case 'mousemove': {
                if (this.dataset.toggle === "true") {
                    objEvent.newX = ev.clientX;
                    objEvent.newY = ev.clientY;
                    ctx.clearRect(0, 0, this.width, this.height);
                    ctx.strokeStyle = 'red';
                    // 判断画的类型是什么
                    canvasStroke(objEvent, Graffiti.type, ctx);
                }
                break;
            }
            case 'mouseup': {
                this.dataset.toggle = false;
                let bgCtx = Graffiti.canvas.getContext('2d');
                ctx.clearRect(0, 0, this.width, this.height);
                bgCtx.strokeStyle = 'red'
                canvasStroke(objEvent, Graffiti.type, bgCtx);
                break;
            }
            default: {
                console.log('没有找到对应的操作');
                break;
            }
        }
    }

    function canvasStroke(obj, Graffiti, ctxType) {
        ctxType.beginPath();
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
            default: {
                // console.log('我这啥也不是！');
                break;
            }
        }
    }

    return window.Graffiti = Graffiti;
})();