import ContentException from '../exception/ContentException.js';
import KeyController from './KeyController.js';
import ServiceController from './ServiceController.js';
import ToolController from './ToolController.js';
import StoryController from './StoryController.js';

/**
 * Класс для работы со страницей
 */
class ContentController {

    /**
     * TODO:
     * 
     *  add event system
     *  one format object sends
     * 
     */
    //Список событии, которые приходят со страницы и методы, отвечающие за ответ
    static events = {
        hotKeys: [ContentController, 'getHotKeys'],
        cmdLayer: [ContentController, 'getCmdLayer'],
        toolSearch: [ContentController, 'toolSearch'],
        toolExec: [ContentController, 'toolExec'],
        windowLayer: [ContentController, 'getWindowLayer'],
        storyList: [ContentController, 'getStoryList']
    }

    /**
     * Старт контроллера
     */
    static connect() {
        this.addListener();
    }

    /**
     * Добавление слушателя со страницы
     */
    static addListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.sendBack(request.event, request.data, sendResponse);
            return true;
        });
    }

    /**
     * Отправление данных всем страницам (не используется)
     * @param {Object} data Данные отправки
     */
    static send(data) {
        chrome.tabs.getSelected(null, tab => {
            chrome.tabs.sendMessage(tab.id, data, response => {
                console.log(response);
            });
        });
    }

    /**
     * Ответ на запрос со страницы
     * @param {String} event Название события
     * @param {Object} data Пришедшие данные
     * @param {Function} fn Коллбэк со страницы
     */
    static sendBack(event, data, fn) {
        let item = this.events[event];
        let result = {};
        if (item) {
            try {
                //Пытаемся выполнить метод
                result = item[0][item[1]].apply(item[0], [data]) || {};
                if (result instanceof Promise) {
                    result
                        .then(data => {
                            //console.log(data);
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
                console.error(e);
                let err = this.createMethodException(event, item);
                result.error = err.get();
            }
        } else {
            let err = new ContentException(ContentException.METHOD_NOT_EXIST);
            result.error = err.get();
        }
        //console.log(result);
        fn(result);
    }

    /**
     * Создание исключения для ответа
     * @param {String} event Название события
     * @param {Array} item Массив переметров метода
     * @return {ContentException}
     */
    static createMethodException(event, item) {
        let methodCall = `${event}: [${item[0].name}, ${item[1]}]`;
        return new ContentException(ContentException.METHOD_CALL_ERROR, methodCall);
    }

    /**
     * После первого запроса со страницы
     * Возаращаем комбинации клавиш и успешность соединения
     * @return {Promise}
     */
    static getHotKeys() {
        return new Promise((resolve, reject) => {
            if (ServiceController.isConnected()) {
                resolve({
                    serverSuccess: true,
                    keys: KeyController.items || null
                });
            } else {
                //Пытаемся снова соединиться с сервером
                ServiceController.connect()
                    .then(() => {
                        resolve({
                            serverSuccess: true,
                            keys: KeyController.items || null
                        })
                    })
                    .catch(() => {
                        resolve({
                            serverSuccess: false
                        });
                    });
            }
        })
    }

    /**
     * Возвращаем шаблон командной строки
     * @return {Promise}
     */
    static getCmdLayer() {
        return new Promise((resolve, reject) => {
            import('../template/Commander.js')
                .then(module => module.layer)
                .then(layer => resolve({layer}))
                .catch(err => reject(err));
        });
    }

    /**
     * Возвращаем список инструментов по вхождению по ключевым словам
     * @param {Object} obj Обязательный параметр {String} search
     * @return {Object}
     */
    static toolSearch(obj) {
        let search = obj.search;
        let tools = [];
        //Ищем, если ввели 2 и больше символа
        if (search && search.length > 1) {
            //Небольшая обработка перед поиском
            search = search.replace(/[\s]+/g, ' ').trim();
            tools = ToolController.search(search);
        }
        return { tools }
    }

    /**
     * Возвращаем данные окна по ИД инструмента
     * @param {Object} obj Обязательный параметр {Number} id
     * @return {Object}
     */
    static toolExec(obj) {
        //Получаем инструмент по ИД
        let tool = ToolController.getByID(obj.id);
        let args = null;
        if (tool) {
            //Получаем данные для открытия окна и добавляем в историю
            args = tool.getExecArgs();
            StoryController.add(tool);
        }
        return {
            method: 'window',
            args
        }
    }

    /**
     * Возвращаем шаблон менеджера окон
     * @return {Promise}
     */
    static getWindowLayer() {
        return new Promise((resolve, reject) => {
            import('../template/Window.js')
                .then(module => module.layer)
                .then(layer => resolve({layer}))
                .catch(err => reject(err));
        });
    }

    /**
     * Возвращаем список истории командной строки
     * @return {Object}
     */
    static getStoryList() {
        return {
            story: StoryController.getAll()
        }
    }

}

export default ContentController