/**
 * Класс для работы с окном
 */
class WindowElement {

    //Контейнер для окон
    static box;

    //Данные окна
    title; src;
    //Связанные объекты и позиционные данные
    tray; layer; x; y; width; height;
    //Список событии
    listEvents = {};
    //Список управляющих кнопок
    btn = {};
    //Флаг минимизированного окна
    minimized = false;
    //Флаг окна в фокусе
    focused = false;
    //Минимальные размеры
    minWidth = 400;
    minHeight = 400;

    constructor(title, src) {
        this.title = title;
        this.src = src;
    }

    /**
     * Возвращает заголовок окна
     * @return {String}
     */
    getTitle() {
        return this.title;
    }

    /**
     * Возвращает путь к инструменту для отображения в окне
     * @return {String}
     */
    getSource() {
        return this.src;
    }

    /**
     * Установка новых позиции
     * @param {Number} x Ось X
     * @param {Number} y Ось Y
     * @return {this}
     */
    setXY(x, y) {
        this.x = x;
        this.y = y;
        //Если окно отображено, то обновляем позицию окна
        if (this.layer) this.updatePosition();
        return this;
    }

    /**
     * Установка размеров окна
     * @param {Number} width Ширина
     * @param {Number} height Высота
     * @return {this}
     */
    setDimension(width, height) {
        this.width = width;
        this.height = height;
        if (this.layer) this.updateDimension();
        return this;
    }

    /**
     * Обновление позиции окна
     * @return {this}
     */
    updatePosition() {
        if (this.el) {
            this.el.style.left = `${this.x}px`;
            this.el.style.top = `${this.y}px`;
        }
        return this;
    }

    /**
     * Обновление размеров окна
     * @return {this}
     */
    updateDimension() {
        if (this.el) {
            this.el.style.width = `${this.width}px`;
            this.el.style.height = `${this.height}px`;
        }
        return this;
    }

    /**
     * Создание слоя шаблона
     */
    create() {
        try {
            this.layer = new Layer(this.getLayerData(), WindowElement.box);
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
        //Собираем элементы шаблона и добавляем слушателей
        this.iframe = this.layer.getElement('.window-element-frame');
        this.el = this.layer.getElement('.window-element');
        this.el.classList.add('window-frame-loading');
        this.iframe.onload = () => {
            this.el.classList.remove('window-frame-loading');
            this.iframe.contentDocument?.addEventListener('mousedown', ev => this.focus());
        }
        this.btn.minimize = this.el.querySelector('.control-hide');
        this.btn.expand = this.el.querySelector('.control-expand');
        this.btn.close = this.el.querySelector('.control-close');
        this.btn.minimize?.addEventListener('click', ev => this.minimize());
        this.btn.expand?.addEventListener('click', ev => this.expand());
        this.btn.close?.addEventListener('click', ev => this.close());
        let resize = this.el.querySelector('.window-element-resize');
        resize?.addEventListener('mousedown', ev => this.resizeStart(ev));
        let title = this.el.querySelector('.window-element-title');
        title?.addEventListener('mousedown', ev => this.moveStart(ev));
        document.addEventListener('mouseup', ev => {
            this.resizeStop(ev);
            this.moveStop(ev);
        });
        document.addEventListener('mousemove', ev => {
            this.resizeMove(ev);
            this.move(ev);
        });
    }

    /**
     * Отображено ли окно
     * @return {Boolean}
     */
    isView() {
        return this.layer.isView();
    }

    /**
     * В фокусе ли окно
     * @return {Boolean}
     */
    isFocus() {
        return this.focused;
    }

    /**
     * Отображение окна
     * @return {this}
     */
    show() {
        if (!this.layer) this.create();
        this.trayCreate();
        this.updatePosition().updateDimension();
        this.layer.view();
        return this;
    }
    
    /**
     * Отображаем свернутое окно
     * @return {this}
     */
    showFromMinimize() {
        this.el.classList.remove('window-element-hidden');
        this.minimized = false;
        return this;
    }

    /**
     * Свернуто ли окно
     * @return {Boolean}
     */
    isMinimize() {
        return this.minimized;
    }

    /**
     * Сворачивание окна
     */
    minimize() {
        this.el.classList.add('window-element-hidden');
        this.minimized = true;
        this.blur();
    }

    /**
     * Разворачивание окна по максимальным размерам
     */
    expand() {
        let [x, y, w, h] = WindowController.getOrientation(1);
        this.setXY(x, y).setDimension(w, h);
        this.focus();
    }

    /**
     * Закрытие окна
     */
    close() {
        if (!this.layer) return true;
        this.layer.hide();
        this.layer = null;
        this.trayDestroy();
        this.trigger('close');
    }

    /**
     * Вызов методов слушателей события
     * @param {String} event Название события
     */
    trigger(event) {
        if (!this.listEvents[event]?.length) return false;
        this.listEvents[event].forEach(fn => {
            try {
                fn(this);
            } catch (e) {
                console.error('Error execution callback', e);
            }
        });
    }

    /**
     * Добавление слушателя после закрытия окна
     * @param {Function} fn Callback функция
     * @return {Boolean}
     */
    onClose(fn) {
        if (!(fn instanceof Function)) return false;
        if (!('close' in this.listEvents)) this.listEvents.close = [];
        this.listEvents.close.push(fn);
        return true;
    }

    /**
     * Добавление слушателя после фокуса
     * @param {Function} fn Callback функция
     * @return {Boolean}
     */
    onFocus(fn) {
        if (!(fn instanceof Function)) return false;
        if (!('focus' in this.listEvents)) this.listEvents.focus = [];
        this.listEvents.focus.push(fn);
        return true;
    }

    /**
     * Начало изменения размеров окна
     * @param {Event} ev Событие мыши
     */
    resizeStart(ev) {
        //Проходим только если кликнули по левой кнопке мыши
        if (ev.which != 1) return;
        //Высчитываем максимальные размеры
        let [mw, mh] = [
            // длина контейнера - отступ окна от контейнера
            WindowElement.box.offsetWidth - this.el.offsetLeft,
            WindowElement.box.offsetHeight - this.el.offsetTop
        ];
        //Начальные данные по позициям и размерам для последующих вычислении
        this.activeResize = [ev.pageX, ev.pageY, this.width, this.height, mw, mh];
        //Отметка об изменении
        this.el.classList.add('resize-mode');
        WindowElement.box.classList.add('block-mode');
        this.focus();
    }

    /**
     * Окончание изменения размеров окна
     */
    resizeStop() {
        //Удаляем данные и отметки
        this.activeResize = null;
        this.el.classList.remove('resize-mode');
        WindowElement.box.classList.remove('block-mode');
    }

    /**
     * Изменение размеров по движению мыши
     * @param {Event} ev Событие мыши
     */
    resizeMove(ev) {
        if (!this.activeResize) return;
        //Вычисление ширины и высоты
        let w = this.activeResize[2] + ev.pageX - this.activeResize[0];
        let h = this.activeResize[3] + ev.pageY - this.activeResize[1];
        //Если уходит за пределы минимальной и максимальной, то не даем этого сделать
        if (w < this.minWidth) w = this.minWidth;
        if (h < this.minHeight) h = this.minHeight;
        if (w > this.activeResize[4]) w = this.activeResize[4];
        if (h > this.activeResize[5]) h = this.activeResize[5];
        //Меняем
        this.setDimension(w, h);
    }

    /**
     * Начало перемещения окна
     * @param {Event} ev Собыие мыши
     */
    moveStart(ev) {
        //Проходим только если кликнули по левой кнопке мыши
        if (ev.which != 1) return;
        let posBox = WindowElement.box.getBoundingClientRect();
        //Высчитываем границы дельт перемещения окна
        let [minDX, minDY] = [
            // отрицательное * отступ окна
            -1*this.el.offsetLeft,
            -1*this.el.offsetTop
        ];
        let [maxDX, maxDY] = [
            // длина блока - (отступ окна + длина окна)
            posBox.width - (this.el.offsetLeft + this.el.offsetWidth),
            posBox.height - (this.el.offsetTop + this.el.offsetHeight)
        ];
        //Начальные данные по позициям для последующих вычислении
        this.activeMove = [ev.pageX, ev.pageY, this.x, this.y, minDX, minDY, maxDX, maxDY];
        //Отметка о перемещении
        this.el.classList.add('move-mode');
        WindowElement.box.classList.add('block-mode');
        this.focus();
    }

    /**
     * Окончание перемещения
     */
    moveStop() {
        //Удаляем данные и отметки
        this.activeMove = null;
        this.el.classList.remove('move-mode');
        WindowElement.box.classList.remove('block-mode');
    }

    /**
     * Перемещение окна по движению мыши
     * @param {Event} ev Событие мыши
     */
    move(ev) {
        if (!this.activeMove) return;
        //Вычисляем дельты сдвигов
        let deltaX = ev.pageX - this.activeMove[0];
        let deltaY = ev.pageY - this.activeMove[1];
        //Если уходит за пределы минимальной и максимальной, то не даем этого сделать
        if (deltaX < this.activeMove[4]) deltaX = this.activeMove[4];
        if (deltaY < this.activeMove[5]) deltaY = this.activeMove[5];
        if (deltaX > this.activeMove[6]) deltaX = this.activeMove[6];
        if (deltaY > this.activeMove[7]) deltaY = this.activeMove[7];
        //Меняем
        this.setXY(this.activeMove[2] + deltaX, this.activeMove[3] + deltaY);
    }

    /**
     * Фокус окна
     */
    focus() {
        if (this.isMinimize()) this.showFromMinimize();
        this.el.style.zIndex = 1;
        this.tray.activate();
        this.trigger('focus');
        this.focused = true;
    }

    /**
     * Удаление фокуса
     */
    blur() {
        this.el.style.zIndex = null;
        this.tray.deactivate();
        this.focused = false;
    }

    /**
     * Создание элемента трея для окна
     */
    trayCreate() {
        if (this.tray) return;
        this.tray = new TrayElement(this);
        this.tray.show();
    }

    /**
     * Удаление элемента трея
     */
    trayDestroy() {
        if (!this.tray) return;
        this.tray.destroy();
        this.tray = null;
    }

    /**
     * Возвращает массив шаблона окна
     * @return {Object[]}
     */
    getLayerData() {
        return [
            {
                type: 'element',
                name: 'div',
                attrs: { class: 'window-element' },
                children: [
                    {
                        type: 'element',
                        name: 'div',
                        attrs: { class: 'window-element-control' },
                        children: [
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'window-element-title' },
                                children: [{ type: 'text', text: this.title }]
                            },
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'window-element-view-control' },
                                children: [
                                    {
                                        type: 'element',
                                        name: 'div',
                                        attrs: { class: 'control-element control-hide' }
                                    },
                                    {
                                        type: 'element',
                                        name: 'div',
                                        attrs: { class: 'control-element control-expand' }
                                    },
                                    {
                                        type: 'element',
                                        name: 'div',
                                        attrs: { class: 'control-element control-close' }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: 'element',
                        name: 'iframe',
                        attrs: { 
                            class: 'window-element-frame',
                            src: this.src
                        }
                    },
                    {
                        type: 'element',
                        name: 'div',
                        attrs: { class: 'window-element-resize' }
                    }
                ]
            }
        ]
    }

    /**
     * Установка контейнера для элементов окна
     * @param {Element} box Контейнер
     */
    static setParent(box) {
        this.box = box;
    }

}