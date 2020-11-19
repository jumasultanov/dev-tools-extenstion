class Layer {

    elements;
    items;
    parent;
    viewed = false;

    constructor(elements, parent = null) {
        if (!(elements instanceof Array)) throw new LayerException(LayerException.INPUT_NOT_ARRAY);
        if (!elements.length) throw new LayerException(LayerException.INPUT_EMPTY);
        this.elements = elements;
        this.setParent(parent);
    }

    setParent(parent) {
        if (!(parent instanceof Element)) parent = document.body;
        this.parent = parent;
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

    getElements(selector, one = false) {
        let matches = [];
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            let parent = item.block.get().closest(selector);
            if (parent) {
                matches.push(parent);
                if (one) return matches;
            }
            let els = item.block.get().querySelectorAll(selector);
            if (els?.length) {
                for (let j = 0; j < els.length; j++) {
                    let el = els[j];
                    matches.push(el);
                    if (one) return matches;
                }
            }
        }
        return matches;
    }

    getElement(selector) {
        let matches = this.getElements(selector, true);
        if (!matches?.length) return null;
        return matches[0];
    }

    isView() {
        return this.viewed;
    }

    view() {
        if (!this.viewed) {
            this.items.forEach(item => {
                this.parent.appendChild(item.block.get());
            });
            this.viewed = true;
        }
        return this;
    }

    hide() {
        if (this.viewed) {
            this.items.forEach(item => {
                this.parent.removeChild(item.block.get());
            });
            this.viewed = false;
        }
        return this;
    }

}