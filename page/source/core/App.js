/**
 * Основной класс приложения, который который происходит запуск модулей
 */
class App {

    static obj;
    //Флаг успешной связи в сервером
    serverSuccess = false;

    constructor() {
        this.run();
    }

    /**
     * Запуск контроллеров
     */
    run() {
        //Контроллер событии ввода
        KeyController.connect();
        //Контроллер для связи с background
        MessageController.connect();
        //Посылаем первый запрос в background
        MessageController.getControlData()
            .then(data => {
                if (data.serverSuccess) this.serverSuccess = true;
                //Если пришли настройки по комбинациям клавиш, то сообщаем контроллеру
                if (data.keys) KeyController.setActionKeys(data.keys);
            });
    }

    /**
     * Возвращает единственный объект приложения по принципу Singleton
     */
    static getInstance() {
        if (!this.obj) this.obj = new this();
        return this.obj;
    }

}