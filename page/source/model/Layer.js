/**
 * Класс для работы со слоем шаблона для DOM
 */
class Layer {

    //Массив с шаблоном
    elements;
    //Массив с объектами Block после обработки шаблона
    items;
    //Родительский DOM элемент
    parent;
    //Флаг отображения в DOM
    viewed = false;

    constructor(elements, parent = null) {
        if (!(elements instanceof Array)) throw new LayerException(LayerException.INPUT_NOT_ARRAY);
        if (!elements.length) throw new LayerException(LayerException.INPUT_EMPTY);
        this.elements = elements;
        this.setParent(parent);
    }

    /**
     * Установка родительского элемента
     * @param {Element} parent Родительский элемент
     */
    setParent(parent) {
        if (!(parent instanceof Element)) parent = document.body;
        this.parent = parent;
    }

    /**
     * Создание DOM дерева на основе шаблона
     * @return {this}
     */
    create() {
        this.items = [];
        this.createTree(this.elements, this.items);
        return this;
    }

    /**
     * Добавление в шаблон новых элементов
     * @param {Array} elements Массив шаблона
     * @return {this}
     */
    append(elements) {
        let length = this.items.length;
        //Создание дерева
        this.createTree(elements, this.items);
        //Если шаблон отображен, то добавляем новые элементы в DOM
        if (this.isView()) {
            this.items.forEach((item, index) => {
                if (length > index) return;
                this.parent.appendChild(item.block.get());
            });
        }
        elements.forEach(element => {
            this.elements.push(element);
        });
        return this;
    }

    /**
     * Рекурсивное создание DOM дерева на основе шаблона
     * @param {Array} elements Шаблон
     * @param {Array} items Будут записаны обработанные элементы шаблона
     * @param {Element|null} parent Родительский элемент
     */
    createTree(elements, items, parent = null) {
        elements.forEach(element => {
            //Новый объект элемента
            let block = new Block(element.type, element.name||element.text, element.attrs);
            block.create();
            //Добавление к родителю
            if (parent instanceof Element) parent.appendChild(block.get());
            let item = { block };
            items.push(item);
            //Если есть дочерние, то проходимся по ним
            if (element.children?.length) {
                item.children = [];
                this.createTree(element.children, item.children, block.get());
            }
        });
    }

    /**
     * Удаление данных объекта
     * @return {this}
     */
    destroy() {
        this.elements.splice(0, this.elements.length);
        this.items.splice(0, this.items.length);
        return this;
    }

    /**
     * Возвращает DOM элементы по селектору
     * @param {String} selector CSS селектор
     * @param {Boolean} one Вернется только один элемент
     * @return {Element[]|Element}
     */
    getElements(selector, one = false) {
        let matches = [];
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            //Если селектор это один из основных
            let parent = item.block.get().closest(selector);
            if (parent) {
                matches.push(parent);
                if (one) return matches;
            }
            //Ищем в дочерних элементах
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

    /**
     * Возвращает DOM элемент по селектору
     * @param {String} selector CSS селектор
     * @return {Element|null}
     */
    getElement(selector) {
        let matches = this.getElements(selector, true);
        if (!matches?.length) return null;
        return matches[0];
    }

    /**
     * Возвращает последний основной элемент
     * @return {Element|null}
     */
    getLastElement() {
        if (!this.items.length) return null;
        return this.items[this.items.length - 1].block.get();
    }

    /**
     * Отображен ли шаблон в DOM
     * @return {Boolean}
     */
    isView() {
        return this.viewed;
    }

    /**
     * Отображение шаблона в DOM
     * @return {this}
     */
    view() {
        if (!this.viewed) {
            this.items.forEach(item => {
                this.parent.appendChild(item.block.get());
            });
            this.viewed = true;
        }
        return this;
    }

    /**
     * Скрытие/удаление шаблона из DOM
     * @return {this}
     */
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