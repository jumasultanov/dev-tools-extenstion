class Layer {

    elements;
    items;
    viewed = false;

    constructor(elements) {
        if (!(elements instanceof Array)) throw new LayerException(LayerException.INPUT_NOT_ARRAY);
        if (!elements.length) throw new LayerException(LayerException.INPUT_EMPTY);
        this.elements = elements;
    }

    create() {
        this.items = [];
        this.createTree(this.elements, this.items);
        return this;
    }

    createTree(elements, items, parent = null) {
        elements.forEach(element => {
            let block = new Block(element.type, element.name||element.text, element.attrs);
            block.create();
            if (parent instanceof Element) parent.appendChild(block.get());
            let item = { block };
            items.push(item);
            if (element.children?.length) {
                item.children = [];
                this.createTree(element.children, item.children, block.get());
            }
        });
    }

    destroy() {
        this.elements.splice(0, this.elements.length);
        this.items.splice(0, this.items.length);
        return this;
    }

    isView() {
        return this.viewed;
    }

    view() {
        if (!this.viewed) {
            this.items.forEach(item => {
                document.body.appendChild(item.block.get());
            });
            this.viewed = true;
        }
        return this;
    }

    hide() {
        if (this.viewed) {
            this.items.forEach(item => {
                document.body.removeChild(item.block.get());
            });
            this.viewed = false;
        }
        return this;
    }

}