import Exception from './Exception.js';

class FetchException extends Exception {

    static FAILED = 20;
    static RESPONSE_ERROR = 21;
    static RESPONSE_CODE_ERROR = 22;
    static RESPONSE_TEXT = 23;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    getTypeString() {
        switch (this.type) {
            case FetchException.FAILED: return 'Ответ от сервера не получен';
            case FetchException.RESPONSE_ERROR: return 'Ответ с ошибкой';
            case FetchException.RESPONSE_CODE_ERROR: return 'Код ошибки';
            case FetchException.RESPONSE_TEXT: return 'Ответ не в формате JSON';
        }
        return super.getTypeString();
    }

}

export default FetchException