/**
 * Класс для работы с элементом трея
 */
class TrayElement {

    //Контейнер для элементов трея
    static box;
    //Слой шаблона элемента
    layer;
    //Объект окна
    window;

    constructor(window) {
        this.window = window;
    }

    /**
     * Создание слоя шаблона
     */
    create() {
        try {
            this.layer = new Layer(this.getLayerData(), TrayElement.box);
            this.layer.create();
            this.created();
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * После создания шаблона
     */
    created() {
        this.element = this.layer.getElement('.windows-tray-element');
        this.element.addEventListener('click', ev => this.activation());
    }

    /**
     * Отображение шаблона в DOM
     */
    show() {
        if (!this.layer) this.create();
        this.layer.view();
    }

    /**
     * Удаление данных объекта
     */
    destroy() {
        if (!this.layer) return;
        this.layer.hide();
        this.layer = null;
    }

    /**
     * Событие клика на элемент в трее
     */
    activation() {
        this.window.focus();
    }

    /**
     * Изменение вида на активный элемента в трее
     */
    activate() {
        this.element.classList.add('tray-element-active');
    }

    /**
     * Изменение вида на неактивный элемента в трее
     */
    deactivate() {
        this.element.classList.remove('tray-element-active');
    }

    /**
     * Возвращает массив с шаблоном элемента
     * @return {Object[]}
     */
    getLayerData() {
        return [
            {
                type: 'element',
                name: 'div',
                attrs: { class: 'windows-tray-element' }
            }
        ]
    }

    /**
     * Установка контейнера для элементов трея
     * @param {Element} box Контейнер
     */
    static setParent(box) {
        this.box = box;
    }

}