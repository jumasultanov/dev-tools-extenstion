import Tool from '../model/Tool.js';

/**
 * Класс для работы с инструментами
 */
class ToolController {
    
    //Список элементов инструментов {Tool[]}
    static items = [];

    /**
     * Изменение списка
     * @param {Array} items Список инструментов
     */
    static set(items) {
        if (!(items instanceof Array)) return false;
        let newItems = [];
        items.forEach(item => {
            //Если инструмент существует, то старый заменяется
            let index = this.getIndexByID(item.id);
            if (index===false) newItems.push(new Tool(item));
            else this.items.splice(index, 1, item);
        });
        this.items = this.items.concat(newItems);
    }

    /**
     * Возвращает индекс из списка по ИД
     * @param {Number} id ИД инструмента
     * @return {Number|false}
     */
    static getIndexByID(id) {
        for (let i in this.items) {
            if (this.items[i].getID() == id) return i;
        }
        return false;
    }

    /**
     * Возвращает инструмент по его ИД
     * @param {Number} id ИД инструмента
     * @return {Tool|null}
     */
    static getByID(id) {
        let index = this.getIndexByID(id);
        if (index === false) return null;
        return this.items[index];
    }

    /**
     * Поиск инструментов по ключевым словам
     * @param {String} keywords Ключевые слова
     * @return {Array}
     */
    static search(keywords) {
        if (keywords == 'all') return this.getAll();
        let items = this.items.reduce((prev, tool) => {
            if (tool.isIncludes(keywords)) return prev.concat(tool.getContentObject());
            return prev;
        }, []);
        //Сортируем по приоритету вхождении
        return items.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Возвращает весь список инструментов
     * @return {Array}
     */
    static getAll() {
        return this.items.map(tool => {
            return tool.getContentObject();
        });
    }

}

export default ToolController