/**
 * Класс для работы с окнами инструментов (Менеджер окон)
 */
class WindowController {

    //Слой менеджера окон
    static layer;
    //Флаг инициализации
    static inited = false;
    //Массив WindowElement
    static items = [];
    //Указатель активного окна
    static selectedIndex = 0;
    //Режим формата отображения окон
    static currentPosition = -1;
    //Внешний отступ окон для режимов отображения окон
    static offsetPosition = 20;
    //Стили, которые загрузятся в DOM при инициализации
    static styles = [
        "page/css/window.css"
    ];

    /**
     * После инициализации менеджера
     */
    static setElements() {
        //Выборка DOM элементов
        let box = this.layer.getElement('.dev-tools-windows');
        this.fade = box.querySelector('.background-layer');
        this.control = box.querySelector('.windows-control-layer');
        this.tray = box.querySelector('.windows-tray-layer');
        this.windowsList = box.querySelector('.windows-view-container');
        //Устанавливаем DOM элементы менеджера для других контроллеров
        WindowElement.setParent(this.windowsList);
        TrayElement.setParent(this.tray);
        //Закрытие менеджера
        this.close = box.querySelector('.windows-control-layer .control-close');
        this.close?.addEventListener('click', ev => {
            this.layerHide();
        });
        //Открытие профиля
        this.profile = box.querySelector('.windows-control-layer .control-profile');
        this.profile?.addEventListener('click', ev => {
            this.openProfile();
        });
        //Открытие настройек
        this.setting = box.querySelector('.windows-control-layer .control-setting');
        this.setting?.addEventListener('click', ev => {
            this.openSetting();
        });
        //Изменение позиции окон
        this.viewPos = box.querySelectorAll('.windows-control-layer .control-view-option');
        this.viewPos?.forEach(el => {
            let dataView = +el.getAttribute('dataView');
            el.addEventListener('click', ev => {
                this.updatePositions(dataView);
            });
        })
    }

    /**
     * Инициализация
     * @return {Promise}
     */
    static init() {
        return new Promise((resolve, reject) => {
            //Созадем слой шаблона
            this.createLayer()
                .then(() => {
                    //Добавляем стили
                    this.addStyles()
                        .then(() => {
                            this.inited = true;
                            this.setElements();
                            resolve();
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Добавление стилей из массива this.styles
     * @return {Promise}
     */
    static addStyles() {
        //Для подсчета кол-ва загруженных стилей (также и ошибочных) и завершение промиса
        let addedStylesCount = 0;
        let counter = resolve => {
            addedStylesCount++;
            if (this.styles.length == addedStylesCount) resolve();
        }
        return new Promise((resolve, reject) => {
            if (this.styles?.length) {
                this.styles.forEach(href => {
                    //Получаем путь к стилю из расширения
                    let style = chrome.extension.getURL(href);
                    try {
                        //Создаем и добавляем новый элемент в HEAD
                        let link = new Block('element', 'link', {
                            rel: 'stylesheet',
                            type: 'text/css',
                            href: style
                        });
                        document.head.appendChild(link.create().get());
                        link.get().onload = () => counter(resolve);
                        link.get().onerror = () => counter(resolve);
                    } catch(err) {
                        reject(err);
                    }
                });
            } else resolve();
        });
    }

    /**
     * Создание слоя шаблона
     * @return {Promise}
     */
    static createLayer() {
        return new Promise((resolve, reject) => {
            //Получаем и создаем шаблон
            MessageController.getWindowLayer()
                .then(data => {
                    if (data.layer) {
                        try {
                            this.layer = new Layer(data.layer);
                            this.layer.create();
                            resolve();
                        } catch (e) {
                            console.error(e);
                            reject();
                        }
                    } else reject();
                })
                .catch(reject);
        });
    }

    /**
     * Отображение менеджера с эффектами плавности
     */
    static layerShow() {
        this.layer.view();
        setTimeout(() => {
            this.fade.classList.add('layer-show');
            setTimeout(() => {
                this.control.classList.add('layer-show');
                this.tray.classList.add('layer-show');
            }, 100);
        }, 50);
    }

    /**
     * Скрытие менеджера с эффектами плавности
     */
    static layerHide() {
        //По завершению эффектов убирается из DOM контейнера
        this.fade.addEventListener("transitionend", () => {
            this.layer.hide();
        }, { once: true });
        this.fade.classList.remove('layer-show');
        this.control.classList.remove('layer-show');
        this.tray.classList.remove('layer-show');
    }

    /**
     * Изменение позиции окон
     * @param {Integer} fill Номер режима отображения
     */
    static updatePositions(fill) {
        this.currentPosition = fill;
        if (!this.items.length) return;
        //Получаем список индексов с активным окном и рядом стоящих, относительно режима
        let selected = this.getPositionsItems();
        selected?.forEach((index, key) => {
            //Получаем и устанавливаем для каждого окна свои координаты и размеры
            //Если свернут, от отображаем
            let [x, y, w, h] = this.getOrientation(fill, key);
            this.items[index].setXY(x, y).setDimension(w, h).showFromMinimize();
        });
        //Те окна, которые не попали в список, сворачиваем
        this.items.forEach((item, key) => {
            if (selected.indexOf(key) < 0 && item.isView()) {
                item.minimize();
            }
        });
        //Меняем вид активного режима
        this.viewPos?.forEach(el => {
            let dataView = +el.getAttribute('dataView');
            if (dataView == fill) el.classList.add('activated');
            else el.classList.remove('activated');
        })
    }

    /**
     * Возвращает список индексов окон с активным и радом стоящих относительно режима
     * @return {Number[]|null}
     */
    static getPositionsItems() {
        if (this.selectedIndex < 0) return null;
        if (!this.items.length) return null;
        let selected = [];
        //Берем активный индекс
        let checkIndex = this.selectedIndex;
        //И двигаемся вперед
        let back = false;
        //Пока не наберется нужное кол-во индексов
        while (selected.length < this.currentPosition) {
            //Если индекс существует, то берем элемент, проверяем на отображение и добавляем в список
            if (checkIndex in this.items) {
                let item = this.items[checkIndex];
                if (item.isView()) {
                    selected.push(checkIndex);
                }
            }
            //Если дошли до конца массива окон, то разворачиваемся в обратную сторону от изначального индекса
            if (checkIndex >= this.items.length - 1) {
                back = true;
                checkIndex = this.selectedIndex;
            }
            //Указываем следующий индекс на проверку
            if (back) {
                checkIndex--;
                if (checkIndex < 0) break;
            } else checkIndex++;
        }
        return selected;
    }

    /**
     * Возращает координаты и размеры относительно режима
     * @param {Number} pos Номер режима
     * @param {Number} key Индекс положения окна
     * @return {Number[]}
     */
    static getOrientation(pos, key = 0) {
        //Устанавливаем режим
        pos = pos || this.currentPosition;
        let [x, y, w, h] = [0, 0, 0, 0];
        //Ширина и высота контейнера
        let width = this.windowsList.offsetWidth;
        let height = this.windowsList.offsetHeight;
        switch (pos) {
            //Нет режима или режим с одним окном
            case -1:
            case 1:
                w = width - 2 * this.offsetPosition;
                h = height - 2 * this.offsetPosition;
                x = this.offsetPosition;
                y = this.offsetPosition;
                break;
            //Режим в двумя окнами
            case 2:
                w = (width - 3 * this.offsetPosition)/2;
                h = height - 2 * this.offsetPosition;
                x = this.offsetPosition + (key%2)*(w + this.offsetPosition);
                y = this.offsetPosition;
                break;
            //Режим в 4-мя окнами
            case 4:
                w = (width - 3 * this.offsetPosition)/2;
                h = (height - 3 * this.offsetPosition)/2;
                x = this.offsetPosition + (key%2)*(w + this.offsetPosition);
                y = this.offsetPosition + Math.floor(key/2)*(h + this.offsetPosition);
                break;
        }
        return [x, y, w, h];
    }

    /**
     * Открытие окна с настройками
     */
    static openSetting() {
        /**
         * TODO:
         */
        alert('В разработке');
    }

    /**
     * Открытие окна профиля, если авторизован
     */
    static openProfile() {
        /**
         * TODO:
         */
        alert('В разработке');
    }

    /**
     * Открытие окна
     * @param {String} title Заголовок окна
     * @param {String} src Путь к инструменту
     */
    static open(title, src) {
        //Если инициализирован
        if (this.inited) {
            //Отображаем менеджер, если закрыт
            if (!this.layer.isView()) this.layerShow();
            //Узнаем было ли открыто такое окно
            let index = this.getIndexElementByTitle(title);
            let element = null;
            //Если не был открыт, то добавляем новое
            if (index === null) {
                this.selectedIndex = this.items.length;
                let [x, y, w, h] = this.getOrientation(1);
                element = this.add(title, src).setXY(x, y).setDimension(w, h);
            } else {
                this.selectedIndex = index;
                element = this.items[index];
            }
            //Отображаем и фокусимся
            element.show().focus();
        } else {
            //Инициализация и повтор открытия окна
            this.init()
                .then(() => {
                    this.open(title, src);
                });
        }
    }

    /**
     * Добавление окна в список
     * @param {String} title Заголовок
     * @param {String} src Путь к инструменту
     * @return {WindowElement} Созданный объект окна WindowElement
     */
    static add(title, src) {
        let element = new WindowElement(title, src);
        element.onClose(el => this.closedWindowElement(el));
        element.onFocus(el => this.focusedWindowElement(el));
        this.items.push(element);
        return element;
    }

    /**
     * Событие после закрытия окна
     * @param {WindowElement} element Объект окна
     */
    static closedWindowElement(element) {
        //Находим индекс окна
        let index = this.getIndexElement(element);
        if (index > -1) {
            //Убираем из списка
            this.items.splice(index, 1);
            //Ищем другой индекс для фокуса окна
            let nextIndex = -1;
            if (index in this.items) nextIndex = index;
            else if (index > 0) nextIndex = index - 1;
            if (nextIndex > -1) this.items[nextIndex].focus();
            else this.selectedIndex = -1;
        }
    }

    /**
     * Событие после фокуса на окно
     * @param {WindowElement} element Объект окна
     */
    static focusedWindowElement(element) {
        if (!this.items.length) return;
        //Находим и меняем указатель активного окна и выводим из фокуса другие окна
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === element) {
                this.selectedIndex = i;
                continue;
            }
            this.items[i].blur();
        }
    }

    /**
     * Возвращает индекс объекта из списка окон
     * @param {WindowElement} element Объект окна
     * @return {Number}
     */
    static getIndexElement(element) {
        if (!this.items.length) return -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === element) return i;
        }
        return -1;
    }

    /**
     * Возвращает индекс объекта из списка окон по его заголовку
     * @param {String} title Заголовок окна
     */
    static getIndexElementByTitle(title) {
        if (!this.items.length) return null;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].getTitle() === title) return i;
        }
        return null;
    }
    
}