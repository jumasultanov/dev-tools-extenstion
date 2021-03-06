/**
 * Класс для работы с комбинацями клавиш
 */
class KeyController {

    //Изначальный список, не зависящий от пользовательских дополнении
    static items = [
        {
            code: 81,
            ctrl: true,
            action: {
                method: 'commander'
            }
        }
    ];

    /**
     * Меняем список, включая изначальный
     * @param {Array} items Новый список
     */
    static set(items) {
        if (!(items instanceof Array)) return false;
        let newItems = [];
        items.forEach(item => {
            let index = this.getIndexByMethod(item.action.method);
            if (index===false) newItems.push(item);
            else this.items.splice(index, 1, item);
        });
        this.items = this.items.concat(newItems);
    }

    /**
     * Возвращаем индекс из списка по названию метода
     * @param {String} method Название метода
     * @return {Number|false}
     */
    static getIndexByMethod(method) {
        for (let i in this.items) {
            if (this.items[i].action.method == method) return i;
        }
        return false;
    }

}

export default KeyController