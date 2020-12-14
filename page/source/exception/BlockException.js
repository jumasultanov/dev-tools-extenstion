/**
 * Исключения для объекта Block
 */
class BlockException extends Exception {

    //Константы исключении
    static TYPE_NOT_EXIST = 30;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    /**
     * Возвращает название ошибки по ее типу
     * @return {String}
     */
    getTypeString() {
        switch (this.type) {
            case BlockException.METHOD_NOT_EXIST: return 'Тип элемента не существует';
        }
        return super.getTypeString();
    }

}