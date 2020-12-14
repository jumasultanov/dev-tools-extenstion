/**
 * Класс для работы со списком инструментов
 */
class ToolController {

    //Массив объектов Tool
    static items = [];
    //Родительский контейнер с инструментами
    static parent = null;
    //Слой шаблона
    static layer;
    //Флаг отображения списка
    static isViewed = false;
    //Указатель выбранного инструмента
    static selectIndex = 0;

    /**
     * Установка родительского элемента, в котором будет отображаться список инструментов
     * @param {Element} parent Элемент
     */
    static setBox(parent) {
        this.parent = parent;
    }

    /**
     * Установка списка инструментов
     * @param {Array} items Массив объектов с параметрами инструмента
     * @return {ToolController}
     */
    static set(items) {
        this.items = [];
        if (items?.length) {
            items.forEach(item => {
                if (!item.id) return;
                this.items.push(new Tool(item));
            });
        }
        return this;
    }

    /**
     * Поиск инструмента по строке
     * @param {String} str Строка поиска
     */
    static startSearch(str) {
        //Если 2 символа и больше
        if (str?.length > 1) {
            //Получаем список инструментов по строке
            MessageController.getListTools(str)
                .then(data => {
                    //Выводим, полученный список
                    this.set(data?.tools).display();
                    this.autoSelect();
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            //Останавливаем поиск
            this.stopSearch();
        }
    }

    /**
     * Остановка поиска
     */
    static stopSearch() {
        this.set([]).display();
    }

    /**
     * Изменяем указатель, выбранного инструмента на первый
     */
    static autoSelect() {
        if (!this.layer) return false;
        this.selectIndex = 0;
        this.moveSelect(0);
    }

    /**
     * Убираем вид активного пункта по указателю
     */
    static unSelect() {
        let item = this.layer.items[this.selectIndex];
        //Убираем класс у элемента списка по указателю, если он существует
        item?.block.get().classList.remove('selected');
    }

    /**
     * Перемещение по списку
     * @param {Boolean} up Вверх
     */
    static moveSelect(up = false) {
        //Определяем новый индекс по перемещению
        let index = 0;
        if (typeof up == 'boolean') {
            if (up) index = this.selectIndex - 1;
            else index = this.selectIndex + 1;
        } else {
            up = +up;
            if (isNaN(up)) return false;
            index = up;
        }
        //Блокируем уход за границы
        if (index < 0) index = this.items.length - 1;
        if (index >= this.items.length) index = 0;
        //Убираем старую активность
        this.unSelect();
        //Изменяем указатель и активность
        this.selectIndex = index;
        let item = this.layer.items[index];
        item.block.get().classList.add('selected');
    }

    /**
     * Возвращает инструмент по выбранному указателю
     * @return {Tool|null}
     */
    static getSelected() {
        return this.items[this.selectIndex] || null;
    }

    /**
     * Запуск активного инструмента
     * @return {Promise}
     */
    static runSelected() {
        return new Promise((resolve, reject) => {
            if (this.isView()) {
                //Получаем активный и делаем запрос на запуск инструмента по его ИД
                let item = this.getSelected();
                this.selectIndex = 0;
                MessageController.toolExec(item.getID())
                    .then(resolve)
                    .catch(reject);
            } else {
                reject();
            }
        });
    }

    /**
     * Возвращает флаг отображения списка
     * @return {Boolean}
     */
    static isView() {
        return this.isViewed;
    }

    /**
     * Отображение списка инструментов в родительском окне
     */
    static display() {
        if (!this.parent) return false;
        this.isViewed = false;
        //Если уже есть слой, то его деактивируем
        if (this.layer) {
            this.layer.hide().destroy();
            this.layer = null;
        } else this.parent.innerHTML = '';
        if (this.items.length) {
            //Собираем список шаблонов для слоя
            let data = [];
            this.items.forEach(item => {
                data.push(item.getElementSearch())
            });
            try {
                //Создаем слой и отображаем
                this.layer = new Layer(data, this.parent);
                this.layer.create().view();
                this.isViewed = true;
            } catch (e) {
                console.error(e);
            }
        }
    }

}