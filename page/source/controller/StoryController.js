/**
 * Класс для работы с историей
 */
class StoryController {

    //DOM элемент для контейнера с историей
    static parent;
    //Массив объектов Story
    static items = [];
    //Флаг отметки обновления
    static updated = false;
    //Слой шаблона
    static layer;
    //Указатель активной команды для перемещения по истории
    static selected = 0;
    //Флаг отметки старта перемещения по истории
    static isStart = false;

    /**
     * Установка родительского элемента, в котором будет отображаться список использованных команд
     * @param {Element} parent Элемент
     */
    static setBox(parent) {
        this.parent = parent;
    }

    /**
     * Загружаем историю
     */
    static loadItems() {
        return new Promise((resolve, reject) => {
            //Получаем список из background
            MessageController.getStory()
                .then(data => {
                    if (data?.story instanceof Array) {
                        //Добавляем в поле объекты Story
                        this.items = [];
                        data.story.forEach(item => {
                            this.items.push(new Story(item));
                        });
                        //Перемещаем указатель вниз
                        this.selected = this.items.length;
                        resolve();
                    } else reject();
                })
                .catch(reject);
        });
    }

    /**
     * Загрузка
     */
    static load() {
        //Если уже был обновлен, то сдвигаемся скролл вниз
        if (this.updated) {
            this.gotoEnd();
            return;
        }
        this.updated = true;
        //Загружаем историю
        this.loadItems()
            .then(() => {
                //Отображаем контейнер с историей
                this.display();
            })
            .catch(() => {
                this.updated = false;
            });
    }

    /**
     * Добавление инструмента в историю
     * @param {Tool} tool Инструмент
     */
    static add(tool) {
        if (!(tool instanceof Tool)) return false;
        try {
            //Создаем объект, добавляем в список, изменяем указатель
            let item = new Story({
                id: tool.getID(),
                name: tool.name,
                categories: (tool.categories instanceof Array ? [...tool.categories] : tool.categories)
            });
            this.items.push(item);
            this.selected = this.items.length;
            //Если слой существует, иначе полностью отображаем историю
            if (this.layer) {
                //Добавляем в слой шаблон элемента истории и сдвигаем скролл
                this.layer.append([item.getLayerData()]);
                this.gotoEnd();
            } else this.display();
        } catch(e) {
            console.error(e);
        }
    }

    /**
     * Сдвигание скролла вниз
     */
    static gotoEnd() {
        if (!this.layer) return;
        //Находим последний элемент и сдвигаем
        let hidden = this.layer.getLastElement();
        hidden?.scrollIntoView();
    }

    /**
     * Изменяем флаг старта перемещения
     * @param {Boolean} disable Остановить?
     * @return {StoryController}
     */
    static started(disable = false) {
        this.isStart = !disable;
        return this;
    }

    /**
     * Возвращает true, если начато перемещение по истории
     * @return {Boolean}
     */
    static isStarted() {
        return this.isStart;
    }

    /**
     * Сброс указателя вниз, после последней команды
     */
    static reset() {
        this.selected = this.items.length;
    }

    /**
     * Перемещение по истории
     * @param {Boolean} up Перемещаем вверх
     * @return {String} Заголовок команды, на который перемещен
     */
    static moveSelect(up = false) {
        this.started();
        if (up) this.selected--;
        else this.selected++;
        if (this.selected < 0) this.selected = 0;
        if (this.selected > this.items.length) this.selected = this.items.length;
        if (this.selected == this.items.length) return '';
        return this.items[this.selected]?.name || '';
    }

    /**
     * Отображение истории в родительском контейнере
     */
    static display() {
        if (!this.parent) return false;
        if (this.items.length) {
            //Собираем список шаблонов для слоя
            let data = [];
            this.items.forEach(item => {
                data.push(item.getLayerData())
            });
            try {
                //Создаем слой, отображаем и сдвигаем скролл вниз
                this.layer = new Layer(data, this.parent);
                this.layer.create().view();
                this.gotoEnd();
            } catch (e) {
                console.error(e);
            }
        }
    }

}