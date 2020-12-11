/**
 * Контроллер событии ввода
 */
class KeyController {

    //Список кодов клавиш
    static KEYS = {
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        ESC: 27,
        ENTER: 13,

        V: 86
    };

    /**
     * Массив объектов, который храниться в actionKeys
     * Array of Object
     * {
     *     code: Integer *required,
     *     shift: Boolean,
     *     ctrl: Boolean,
     *     alt: Boolean,
     *     disabledBrowserKey: Boolean,
     *     action: Object *required {
     *         method: String *required,
     *         args: Array
     *     }
     * }
     */
    static actionKeys;
    //Для хранения событии
    static events = {};

    /**
     * Сохраняет действия для комбинации клавиш
     * @param {Array} keys Массив комбинации с командами для них
     */
    static setActionKeys(keys) {
        this.actionKeys = keys;
    }

    /**
     * Запуск контроллера
     */
    static connect() {
        this.listen();
    }

    /**
     * Добавление событии на страницу
     */
    static listen() {
        document.addEventListener('keydown', ev => {
            //Проверяем из списка событии из background
            this.checkKeys(ev.keyCode, ev.shiftKey, ev.ctrlKey, ev.altKey, ev);
            //Проверяем из списка кастомных событии
            this.checkEvents(ev.keyCode, ev.shiftKey, ev.ctrlKey, ev.altKey, ev);
        });
    }

    /**
     * Проверка объекта на совпадение команд
     * @param {Object} key Проверяемый объект
     * @param {Boolean} shift
     * @param {Boolean} ctrl 
     * @param {Boolean} alt
     * @return {Boolean} Если совпали все значения в объекте и аргументах
     */
    static matchSpecKey(key, shift, ctrl, alt) {
        if (key.shift && !shift) return false;
        if (!key.shift && shift) return false;
        if (key.ctrl && !ctrl) return false;
        if (!key.ctrl && ctrl) return false;
        if (key.alt && !alt) return false;
        if (!key.alt && alt) return false;
        return true;
    }

    /**
     * Проверка и активация действия на нажатие клавиш из background событии
     * @param {Integer} keyCode Код клавиши
     * @param {Boolean} shift Флаг доп. нажания
     * @param {Boolean} ctrl Флаг доп. нажания
     * @param {Boolean} alt Флаг доп. нажания
     * @param {Event} ev Событие keydown
     */
    static checkKeys(keyCode, shift, ctrl, alt, ev) {
        if (!this.actionKeys) return false;
        for (let i in this.actionKeys) {
            let key = this.actionKeys[i];
            if (key.code == keyCode) {
                if (!this.matchSpecKey(key, shift, ctrl, alt)) continue;
                ActionController.activation(key.action);
                if (key.disabledBrowserKey) {
                    ev?.preventDefault();
                }
            }
        }
    }

    /**
     * Проверка и активация действия на нажатие клавиш кастомных событии
     * @param {Integer} keyCode Код клавиши
     * @param {Boolean} shift Флаг доп. нажания
     * @param {Boolean} ctrl Флаг доп. нажания
     * @param {Boolean} alt Флаг доп. нажания
     * @param {Event} ev Событие keydown
     */
    static checkEvents(keyCode, shift, ctrl, alt, ev) {
        if (!(keyCode in this.events)) return false;
        let evs = this.events[keyCode];
        let disabledBrowserKey = false;
        evs.forEach(event => {
            if (!this.matchSpecKey(event.key, shift, ctrl, alt)) return false;
            ActionController.apply(event.method);
            if (event.key.disabledBrowserKey) disabledBrowserKey = true;
        });
        if (disabledBrowserKey) {
            ev?.preventDefault();
        }
    }

    /**
     * Запуск триггера события нажания клавиши
     * @param {Integer} keyCode Код клавиши
     * @param {Boolean} shift Флаг доп. нажания
     * @param {Boolean} ctrl Флаг доп. нажания
     * @param {Boolean} alt Флаг доп. нажания
     */
    static trigger(keyCode, shift, ctrl, alt) {
        //Проверяем из списка событии из background
        this.checkKeys(ev.keyCode, ev.shiftKey, ev.ctrlKey, ev.altKey, null);
        //Проверяем из списка кастомных событии
        this.checkEvents(ev.keyCode, ev.shiftKey, ev.ctrlKey, ev.altKey, null);
    }

    /**
     * Добавления события
     * @param {Object} key {
     *      code: Integer,
     *      shift: Boolean,
     *      ctrl: Boolean,
     *      alt: Boolean,
     *      disabledBrowserKey: Booelan
     * } Объект опции комбинации
     * @param {Array} method [
     *      Function method,
     *      Object|Function context,
     *      Array args
     * ]
     * @return {Boolean} Успешность добавления
     */
    static on(key, method) {
        if (!key?.code) return false;
        if (!(method instanceof Array)) return false;
        if (!(method[0] instanceof Function)) return false;
        if (!(key.code in this.events)) this.events[key.code] = [];
        this.events[key.code].push({ key, method });
        return true;
    }

    /**
     * Удаления события по функции|методу
     * @param {Function} method 
     * @return {Boolean} Успешность удаления
     */
    static offByMethod(method) {
        if (!(method instanceof Function)) return false;
        for (let code in this.events) {
            let evs = this.events[code];
            for (let i = evs.length-1; i>=0; i--) {
                let event = evs[i];
                if (event.method[0]!==method) continue;
                evs.splice(i, 1);
            }
            if (!evs.length) delete this.events[code];
        }
        return true;
    }

    /**
     * Удаление события по комбинацию клавиш
     * @param {Object} key {
     *      code: Integer,
     *      shift: Boolean,
     *      ctrl: Boolean,
     *      alt: Boolean
     * } Объект опции комбинации
     * @return {Boolean} Успешность удаления
     */
    static offByKey(key) {
        if (!key?.code) return false;
        if (!(key.code in this.events)) return false;
        let evs = this.events[key.code];
        for (let i = evs.length-1; i>=0; i--) {
            let event = evs[i];
            if (!this.matchSpecKey(event.key, key.shift, key.ctrl, key.alt)) continue;
            evs.splice(i, 1);
        }
        if (!evs.length) delete this.events[key.code];
        return true;
    }

}