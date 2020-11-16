class Block {

    static types = {
        element: 'createElement',
        text: 'createTextNode'
    };

    type;
    name;
    attrs;
    element;
    isTag = true;

    constructor(type, name, attrs = null) {
        if (!Block.types[type]) throw new BlockException(BlockException.TYPE_NOT_EXIST, type);
        this.type = type;
        this.method = Block.types[type];
        this.name = name;
        this.attrs = attrs;
    }

    create() {
        this.element = this[this.method]();
        if (this.isTag && this.attrs) {
            for (let i in this.attrs) this.element.setAttribute(i, this.attrs[i]);
        }
        return this;
    }

    get() {
        return this.element;
    }

    createElement() {
        return document.createElement(this.name);
    }

    createTextNode() {
        this.isTag = false;
        return document.createTextNode(this.name);
    }

}