import ContentException from '../exception/ContentException.js';
import KeyController from './KeyController.js';

class ContentController {

    /**
     * TODO:
     * 
     *  add event system
     *  one format object sends
     * 
     */
    static events = {
        hotKeys: [ContentController, 'getHotKeys']
    }

    static connect() {
        this.addListener();
    }

    static addListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.sendBack(request.event, request.data, sendResponse);
            return true;
        });
    }

    static send(data) {
        chrome.tabs.getSelected(null, tab => {
            chrome.tabs.sendMessage(tab.id, data, response => {
                console.log(response);
            });
        });
    }

    static sendBack(event, data, fn) {
        let item = this.events[event];
        let result = {};
        if (item) {
            try {
                result = item[0][item[1]].apply(item[0], [this.data]) || {};
            } catch (e) {
                let methodCall = `${event}: [${item[0].name}, ${item[1]}]`;
                let err = new ContentException(ContentException.METHOD_CALL_ERROR, methodCall);
                result.error = err.get();
            }
        } else {
            let err = new ContentException(ContentException.METHOD_NOT_EXIST);
            result.error = err.get();
        }
        console.log(result);
        fn(result);
    }

    static getHotKeys() {
        console.log('GET HOT KEYS');
        return {
            keys: KeyController.items || null
        }
    }

}

export default ContentController