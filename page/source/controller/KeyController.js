class KeyController {

    static KEYS = {
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        ESC: 27,
        ENTER: 13,

        V: 86
    };

    /**
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
    static events = {};

    static setActionKeys(keys) {
        console.log('SET KEYS', keys);
        this.actionKeys = keys;
    }

    static connect() {
        this.listen();
    }

    static listen() {
        document.addEventListener('keydown', ev => {
            this.checkKeys(ev.keyCode, ev.shiftKey, ev.ctrlKey, ev.altKey, ev);
            this.checkEvents(ev.keyCode, ev.shiftKey, ev.ctrlKey, ev.altKey, ev);
        });
    }

    static matchSpecKey(key, shift, ctrl, alt) {
        if (key.shift && !shift) return false;
        if (!key.shift && shift) return false;
        if (key.ctrl && !ctrl) return false;
        if (!key.ctrl && ctrl) return false;
        if (key.alt && !alt) return false;
        if (!key.alt && alt) return false;
        return true;
    }

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

    static trigger(keyCode, shift, ctrl, alt) {
        this.checkKeys(ev.keyCode, ev.shiftKey, ev.ctrlKey, ev.altKey, null);
        this.checkEvents(ev.keyCode, ev.shiftKey, ev.ctrlKey, ev.altKey, null);
    }

    /**
     * 
     * @param {Object} key {
     *      code: Integer,
     *      shift: Boolean,
     *      ctrl: Boolean,
     *      alt: Boolean,
     *      disabledBrowserKey: Booelan
     * }
     * @param {Array} method [
     *      Function method,
     *      Object|Function context,
     *      Array args
     * ]
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
     * 
     * @param {Function} method 
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
     * 
     * @param {Object} key
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