/**
 * Класс для работы с инструментом
 */
class Tool {

    //Данные иснтрумента
    id; name; label; icon; categories; searched;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.label = data.label;
        this.icon = data.icon;
        this.categories = data.categories;
        this.searched = data.searched;
    }

    /**
     * Возращает ID
     * @return {Number}
     */
    getID() {
        return this.id;
    }

    /**
     * Возвращает объект шаблона элемента
     * @return {Object}
     */
    getElementSearch() {
        return {
            type: 'element',
            name: 'div',
            attrs: { 
                class: 'cmd-search-item',
                style: this.icon?`background-image:url(${this.icon})`:''
            },
            children: [
                {
                    type: 'element',
                    name: 'div',
                    attrs: { class: 'cmd-search-item-name' },
                    children: this.getSearched('name')
                },
                {
                    type: 'element',
                    name: 'div',
                    attrs: { class: 'cmd-search-item-label' },
                    children: this.getSearched('label')
                },
                {
                    type: 'element',
                    name: 'div',
                    attrs: { class: 'cmd-search-item-category' },
                    children: this.categories.map((item, index) => {
                        return {
                            type: 'element',
                            name: 'div',
                            attrs: { class: 'cmd-category-tag' },
                            children: this.getSearchedCategory(item, index)
                        }
                    })
                }
            ]
        }
    }

    /**
     * Возвращает 
     * @param {*} text 
     * @param {*} key 
     */
    getSearchedCategory(text, key) {
        return this.getSearched('categories', text, key);
    }

    /**
     * Возвращаает массив частей шаблона с подстроками после результатов поиска в полях объекта
     * @param {*} property Название свойства
     * @param {*} text Альтернативаное значение свойства
     * @param {*} key Игнорируемый ключ в массиве значении поиска
     * @return {Array}
     */
    getSearched(property, text = '', key = false) {
        let result = [];
        //Берем альтенативное значение или значение поля
        text = text || this[property];
        if (this.searched?.[property]?.length) {
            let offset = 0;
            //Перебираем результат поиска подстрок
            this.searched[property].forEach(item => {
                //Игнорируем ключ в результате поиска, если был передан
                if (key !== false && item[2] !== key) return;
                //Получаем подстроку из текста по объекту поиска
                let index = item[0] - offset;
                let str = text.substr(index, item[1]);
                let prev = text.slice(0, index);
                //Добавляем часть шаблона в ответ (предыдущий текст, выделенная подстрока)
                result.push({ type: 'text', text: prev });
                result.push({
                    type: 'element',
                    name: 'span',
                    attrs: { class: 'cmd-search-item-found' },
                    children: [{ type: 'text', text: str }]
                });
                //Оставшийся текст уходит в следующую итерацию
                text = text.slice(index + item[1]);
                //Контролируем позицию отступа
                offset = item[0] + item[1];
            });
        }
        result.push({ type: 'text', text });
        return result;
    }

}