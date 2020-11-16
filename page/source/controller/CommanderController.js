class CommanderController {

    static layer;
    static text;
    static textInput;
    static caretInput;
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
            this.layer.view();
            this.layerShowed();
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

    static layerShowed() {
        if (!this.inited) {
            this.addStyles().then(() => {
                this.layerInit();
                /**
                 * May be add scripts in future
                 */
            });
            this.inited = true;
        }
        /**
         * TODO:
         *      Clear input
         *      Add story
         */
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
        /**
         * TODO:
         *  добавить слушателя по набору из клавиатуры
         *  отбирать в выводить нужные [a-z0-9-_="]
         *  отработать ctrl + v
         *  отработать Esc, Enter и другие если нужно
         *  
         */
        console.log('SHOW');
        let box = document.querySelector('.dev-tools-cmd');
        this.textInput = box.querySelector('.cmd-input-command-line');
        this.caretInput = box.querySelector('.cmd-input-caret');
        this.text = new Input();
        this.text.on('change', 'cmd', [this.changeText, this]);
        this.text.on('move', 'pos', [this.moveCaret, this]);
        //Для выхода из консоли
        KeyController.on({
            code: KeyController.KEYS.ESC
        }, [this.escapeDown, this]);
        let fade = box.querySelector('.fade-layer');
        fade.addEventListener('click', ev => this.close());
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
    }

    static layerHide() {
        console.log('HIDE');
        this.layer.hide();
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
        this.textInput.innerText = this.text.get();
        this.moveCaret();
        /**
         * TODO:
         *      передвижение текста для каретки
         *      если текст больше контейнера
         */
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
        if (ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
            //Arrow right
            if (ev.keyCode==39) return this.text.moveForwardWord();
            //Arrow left
            if (ev.keyCode==37) return this.text.moveBackwardWord();
            //BackSpace
            if (ev.keyCode==8) return this.text.deleteLeftWord();
            //Delete
            if (ev.keyCode==46) return this.text.deleteRightWord();
        }
        if (ev.ctrlKey || ev.altKey) return false;
        //BackSpace
        if (ev.keyCode==8) return this.text.deleteLeft();
        //Delete
        if (ev.keyCode==46) return this.text.deleteRight();
        //Home
        if (ev.keyCode==36) return this.text.moveStart();
        //End
        if (ev.keyCode==35) return this.text.moveEnd();
        //Arrow right
        if (ev.keyCode==39) return this.text.moveForward();
        //Arrow left
        if (ev.keyCode==37) return this.text.moveBackward();
        //Arrow up
        //if (ev.keyCode==38) return this.text.set(HistoryController.getPrev()?.getCommand()).moveEnd();
        //Arrow down
        //if (ev.keyCode==40) return this.text.set(HistoryController.getNext()?.getCommand()).moveEnd();
        //Symbols
        let r = new RegExp('^[\\w\\s-а-яА-Я=]$', 'i');
        if (!r.test(ev.key)) return false;
        this.addString(ev.key);
    }

    static addString(str) {
        /**
         * TODO:
         *      предварительная проверка допустимых символов
         */
        this.text.add(str);
    }

    static inputEnter() {
        /**
         * Нихрена
         * нужно сделать интер только тогда, когда выбран из выдающегося списка, иначе ничего не делать
         * а список вылазет только после начала набора
         */
        if (this.enterBlock) return false;
        this.enterBlock = true;
        MessageController.commandExec(this.text.get())
            .then(data => {
                console.log(data);
                /**
                 * TODO:
                 */
                this.text.clear();
                this.enterBlock = false;
            });
    }

}