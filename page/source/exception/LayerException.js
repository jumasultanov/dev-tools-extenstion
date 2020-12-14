/**
 * Исключения для объекта Layer
 */
class LayerException extends Exception {

    //Константы исключении
    static INPUT_NOT_ARRAY = 40;
    static INPUT_EMPTY = 41;

    constructor(type, keyword = '') {
        super(type, keyword);
    }

    /**
     * Возвращает название ошибки по ее типу
     * @return {String}
     */
    getTypeString() {
        switch (this.type) {
            case LayerException.INPUT_NOT_ARRAY: return 'Для создания слоя передан не массив';
            case LayerException.INPUT_EMPTY: return 'Для создания слоя передан пустой массив';
        }
        return super.getTypeString();
    }

}