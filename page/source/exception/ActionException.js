/**
 * Исключения для объекта Action
 */
class ActionException extends Exception {

    //Константы исключении
    static METHOD_NOT_EXIST = 20;
    static METHOD_CALL_ERROR = 21;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    /**
     * Возвращает название ошибки по ее типу
     * @return {String}
     */
    getTypeString() {
        switch (this.type) {
            case ActionException.METHOD_NOT_EXIST: return 'Метод не существует';
            case ActionException.METHOD_CALL_ERROR: return 'Метод не удалось выполнить';
        }
        return super.getTypeString();
    }

}