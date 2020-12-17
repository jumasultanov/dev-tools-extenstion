/**
 * Класс для работы с элементом истории
 */
class Story {

    //Данные
    id; name; categories;

    constructor(id, name, categories) {
        this.id = id;
        this.name = name;
        this.categories = (categories instanceof Array ? [...categories] : categories);
    }

}

export default Story