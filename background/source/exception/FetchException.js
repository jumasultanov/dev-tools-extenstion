import Exception from './Exception.js';

/**
 * Исключения для объекта Fetch
 */
class FetchException extends Exception {

    //Константы исключении
    static FAILED = 20;
    static RESPONSE_ERROR = 21;
    static RESPONSE_CODE_ERROR = 22;
    static RESPONSE_TEXT = 23;
    static EMPTY = 24;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    /**
     * Возвращает название ошибки по ее типу
     * @return {String}
     */
    getTypeString() {
        switch (this.type) {
            case FetchException.FAILED: return 'Ответ от сервера не получен';
            case FetchException.RESPONSE_ERROR: return 'Ответ с ошибкой';
            case FetchException.RESPONSE_CODE_ERROR: return 'Код ошибки';
            case FetchException.RESPONSE_TEXT: return 'Ответ не в формате JSON';
            case FetchException.EMPTY: return 'Данные отсутствуют';
        }
        return super.getTypeString();
    }

}

export default FetchException