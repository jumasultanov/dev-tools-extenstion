/**
 * Класс для работы с командной строкой
 */
class CommanderController {

    //Слой с шаблоном
    static layer;
    //Объект Input для хранения ввода текста
    static text;
    //DOM элемент поля ввода
    static textInput;
    //DOM элемент каретки
    static caretInput;
    //DOM элемент коммандера
    static cmdLayer;
    //DOM элемент заднего фона
    static fade;
    //Флаг инициализации коммандера
    static inited = false;
    //Таймер для остановки мигания каретки
    static caretTimer = null;
    //Время остановки мигания каретки (ms)
    static maxCaretTime = 1000;
    //Стили, которые загрузятся в DOM при инициализации коммандера
    static styles = [
        "page/css/commander.css"
    ];
    
    /**
     * Открытие коммандера
     */
    static open() {
        //Если шаблон создан
        if (this.layer) {
            //Инициализация коммандера
            this.layerBeforeInit()
                .then(() => {
                    //Очищаем командную строку и покаываем коммандер
                    this.text.clear();
                    this.layerShow();
                });
        } else {
            //Получаем шаблон коммандера
            MessageController.getCommanderLayer()
                .then(data => {
                    if (data.layer) {
                        try {
                            //Если ответ корректен, то создаем слой полученного шаблона
                            this.layer = new Layer(data.layer);
                            this.layer.create();
                            //Вызываем снова открытие
                            this.open();
                        } catch (e) {
                            console.error(e);
                        }
                    }
                });
        }
    }

    /**
     * Закрытие коммандера
     */
    static close() {
        if (this.layer) this.layerHide();
    }

    /**
     * Инициализация коммандера
     * @return {Promise}
     */
    static layerBeforeInit() {
        return new Promise((resolve, reject) => {
            //Если уже был инициализирован
            if (this.inited) {
                resolve();
            } else {
                //Добавляем стили
                this.addStyles().then(() => {
                    this.layerInit();
                    resolve();
                    /**
                     *  May be add scripts in future
                     */
                });
                this.inited = true;
            }
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
     * После инициализации коммандера
     */
    static layerInit() {
        //Выборка DOM элементов
        let box = this.layer.getElement('.dev-tools-cmd');
        this.textInput = box.querySelector('.cmd-input-command-line');
        this.caretInput = box.querySelector('.cmd-input-caret');
        this.cmdLayer = box.querySelector('.cmd-layer');
        //Объект, отвечающий за командную строку
        this.text = new Input();
        //Добавление слушателей для командной строки
        this.text.on('change', 'cmd', [this.changeText, this]);
        this.text.on('changeKB', 'cmd', [this.changeTextKeyBoard, this]);
        this.text.on('move', 'pos', [this.moveCaret, this]);
        //Для выхода из консоли по ESCAPE
        KeyController.on({
            code: KeyController.KEYS.ESC
        }, [this.escapeDown, this]);
        //Для выхода по клику на задний фон
        this.fade = box.querySelector('.fade-layer');
        this.fade.addEventListener('click', ev => this.close());
        //Для вставки текста пл Ctrl+V
        KeyController.on({
            code: KeyController.KEYS.V,
            ctrl: true
        }, [this.pasteFromBuffer, this]);
        //Для ввода по клавиатуре
        document.addEventListener('keydown', ev => this.input(ev));
        //Для выбора из выведенного списка инструментов
        KeyController.on({
            code: KeyController.KEYS.ENTER
        }, [this.inputEnter, this]);
        //Устанавливаем DOM элементы коммандера для других контроллеров
        ToolController.setBox(box.querySelector('.cmd-search-list'));
        StoryController.setBox(box.querySelector('.cmd-story-user'), box.querySelector('.cmd-story'));
    }

    /**
     * Отображение окна коммандера с эффектами плавности
     */
    static layerShow() {
        this.layer.view();
        setTimeout(() => {
            this.fade.classList.add('layer-show');
            setTimeout(() => {
                this.cmdLayer.classList.add('layer-show');
                //Загрузка истории перед последним эффектом
                this.storyLoad();
            }, 100);
        }, 50);
    }

    /**
     * Скрытие окна коммандера с эффектами плавности
     */
    static layerHide() {
        //Скрываем списков инструментов по поиску, если был отображен
        ToolController.stopSearch();
        //По завершению эффектов убирается из DOM контейнера
        this.cmdLayer.addEventListener("transitionend", () => {
            this.layer.hide();
        }, { once: true });
        this.cmdLayer.classList.remove('layer-show');
        this.fade.classList.remove('layer-show');
    }

    /**
     * Уничтожение шаблонов и данных комаандера
     */
    static layerDestroy() {
        if (this.layer) {
            this.layer.destroy();
            this.layer = null;
        }
        this.textInput = null;
        this.caretInput = null;
        this.text = null;
        this.inited = false;
    }

    /**
     * Клик по escape
     */
    static escapeDown() {
        this.close();
    }

    /**
     * Событие при изменении текста в объекте Input
     */
    static changeText() {
        //Выводим изменный текст в поле командной строки
        this.textInput.innerHTML = this.text.get() + '&lrm;';
        //Обновляем позицию кареткм
        this.moveCaret();
        /**
         * TODO:
         *  При перемещении каретки в большом тексте
         *  не реализовано перемещение текста влево и вправо
         */
        ToolController.startSearch(this.text.get());
    }

    /**
     * Событие при изменении текста в объекте Input при вводе или удалении символа
     */
    static changeTextKeyBoard() {
        //Отключаем переход по истории
        StoryController.started(true);
    }

    /**
     * Обновление позиции каретки по объекту Input
     */
    static moveCaret() {
        //Меняем позицию
        this.caretInput.style.transform = 'translateX(-'+(this.text.getPosFromRight()*100)+'%)';
        //Останавливаем магание каретки
        this.caretInput.classList.add('no-flashing');
        if (!this.caretTimer) {
            let ms = 0;
            this.caretTimer = setInterval(() => {
                ms += 50;
                if (ms >= this.maxCaretTime) {
                    this.caretInput.classList.remove('no-flashing');
                    clearInterval(this.caretTimer);
                    this.caretTimer = null;
                }
            }, 50);
        }
    }

    /**
     * Событие вставки Ctrl+V
     */
    static pasteFromBuffer() {
        if (!this.layer.isView()) return false;
        //Создаем элемент поля ввода и добавляем в DOM
        let input = document.createElement('input');
        input.type = 'text';
        input.classList.add('temporary-paste-input');
        document.body.appendChild(input);
        //Фокусимся туда, чтобы отработалась вставка текста из буфера
        input.focus();
        //Через какое-то время
        setTimeout(() => {
            //Добавляем полученный после вставки текст
            this.addString(input.value);
            //Удаляем элемент из DOM
            document.body.removeChild(input);
        }, 30);
    }

    /**
     * Событие клика по клавише
     * @param {Event} ev Объект события
     */
    static input(ev) {
        if (!this.layer.isView()) return false;
        /**
         * TODO:
         *      часть клавиш убрать из списка
         *      например F5, потому что preventDefault отменяет дальнейшее событие
         */
        ev.preventDefault();
        //Если зажали ctrl
        if (ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
            //Arrow right - Перемещение вправо через слово
            if (ev.keyCode==39) return this.text.moveForwardWord();
            //Arrow left - Перемещение влево через слово
            if (ev.keyCode==37) return this.text.moveBackwardWord();
            //BackSpace - Удаление до пробела слева
            if (ev.keyCode==8) return this.text.deleteLeftWord();
            //Delete - Удаление до пробела справа
            if (ev.keyCode==46) return this.text.deleteRightWord();
        }
        //Если зажали ctrl или alt
        if (ev.ctrlKey || ev.altKey) return false;
        //BackSpace - Удаление символа слева
        if (ev.keyCode==8) return this.text.deleteLeft();
        //Delete - Удаление символа справа
        if (ev.keyCode==46) return this.text.deleteRight();
        //Home - Перемещение в начало строки
        if (ev.keyCode==36) return this.text.moveStart();
        //End - Перемещение в конец строки
        if (ev.keyCode==35) return this.text.moveEnd();
        //Arrow right - Перемещение на символ вправо
        if (ev.keyCode==39) return this.text.moveForward();
        //Arrow left - Перемещение на символ влево
        if (ev.keyCode==37) return this.text.moveBackward();
        //Arrow up - Переход по списку вверх
        if (ev.keyCode==38) return this.upDown();
        //Arrow down - Переход по списку вниз
        if (ev.keyCode==40) return this.downDown();
        //Symbols
        let r = new RegExp('^[\\w\\s-а-яА-Я="]$', 'i');
        //Не реагируем на все не подходяшие символы
        if (!r.test(ev.key)) return false;
        //Вставляем символ в командную строку
        this.text.add(ev.key);
        //Точку передвижения истории на самый конец
        StoryController.reset();
    }

    /**
     * Кликнули по стрелке вверх
     */
    static upDown() {
        //Если отображен список инструментов и не начато передвижение по истории,
        // то перемещаемся по списку инструментов
        if (ToolController.isView() && !StoryController.isStarted()) {
            ToolController.moveSelect(true);
        } else {
            //Передвигаемся по истории, очищая текст
            this.text.clear();
            this.text.add(StoryController.moveSelect(true));
            StoryController.started();
        }
    }

    /**
     * Кликнули по стрелке вниз
     */
    static downDown() {
        //Если отображен список инструментов и не начато передвижение по истории,
        // то перемещаемся по списку инструментов
        if (ToolController.isView() && !StoryController.isStarted()) {
            ToolController.moveSelect();
        } else {
            //Передвигаемся по истории, очищая текст
            this.text.clear();
            this.text.add(StoryController.moveSelect());
            StoryController.started();
        }
    }

    /**
     * Загрузка истории
     */
    static storyLoad() {
        StoryController.load();
    }

    /**
     * Добавление строки в командную строку
     * @param {String} str Добавляемая строка
     */
    static addString(str) {
        //Убираем все не нужные символы
        str = str.replace(/[^\w\s-а-яА-Я="]/gi, '').replace(/[\s]+/g, ' ');
        this.text.add(str);
    }

    /**
     * Кликнули Enter
     */
    static inputEnter() {
        /**
         * TODO:
         *  loading
         */
        //Запуск инструмента из списка выведенного
        let tool = ToolController.getSelected();
        ToolController.runSelected()
            .then(data => {
                //Если был выбран, то закрываем коммандер
                this.close();
                //Добавляем команду в историю
                StoryController.add(tool);
                //Вызываем метод для открытия окна с инструментом
                ActionController.activation(data);
            })
            .catch(() => {});
        this.text.clear();
    }

}