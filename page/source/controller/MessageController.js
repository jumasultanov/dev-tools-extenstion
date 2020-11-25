class MessageController {

    static items = {};

    static EVENTS = {
        HOT_KEYS: 'hotKeys',
        COMMANDER_LAYER: 'cmdLayer',
        TOOL_SEARCH: 'toolSearch',
        TOOL_EXEC: 'toolExec',
        WINDOW_LAYER: 'windowLayer'
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
            }, resolve);
        });
    }

    static getCommanderLayer() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.COMMANDER_LAYER
            }, resolve);
        });
    }

    static getListTools(search) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.TOOL_SEARCH,
                data: { search }
            }, resolve);
        });
    }

    static toolExec(id) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.TOOL_EXEC,
                data: { id }
            }, resolve);
        });
    }

    static getWindowLayer() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.WINDOW_LAYER
            }, resolve);
        });
    }

}