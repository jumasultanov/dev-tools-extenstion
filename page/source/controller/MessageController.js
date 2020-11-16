class MessageController {

    static items = {};

    static EVENTS = {
        HOT_KEYS: 'hotKeys',
        COMMANDER_LAYER: 'cmdLayer',
        COMMAND_EXEC: 'cmdExec'
    };

    static connect() {
        /**
         * DUMMY
         */
    }

    static getControlData() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.HOT_KEYS
            }, res => resolve(res));
        });
    }

    static getCommanderLayer() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.COMMANDER_LAYER
            }, res => resolve(res));
        });
    }

    static commandExec(command) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.COMMAND_EXEC,
                data: { command }
            }, res => resolve(res));
        });
    }

}