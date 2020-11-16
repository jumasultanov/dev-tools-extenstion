class BlockException extends Exception {

    static TYPE_NOT_EXIST = 30;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    getTypeString() {
        switch (this.type) {
            case BlockException.METHOD_NOT_EXIST: return 'Тип элемента не существует';
        }
        return super.getTypeString();
    }

}