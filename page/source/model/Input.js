/**
 * Класс для работы с текстовой строкой
 */
class Input {

    //События
    events = {
        change: {}, //При изменении текста
        changeKB: {}, //При изменении текста (добавлении и удалении)
        move: {} //При перемещении каретки
    }

    //Значение/Текст
    value;
    //Указатель каретки
    pos = 0;

    constructor(value = '') {
        this.value = value;
    }

    /**
     * Добавления слушателя события
     * @param {String} event Название события
     * @param {String} name Ключевое слово слушателя
     * @param {Array} data Данные под вызову метода
     * Формат: [
     *      Function method,
     *      Object|Function context,
     *      Array args
     * ]
     * @return {Boolean}
     */
    on(event, name, data) {
        if (!(event in this.events)) return false;
        if (!name) return false;
        if (!(data instanceof Array) || !data.length) return false;
        this.events[event][name] = data;
        return true;
    }

    /**
     * Удаление слушателя события
     * @param {String} event Название события
     * @param {String} name Ключевое слово слушателя
     * @return {Boolean}
     */
    off(event, name) {
        if (!(event in this.events)) return false;
        if (!(name in this.events[event])) return false;
        delete this.events[event][name];
        return true;
    }

    /**
     * Вызов методов слушателей события
     * @param {String} event Название события
     */
    trigger(event) {
        if (!(event in this.events)) return false;
        for (let name in this.events[event]) ActionController.apply(this.events[event][name]);
    }

    /**
     * Изменение текста
     * @param {String} value Новое значение
     * @param {Boolean} kb Если нужно запустить дополнительное событие изменения
     * @return {this}
     */
    set(value, kb = false) {
        this.value = value;
        this.trigger('change');
        if (kb) this.trigger('changeKB');
        return this;
    }

    /**
     * Возвращает текст
     * @return {String}
     */
    get() {
        return this.value;
    }

    /**
     * Возвращает позицию каретки
     * @return {Number}
     */
    getPos() {
        return this.pos;
    }

    /**
     * Возвращает позицию начиная отсчет справа
     * @return {Number}
     */
    getPosFromRight() {
        return this.value.length - this.pos;
    }

    /**
     * Очистка текста
     * @return {this}
     */
    clear() {
        this.set('');
        this.movePos(0);
        return this;
    }

    /**
     * Добавить подстроку в текст относительно позиции каретки
     * @param {String} value Добавляемая подстрока
     * @return {this}
     */
    add(value) {
        this.set(this.value.slice(0, this.pos) + value + this.value.slice(this.pos), true);
        this.movePos(this.pos + value.length);
        return this;
    }

    /**
     * Удалить символы влево, начиная от позиции каретки
     * @param {Number} length Количество символов
     * @return {this}
     */
    deleteLeft(length = 1) {
        if (this.pos) {
            this.set(this.value.slice(0, this.pos - length) + this.value.slice(this.pos), true);
            this.movePos(this.pos - length);
        }
        return this;
    }

    /**
     * Удалить символы вправо, начиная от позиции каретки
     * @param {Number} length Количество символов
     * @return {this}
     */
    deleteRight(length = 1) {
        this.set(this.value.slice(0, this.pos) + this.value.slice(this.pos + length), true);
        return this;
    }

    /**
     * Удалить слово влево, начиная от позиции каретки
     * @return {this}
     */
    deleteLeftWord() {
        let newPos = this.getBackwardWordPosition();
        return this.deleteLeft(this.pos - newPos);
    }

    /**
     * Удалить слово вправо, начиная от позиции каретки
     * @return {this}
     */
    deleteRightWord() {
        let newPos = this.getForwardWordPosition();
        return this.deleteRight(newPos - this.pos);
    }

    /**
     * Перемещение позиции каретки
     * @param {Number} pos Новая позиция
     * @return {this}
     */
    movePos(pos) {
        if (pos < 0) pos = 0;
        if (pos > this.value.length) pos = this.value.length;
        this.pos = pos;
        this.trigger('move');
        return this;
    }

    /**
     * Перемещение каретки в начало
     * @return {this}
     */
    moveStart() {
        return this.movePos(0);
    }

    /**
     * Перемещение каретки в конец
     * @return {this}
     */
    moveEnd() {
        return this.movePos(this.value.length);
    }

    /**
     * Перемещение каретки вправо
     * @param {Number} Количество символов
     * @return {this}
     */
    moveForward(length = 1) {
        return this.movePos(this.pos + length);
    }

    /**
     * Перемещение каретки влево
     * @param {Number} Количество символов
     * @return {this}
     */
    moveBackward(length = 1) {
        return this.movePos(this.pos - length);
    }

    /**
     * Перемещение каретки вправо на слово
     * @return {this}
     */
    moveForwardWord() {
        return this.movePos(this.getForwardWordPosition());
    }

    /**
     * Перемещение каретки влево на слово
     * @return {this}
     */
    moveBackwardWord() {
        return this.movePos(this.getBackwardWordPosition());
    }

    /**
     * Возвращает позицию на слово вправо относительно позиции каретки
     * @return {Number}
     */
    getForwardWordPosition() {
        //Разделяем на массив слова по регулярке и перебираем
        let words = this.value.matchAll(/([^\wа-яА-Я][\wа-яА-Я])/g);
        for (let word of words) {
            let index = word.index + 1;
            //Если текущая позиция стала меньше, то мы нашли позицию следующего слова
            if (this.pos < index) {
                return index;
            }
        }
        return this.value.length;
    }

    /**
     * Возвращает позицию на слово влево относительно позиции каретки
     * @return {Number}
     */
    getBackwardWordPosition() {
        //Разделяем на массив слова по регулярке и перебираем
        let words = this.value.matchAll(/([^\wа-яА-Я][\wа-яА-Я])/g);
        //Храним данные предыдущей итерации
        let prev = null;
        let prevIndex = 0;
        for (let word of words) {
            let index = word.index + 1;
            //Если текущая позиция стала меньше или равна, то мы находимся в позиции текущего или след. слова
            if (this.pos <= index) {
                //Соответственно возвращаем позицию при предыдущей итерации
                if (prev) return prevIndex;
                else return 0;
            }
            prev = word;
            prevIndex = word.index + 1;
        }
        if (prev) return prevIndex;
        else return 0;
    }

}