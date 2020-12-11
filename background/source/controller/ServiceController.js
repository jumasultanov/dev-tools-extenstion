import {SERVICE_CONFIG} from '../config.js';
import App from '../core/App.js';
import Fetch from '../core/Fetch.js';
import FetchException from '../exception/FetchException.js';
import User from '../model/User.js';
import KeyController from './KeyController.js';
import ToolController from './ToolController.js';

class ServiceController {

    static connected = false;

    static isConnected() {
        return this.connected;
    }

    static connect() {
        return new Promise((resolve, reject) => {
            let auth = new Fetch(SERVICE_CONFIG.API('connect'));
            auth.post().then(data => {
                let app = App.getInstance();
                let userData = data?.user;
                if (userData) app.user = new User(userData.id);
                let keys = data?.keys;
                if (keys) KeyController.set(keys);
                let tools = data?.tools;
                if (tools) ToolController.set(tools);
                /**
                 * TODO:
                 *      добавить еще параметров
                 */
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