class KeyController {

    static KEYS = {
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        ESC: 27
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

    static connect() {
        this.listen();
    }

    static listen() {
        document.addEventListener('keydown', ev => {
            this.checkKeys(ev.keyCode, ev.shiftKey, ev.ctrlKey, ev.altKey, ev);
        });
    }

    static checkKeys(keyCode, shift, ctrl, alt, ev) {
        if (!this.actionKeys) return false;
        for (let i in this.actionKeys) {
            let key = this.actionKeys[i];
            if (key.code == keyCode) {
                if (key.shift && !shift) continue;
                if (key.ctrl && !ctrl) continue;
                if (key.alt && !alt) continue;
                ActionController.activation(key.action);
                if (key.disabledBrowserKey) {
                    ev.preventDefault();
                }
            }
        }
    }

    static setActionKeys(keys) {
        this.actionKeys = keys;
    }

}