class CommanderController {

    static layer;
    static text;
    static textInput;
    static caretInput;
    static cmdLayer;
    static fade;
    static inited = false;
    static fn = {};
    static caretTimer = null;
    static maxCaretTime = 1000;

    static styles = [
        "page/css/commander.css"
    ];
    
    static open() {
        /**
         * TODO:
         * 1 - загрузить модули (внутренние в расширении + внешние в сервисе)
         * 3 - показать коммандную строку с историей ввода
         */
        if (this.layer) {
            this.layerBeforeInit()
                .then(() => {
                    this.text.clear();
                    this.layerShow();
                });
        } else {
            MessageController.getCommanderLayer()
                .then(data => {
                    if (data.layer) {
                        try {
                            this.layer = new Layer(data.layer);
                            this.layer.create();
                            this.open();
                        } catch (e) {
                            console.error(e instanceof Exception);
                            console.error(e);
                        }
                    }
                });
        }
    }

    static close() {
        if (this.layer) this.layerHide();
    }

    static layerBeforeInit() {
        return new Promise((resolve, reject) => {
            if (this.inited) {
                resolve();
            } else {
                this.addStyles().then(() => {
                    this.layerInit();
                    resolve();
                    /**
                     * May be add scripts in future
                     */
                });
                this.inited = true;
            }
        });
    }

    static addStyles() {
        let addedStylesCount = 0;
        let counter = resolve => {
            addedStylesCount++;
            if (this.styles.length == addedStylesCount) resolve();
        }
        return new Promise((resolve, reject) => {
            if (this.styles?.length) {
                this.styles.forEach(href => {
                    let style = chrome.extension.getURL(href);
                    try {
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

    static layerInit() {
        let box = this.layer.getElement('.dev-tools-cmd');
        this.textInput = box.querySelector('.cmd-input-command-line');
        this.caretInput = box.querySelector('.cmd-input-caret');
        this.cmdLayer = box.querySelector('.cmd-layer');
        this.text = new Input();
        this.text.on('change', 'cmd', [this.changeText, this]);
        this.text.on('changeKB', 'cmd', [this.changeTextKeyBoard, this]);
        this.text.on('move', 'pos', [this.moveCaret, this]);
        //Для выхода из консоли
        KeyController.on({
            code: KeyController.KEYS.ESC
        }, [this.escapeDown, this]);
        this.fade = box.querySelector('.fade-layer');
        this.fade.addEventListener('click', ev => this.close());
        //Для вставки ctrl+v
        KeyController.on({
            code: KeyController.KEYS.V,
            ctrl: true
        }, [this.pasteFromBuffer, this]);
        //Для ввода
        document.addEventListener('keydown', ev => this.input(ev));
        //Для выбора из листа
        KeyController.on({
            code: KeyController.KEYS.ENTER
        }, [this.inputEnter, this]);
        ToolController.setBox(box.querySelector('.cmd-search-list'));
        StoryController.setBox(box.querySelector('.cmd-story-user'), box.querySelector('.cmd-story'));
    }

    static layerShow() {
        this.layer.view();
        setTimeout(() => {
            this.fade.classList.add('layer-show');
            setTimeout(() => {
                this.cmdLayer.classList.add('layer-show');
                this.storyLoad();
            }, 100);
        }, 50);
    }

    static layerHide() {
        ToolController.stopSearch();
        this.cmdLayer.addEventListener("transitionend", () => {
            this.layer.hide();
        }, { once: true });
        this.cmdLayer.classList.remove('layer-show');
        this.fade.classList.remove('layer-show');
    }

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

    static escapeDown() {
        this.close();
    }

    static changeText() {
        this.textInput.innerHTML = this.text.get() + '&lrm;';
        this.moveCaret();
        /**
         * TODO:
         *  При перемещении каретки в большом тексте
         *  не реализовано перемещение текста влево и вправо
         */
        ToolController.startSearch(this.text.get());
    }

    static changeTextKeyBoard() {
        //Отключаем переход по истории
        StoryController.started(true);
    }

    static moveCaret() {
        this.caretInput.style.transform = 'translateX(-'+(this.text.getPosFromRight()*100)+'%)';
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

    static pasteFromBuffer() {
        if (!this.layer.isView()) return false;
        let input = document.createElement('input');
        input.type = 'text';
        input.classList.add('temporary-paste-input');
        document.body.appendChild(input);
        input.focus();
        setTimeout(() => {
            this.addString(input.value);
            document.body.removeChild(input);
        }, 30);
    }

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
        //Все не подходяшие символы не вводятся
        if (!r.test(ev.key)) return false;
        this.text.add(ev.key);
        StoryController.reset();
    }

    static upDown() {
        if (ToolController.isView() && !StoryController.isStarted()) {
            ToolController.moveSelect(true);
        } else {
            this.text.clear();
            this.text.add(StoryController.moveSelect(true));
            StoryController.started();
        }
    }

    static downDown() {
        if (ToolController.isView() && !StoryController.isStarted()) {
            ToolController.moveSelect();
        } else {
            this.text.clear();
            this.text.add(StoryController.moveSelect());
            StoryController.started();
        }
    }

    static storyLoad() {
        StoryController.load();
    }

    static addString(str) {
        str = str.replace(/[^\w\s-а-яА-Я="]/gi, '').replace(/[\s]+/g, ' ');
        this.text.add(str);
    }

    static inputEnter() {
        /**
         * TODO:
         *  loading
         */
        let tool = ToolController.getSelected();
        ToolController.runSelected()
            .then(data => {
                this.close();
                StoryController.add(tool);
                ActionController.activation(data);
            })
            .catch(() => {});
        this.text.clear();
    }

}