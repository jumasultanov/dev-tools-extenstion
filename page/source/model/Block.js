/**
 * Класс для работы с элементами DOM
 */
class Block {

    //Типы элементов и ее методы создания
    static types = {
        element: 'createElement',
        text: 'createTextNode'
    };

    //Тип элемента
    type;
    //Название элемента (тег или строка текста)
    name;
    //Аттрибуты
    attrs;
    //DOM элемент
    element;
    //Флаг тега
    isTag = true;

    constructor(type, name, attrs = null) {
        if (!Block.types[type]) throw new BlockException(BlockException.TYPE_NOT_EXIST, type);
        this.type = type;
        this.method = Block.types[type];
        this.name = name;
        this.attrs = attrs;
    }

    /**
     * Создание DOM элемента
     * @return {this}
     */
    create() {
        this.element = this[this.method]();
        if (this.isTag && this.attrs) {
            for (let i in this.attrs) this.element.setAttribute(i, this.attrs[i]);
        }
        return this;
    }

    /**
     * Возвращает DOM элемент
     * @return {Element|TextNode}
     */
    get() {
        return this.element;
    }

    /**
     * Создание элемента по тегу
     * @return {Element}
     */
    createElement() {
        return document.createElement(this.name);
    }

    /**
     * Создание текстового элемента
     * @return {TextNode}
     */
    createTextNode() {
        this.isTag = false;
        return document.createTextNode(this.name);
    }

}