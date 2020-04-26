{
    let view = {
        el: '#canvas-wrapper',
        template: `
            <canvas id="canvas"></canvas>
        `,
        render(data){
            document.querySelector(this.el).innerHTML =  this.template
        },
    }
    let model = {
        data: {
            drawingBoardData: null, //画板数据
            stroke: [], //当前笔画
            position: {
                x: undefined,
                y: undefined
            },

            using: false,
            usingEraser: false,

            recordState: false,
            recordData: {},
            recordStartTime: '',
        },
        convertPosition(canvasRect, position) {
            return {
                x: position.x - canvasRect.x,
                y: position.y - canvasRect.y
            }
        },
        setPosition(position) {
            this.data.position = position
        },
        getPosition() {
            return this.data.position
        },
        switchRecordState() {
            this.data.recordState = ! this.data.recordState
        },
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.addListener()
            this.canvas = this.initCanvas()
            window.eventHub.on('updatedCanvasSetting', data => {
                this.model.data.drawingBoardData = data
                this.updateCanvasColor(data.color)
            })
            window.eventHub.on('createStickerAndBindEvent', data => {
                this.createStickerAndBindEvent(data.html, data.selector)
            })
            window.eventHub.on('switchRecordState',() => {
                this.model.switchRecordState()
                if (this.model.data.recordState){
                    this.model.data.recordData.track = []
                    this.model.data.recordData.strikes = []
                    this.model.data.recordStartTime = new Date().getTime()
                }else {
                    console.log(JSON.stringify(this.model.data.recordData))
                }
            } )
            window.eventHub.on('clearCanvas', () => {
                this.canvas.clearRect(0, 0, canvas.getClientRects()[0].width, canvas.getClientRects()[0].height)
            })
            window.eventHub.on('play', () => {
                if (this.model.data.recordData.track) {
                    this.model.data.recordData.track.forEach(stroke => {
                        let previousPosition = stroke[0].position
                        stroke.forEach( track => {
                            setTimeout(()=>{
                                this.drawLine(previousPosition, track.position)
                                previousPosition = track.position
                            }, track.time)
                        })
                    })
                } else console.log('没有进行录制')
            })
        },
        updateCanvasColor(color) {
            this.canvas.strokeStyle = color
        },
        addListener() {
            this.listenCanvasOnmousedown()
            this.listenCanvasOnmousemove()
            this.listenCanvasOnmouseup()
        },
        listenCanvasOnmousedown() {
            canvas.onmousedown = e => {
                if (this.model.data.drawingBoardData.pointer == 'eraser') {
                    this.model.data.using = false
                    this.model.data.usingEraser = true
                }else {
                    this.model.data.using = true
                    this.model.data.usingEraser = false
                    let position = this.model.convertPosition(canvas.getClientRects()[0],{x: e.clientX, y: e.clientY})
                    this.model.setPosition(position)
                }
            }
        },
        listenCanvasOnmousemove() {
            canvas.onmousemove = e => {
                let newPosition = {
                    x: e.clientX,
                    y: e.clientY
                }
                newPosition = this.model.convertPosition(canvas.getClientRects()[0], newPosition)
                if (this.model.data.using){
                    this.drawLine(this.model.data.position, newPosition)
                    this.model.setPosition(newPosition)
                    if (this.model.data.recordState) {
                        const trackData = {
                            time: new Date().getTime() - this.model.data.recordStartTime,
                            position: this.model.getPosition()
                        }
                        this.model.data.stroke.push(trackData)
                    }
                }
                if (this.model.data.usingEraser){
                    this.canvas.clearRect(newPosition.x, newPosition.y, 15, 15)
                }
            }
        },
        listenCanvasOnmouseup() {
            canvas.onmouseup = e => {
                this.model.data.using = false
                this.model.data.usingEraser = false
                if (this.model.data.recordState){
                    this.model.data.recordData.track.push(this.model.data.stroke)
                    this.model.data.stroke = []
                }
            }
        },
        initCanvas() {
            canvas.width = '500'
            canvas.height = '624'
            canvas.style.backgroundImage = `url("./img/1.JPG")`
            canvas.style.backgroundSize = 'contain'
            return canvas.getContext('2d')
        },
        createStickerAndBindEvent(html, selector) {
            let wrapperElement = document.querySelector(selector)
            let posDiv = document.createElement('div')
            posDiv.insertAdjacentHTML('beforeend', html)
            posDiv.style.position = 'absolute'
            posDiv.style.left = '0px'
            posDiv.style.top = '0px'
            posDiv.style.border = '3px dotted black'
            posDiv.setAttribute('class', 'pos')
            let v = document.createElement('div')
            v.setAttribute('class','v')
            v.innerHTML = 'V'
            posDiv.append(v)
            wrapperElement.appendChild(posDiv)
            let newElement = posDiv
            let pointerX,  pointerY
            let state = false
            v.onclick = e => {
                state = false
                console.log(1)
                if (this.model.data.recordState){
                    this.model.data.recordData.strikes.push({
                        time: new Date().getTime() - this.model.data.recordStartTime,
                        url: 'heart.png',
                        position: {
                            x: posDiv.offsetLeft,
                            y: posDiv.offsetTop
                        }
                    })
                }
                v.remove()
                posDiv.style.border = 'none'
                posDiv.onmousedown = ev => {}
            }
            newElement.onmousedown = e => {
                state = true
                pointerX = e.clientX
                pointerY = e.clientY
                newElement.onmouseup = e => {
                    state = false
                }
                wrapperElement.onmousemove = e => {
                    e.preventDefault()
                    if (state){
                        let dX =  e.clientX - pointerX
                        let dY =  e.clientY - pointerY
                        newElement.style.left = newElement.offsetLeft + dX + 'px'
                        newElement.style.top = newElement.offsetTop + dY + 'px'
                        pointerX = e.clientX
                        pointerY = e.clientY
                    }
                }
            }
        },
        drawLine(start,end){
            this.canvas.beginPath()
            this.canvas.moveTo(start.x,start.y)
            this.canvas.lineTo(end.x,end.y)
            this.canvas.lineWidth = 3
            this.canvas.stroke()
            this.canvas.closePath()
        }
    }
    controller.init(view,model)
}
