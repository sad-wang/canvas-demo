{
    let view = {
        el: '#tools',
        template: `
            <svg class="icon tools-item" aria-hidden="true">
                <use xlink:href="#icon-back"></use>
            </svg>
            
        `,
        render(data) {

        }
    }
    let model = {
        data: {

        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
        }
    }
    controller.init(view,model)
}