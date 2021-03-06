{
    let view = {
        el: '#tools',
        template: `
            工具
            <svg class="icon tools-item pen " aria-hidden="true">
                <use xlink:href="#icon-pencil"></use>
            </svg>
            <svg class="icon tools-item eraser" aria-hidden="true">
                <use xlink:href="#icon-eraser"></use>
            </svg>
            <div class="tools-item color black"></div>
            <div class="tools-item color blue"></div>
            <div class="tools-item color red"></div>
            <div class="tools-item color yellow"></div>
            <svg class="icon tools-item" id="backout" aria-hidden="true">
                <use xlink:href="#icon-back"></use>
            </svg>
            <svg class="icon tools-item" id="insert-text" aria-hidden="true">
                <use xlink:href="#icon-text"></use>
            </svg>
        `,
        render(data) {
            let pointer = data.currentData.pointer
            let color = data.currentData.color
            let html = this.template.replace(pointer,pointer + ' selected').replace(color,color + ' selected')
            document.querySelector(this.el).innerHTML = html
        }
    }
    let model = {
        data: {
            currentData: {
                pointer: 'pen',
                color: 'black',
            },
            pointerLists: ['pen', 'eraser'],
            colorLists: ['black', 'blue', 'red', 'yellow']
        },
        setCurrentData(key,value){ this.data.currentData[key] = value },
        getCurrentData() { return this.data.currentData }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.addListener()
            window.eventHub.emit('updateDrawingBoardData', this.model.getCurrentData())
        },
        addListener() {
            this.bindOnclickByLists(this.model.data.pointerLists, 'pointer')
            this.bindOnclickByLists(this.model.data.colorLists, 'color')
            this.insertTextTest()
            this.backout()
        },
        bindOnclickByLists(lists, type) {
            lists.map(item => {
                document.querySelector('.' + item).onclick = e => {
                    this.model.setCurrentData(type, item)
                    this.init(this.view, this.model)
                    window.eventHub.emit('updatedOperationLog', `切换 ${type} 为 ${item}`)
                }
            })
        },
        insertTextTest() {
            document.querySelector('#insert-text').onclick = e => {
                window.eventHub.emit('createText', {
                    html: '<input type="text"  style="background-color: transparent;">',
                    type: 'text'
                })
            }
        },
        backout() {
            document.querySelector('#backout').onclick = e => {
                window.eventHub.emit('backout')
            }
        }
    }
    controller.init(view,model)
}