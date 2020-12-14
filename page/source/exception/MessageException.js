/**
 * Исключения для MessageController
 */
class MessageException extends Exception {

    //Константы исключении
    static EVENT_NOT_EXIST = 10;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    /**
     * Возвращает название ошибки по ее типу
     * @return {String}
     */
    getTypeString() {
        switch (this.type) {
            case MessageException.EVENT_NOT_EXIST: return 'Событие не зарегистрировано';
        }
        return super.getTypeString();
    }

}