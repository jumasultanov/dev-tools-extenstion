class MessageException extends Exception {

    static EVENT_NOT_EXIST = 10;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    getTypeString() {
        switch (this.type) {
            case MessageException.EVENT_NOT_EXIST: return 'Событие не зарегистрировано';
        }
        return super.getTypeString();
    }

}