class ActionException extends Exception {

    static METHOD_NOT_EXIST = 20;
    static METHOD_CALL_ERROR = 21;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    getTypeString() {
        switch (this.type) {
            case ActionException.METHOD_NOT_EXIST: return 'Метод не существует';
            case ActionException.METHOD_CALL_ERROR: return 'Метод не удалось выполнить';
        }
        return super.getTypeString();
    }

}