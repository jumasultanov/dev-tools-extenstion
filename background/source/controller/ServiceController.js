import {SERVICE_CONFIG} from '../config.js';
import App from '../core/App.js';
import Fetch from '../core/Fetch.js';
import User from '../model/User.js';
import KeyController from './KeyController.js';

class ServiceController {

    static connect() {
        let auth = new Fetch(SERVICE_CONFIG.API('connect'));
        auth.post().then(data => {
            console.log('SERVICE CONNECTED');
            let app = App.getInstance();
            let userData = data?.user;
            if (userData) app.user = new User(userData.id);
            let keys = data?.keys;
            if (keys) KeyController.set(keys);
            /**
             * TODO:
             *      добавить еще параметров
             */
        }).catch(err => {
            console.log(err);
            /**
             * TODO:
             *      при вызове командной строки повесить уведомление о соединении
             *      в попапе разширения также
             */
        });
    }

}

export default ServiceController