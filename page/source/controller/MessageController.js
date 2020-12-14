/**
 * Класс для работы с запросами в background
 */
class MessageController {

    //Список событий
    static EVENTS = {
        HOT_KEYS: 'hotKeys',
        COMMANDER_LAYER: 'cmdLayer',
        TOOL_SEARCH: 'toolSearch',
        TOOL_EXEC: 'toolExec',
        WINDOW_LAYER: 'windowLayer',
        STORY_LIST: 'storyList'
    };

    /**
     * Предварительный запуск
     */
    static connect() {
        /**
         * DUMMY
         */
    }

    /**
     * Запрос для получения основных данных при первом соединении
     * @return {Promise}
     */
    static getControlData() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.HOT_KEYS
            }, resolve);
        });
    }

    /**
     * Запрос для получения шаблона командной строки
     * @return {Promise}
     */
    static getCommanderLayer() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.COMMANDER_LAYER
            }, resolve);
        });
    }

    /**
     * Запрос для получения списка инструментов по вхождению подстроки
     * @param {String} search Поисковая строка
     * @return {Promise}
     */
    static getListTools(search) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.TOOL_SEARCH,
                data: { search }
            }, resolve);
        });
    }

    /**
     * Запрос для получения данных инструмента для запуска окна
     * @param {Integer} id ИД инструмента
     * @return {Promise}
     */
    static toolExec(id) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.TOOL_EXEC,
                data: { id }
            }, resolve);
        });
    }

    /**
     * Запрос для получения шаблона менеджера окон
     * @return {Promise}
     */
    static getWindowLayer() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.WINDOW_LAYER
            }, resolve);
        });
    }

    /**
     * Запрос для получения истории запусков
     * @return {Promise}
     */
    static getStory() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                event: this.EVENTS.STORY_LIST
            }, resolve);
        });
    }

}