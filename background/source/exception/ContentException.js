import Exception from './Exception.js';

/**
 * Исключения для контроллера ContentException
 */
class ContentException extends Exception {

    //Константы исключении
    static METHOD_NOT_EXIST = 10;
    static METHOD_CALL_ERROR = 11;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    /**
     * Возвращает название ошибки по ее типу
     * @return {String}
     */
    getTypeString() {
        switch (this.type) {
            case ContentException.METHOD_NOT_EXIST: return 'Метод не существует';
            case ContentException.METHOD_CALL_ERROR: return 'Метод не удалось выполнить';
        }
        return super.getTypeString();
    }

}

export default ContentException