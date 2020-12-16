import ServiceController from '../controller/ServiceController.js';
import ContentController from '../controller/ContentController.js';
import PopupController from '../controller/PopupController.js';

/**
 * Класс приложения
 */
class App {

    static obj;

    //Данные пользователя
    user;
    //Комбинации клавиш
    keys;

    constructor() {
        
    }

    /**
     * Инициализация
     */
    init() {
        //Подключение контроллера обмена данными с сервером
        ServiceController.connect()
            .then(() => {

            })
            .catch(err => {
                console.error(err.get());
            });
        //Подключение контроллера для работы со страницей
        ContentController.connect();
        //Подключение контроллера для работы со попапом расширения
        PopupController.connect();
    }

    /**
     * Возвращает единственный объект приложения по принципу Singleton
     */
    static getInstance() {
        if (!this.obj) this.obj = new this();
        return this.obj;
    }

}

export default App