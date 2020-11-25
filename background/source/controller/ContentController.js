import ContentException from '../exception/ContentException.js';
import KeyController from './KeyController.js';
import ToolController from './ToolController.js';

class ContentController {

    /**
     * TODO:
     * 
     *  add event system
     *  one format object sends
     * 
     */
    static events = {
        hotKeys: [ContentController, 'getHotKeys'],
        cmdLayer: [ContentController, 'getCmdLayer'],
        toolSearch: [ContentController, 'toolSearch'],
        toolExec: [ContentController, 'toolExec'],
        windowLayer: [ContentController, 'getWindowLayer']
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
                result = item[0][item[1]].apply(item[0], [data]) || {};
                if (result instanceof Promise) {
                    result
                        .then(data => {
                            console.log(data);
                            fn(data);
                        })
                        .catch(() => {
                            let err = this.createMethodException(event, item);
                            let pres = { error: err.get() };
                            console.log(pres);
                            fn(pres);
                        });
                    return false;
                }
            } catch (e) {
                let err = this.createMethodException(event, item);
                result.error = err.get();
            }
        } else {
            let err = new ContentException(ContentException.METHOD_NOT_EXIST);
            result.error = err.get();
        }
        console.log(result);
        fn(result);
    }

    static createMethodException(event, item) {
        let methodCall = `${event}: [${item[0].name}, ${item[1]}]`;
        return new ContentException(ContentException.METHOD_CALL_ERROR, methodCall);
    }

    static getHotKeys() {
        return {
            keys: KeyController.items || null
        }
    }

    static getCmdLayer() {
        return new Promise((resolve, reject) => {
            import('../template/Commander.js')
                .then(module => module.layer)
                .then(layer => resolve({layer}))
                .catch(err => reject(err));
        });
    }

    static toolSearch(obj) {
        console.log(obj.search);
        return {
            tools: ToolController.search(obj.search)
        }
    }

    static toolExec(obj) {
        console.log(obj);
        /**
         * TODO:
         * 
         */
        return {
            method: 'window',
            args: ['RegExp', 'http://dev-tools.local']
        }
    }

    static getWindowLayer() {
        return new Promise((resolve, reject) => {
            import('../template/Window.js')
                .then(module => module.layer)
                .then(layer => resolve({layer}))
                .catch(err => reject(err));
        });
    }

}

export default ContentController