import {SERVICE_CONFIG} from '../config.js';
import App from '../core/App.js';
import Fetch from '../core/Fetch.js';
import FetchException from '../exception/FetchException.js';
import User from '../model/User.js';
import KeyController from './KeyController.js';
import ToolController from './ToolController.js';

/**
 * Класс для работы с сервером
 */
class ServiceController {

    //Флаг подключения к серверу
    static connected = false;

    /**
     * Было ли подклдючение к серверу
     * @return {Boolean}
     */
    static isConnected() {
        return this.connected;
    }

    /**
     * Старт контроллера
     * @return {Promise}
     */
    static connect() {
        return new Promise((resolve, reject) => {
            //Делаем запрос на сервер и обрабатываем результаты
            let auth = new Fetch(SERVICE_CONFIG.API('connect'));
            auth.post().then(data => {
                let app = App.getInstance();
                //Если авторизован, то данные пользователя
                let userData = data?.user;
                if (userData) app.user = new User(userData.id);
                //Пользовательские комбинации
                let keys = data?.keys;
                if (keys) KeyController.set(keys);
                //Список инструментов
                let tools = data?.tools;
                if (tools) ToolController.set(tools);
                /**
                 * TODO:
                 *      добавить еще параметров
                 */
                //Список инструментов является отметкой успешного соединения
                //Если их нет, то толку ноль от расширения
                if (tools) {
                    this.connected = true;
                    resolve();
                } else {
                    this.connected = false;
                    reject(new FetchException(FetchException.EMPTY, 'Инструменты'));
                }
            }).catch(err => {
                this.connected = false;
                /**
                 * TODO:
                 *      при вызове командной строки повесить уведомление о соединении
                 *      в попапе разширения также
                 */
                reject(err);
            });
        });
    }

}

export default ServiceController