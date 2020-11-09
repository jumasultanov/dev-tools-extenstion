class MessageController {

    static items = {};

    static EVENTS = {
        HOT_KEYS: 'hotKeys'
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
/*
    static trigger(event, data, callback) {
        if (!this.isExistEvent(event)) throw new MessageException(MessageException.EVENT_NOT_EXIST);
        if (!(event in this.items)) return false;
        this.items[event].forEach(ev => ev.run(data));
        callback({error: 0});
        return true;
    }

    static isExistEvent(event) {
        return Object.values(this.EVENTS).some(value => value==event);
    }

    static send() {
        chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
            console.log(response.farewell);
            return true;
        });
    }

    static on(event, target) {
        
    }

    static off(event, target) {

    }
*/
}