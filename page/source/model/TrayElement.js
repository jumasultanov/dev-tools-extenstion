class TrayElement {

    static box;

    layer;
    window;

    constructor(window) {
        this.window = window;
    }

    create() {
        try {
            this.layer = new Layer(this.getLayerData(), TrayElement.box);
            this.layer.create();
            this.created();
        } catch (e) {
            console.error(e);
        }
    }

    created() {
        this.element = this.layer.getElement('.windows-tray-element');
        this.element.addEventListener('click', ev => this.activation());
    }

    show() {
        if (!this.layer) this.create();
        this.layer.view();
    }

    destroy() {
        if (!this.layer) return;
        this.layer.hide();
        this.layer = null;
    }

    activation() {
        this.window.focus();
    }

    activate() {
        this.element.classList.add('tray-element-active');
    }

    deactivate() {
        this.element.classList.remove('tray-element-active');
    }

    getLayerData() {
        return [
            {
                type: 'element',
                name: 'div',
                attrs: { class: 'windows-tray-element' }
            }
        ]
    }

    static setParent(box) {
        this.box = box;
    }

}