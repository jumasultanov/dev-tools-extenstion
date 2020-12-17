import Story from '../model/Story.js';
import Tool from '../model/Tool.js';

/**
 * Класс для работы с историями
 */
class StoryController {

    //Список элементов истории {Story[]}
    static items = [];

    /**
     * Возвращает список
     * @return {Story[]}
     */
    static getAll() {
        return this.items;
    }

    /**
     * Добавление элемента в историю
     * @param {Tool} tool Объект инструмента
     */
    static add(tool) {
        if (!(tool instanceof Tool)) return false;
        try {
            let item = new Story(
                tool.getID(),
                tool.name,
                tool.categories
            );
            this.items.push(item);
        }catch(e) {
            console.error(e);
        }
    }

}

export default StoryController