/**
 * Родительский класс для работы с исключениями
 */
class Exception {

    //Константы исключении
    static ARG_FORMAT = 1;

    //Номер исключения
    type;
    //Дополнительный текст к исключению
    keyword;
    
    constructor(type, keyword = '') {
        this.type = type;
        this.keyword = keyword;
    }

    /**
     * Возвращает строку ошибки
     * @return {String}
     */
    get() {
        var str = this.getTypeString();
        if (this.keyword) {
            str += ` (${this.keyword})`;
        }
        return str;
    }

    /**
     * Возвращает название ошибки по ее типу
     * @return {String}
     */
    getTypeString() {
        switch (this.type) {
            case Exception.ARG_FORMAT: return 'Аргумент не соответствует типу';
        }
        return '';
    }

    /**
     * Проверка исключения по ее типу
     * @param {Number} type Номер ошибки
     * @return {Boolean}
     */
    has(type) {
        return this.type==type;
    }

}