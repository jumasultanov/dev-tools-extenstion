class MessageController {

    static items = {};

    static EVENTS = {
        HOT_KEYS: 'hotKeys',
        COMMANDER_LAYER: 'cmdLayer',
        TOOL_SEARCH: 'toolSearch',
        TOOL_EXEC: 'toolExec'
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

    static getListTools(search) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.TOOL_SEARCH,
                data: { search }
            }, res => resolve(res));
        });
    }

    static toolExec(id) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.TOOL_EXEC,
                data: { id }
            }, res => resolve(res));
        });
    }

}