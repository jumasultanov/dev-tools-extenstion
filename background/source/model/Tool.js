/**
 * Класс для работы с элементом инструмент
 */
class Tool {

    //Приоритеты полей при поиске подстроки
    static priorities = {
        name: 10000,
        label: 100,
        categories: 10
    };
    //Данные инструмента
    id; name; label; categories; source; icon;
    //Заполняемые данные после поиска
    searched = {};
    priority;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.label = data.label;
        this.categories = data.categories;
        this.source = data.source;
        this.icon = data.icon;
    }

    /**
     * Возвращает ID
     * @return {Number}
     */
    getID() {
        return this.id;
    }

    /**
     * Входение (Поиск) ключевых слов в значения полей инструмента
     * @param {String} keywords Ключевые слова
     * @return {Boolean} true, если найдено вхождение
     */
    isIncludes(keywords) {
        //При поиске будет заполняться
        this.priority = 0;
        this.searched = {
            name: [],
            label: [],
            categories: []
        };
        //Делим и ищем по каждому полю
        //Значения добавляемого приоритета для каждого поля свой (начальные значения лежат в статическом поле)
        keywords = keywords.split(' ');
        keywords.forEach(word => {
            if (word.length < 2) return;
            let namePriority = this.getIncInText(this.name, word, this.searched.name);
            if (namePriority > 0) namePriority += Tool.priorities.name;
            let labelPriority = this.getIncInText(this.label, word, this.searched.label);
            if (labelPriority > 0) labelPriority += Tool.priorities.label;
            let categoryPriority = this.getIncInText(this.categories, word, this.searched.categories);
            if (categoryPriority > 0) categoryPriority += Tool.priorities.categories;
            this.priority += namePriority + labelPriority + categoryPriority;
        });
        //Сортируем по индексам вхождении
        let sortNum = (a, b) => a[0] - b[0];
        for (let k in this.searched) this.searched[k].sort(sortNum);
        return this.priority > 0;
    }

    /**
     * Возвращает приоритет вхождения в строке
     * @param {String|Array} text Строка или массив строк
     * @param {String} word Искомая подстрока
     * @param {Array|null} searched Заполняемый массив индексов вхождении
     * @return {Number}
     */
    getIncInText(text, word, searched = null) {
        //Ставим влаг для указания доп. параметра индекса и разбиваем строку, если не массив
        let isArrayIndex = true;
        if (typeof text == 'string') {
            text = text.split(' ');
            isArrayIndex = false;
        }
        if (!(text instanceof Array)) return 0;
        //Ищем по одному формату, регистронезависимый поиск
        word = word.toLowerCase();
        let offset = 0;
        return text.reduce((prev, item, index) => {
            let sum = prev;
            let inc = null;
            item = item.toLowerCase();
            //Полное совпадение +5 к приоритету
            if (item == word) {
                sum += 5;
                if (isArrayIndex) inc = [0, word.length, index];
                else inc = [offset, word.length];
            } else {
                //Частичное совпадение +1 к приоритету
                let pos = item.indexOf(word);
                if (pos > -1) {
                    sum += 1;
                    if (isArrayIndex) inc = [pos, word.length, index];
                    else inc = [offset + pos, word.length];
                }
            }
            //Записываем данные вхождения
            if (inc && searched instanceof Array) {
                this.includeDiap(searched, inc);
            }
            //Сдвигаем отступ для коррекции позиции относительно всего текста (только если в начале передали текст)
            offset += item.length + 1;
            return sum;
        }, 0);
    }

    /**
     * Добавление данных вхождения в общий список с учетом перезаписи
     * @param {Array} list Общий список
     * @param {Array} add Добавляемое вхождение
     */
    includeDiap(list, add) {
        /**
         * TODO:
         *  не учтен вариант, когда добавляемый может объединить более одного элемента
         *  например: list = [0, 3], [6, 9]
         *  а добавляемый [2, 5]
         */
        if (list?.length) {
            //Перебираем список
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                //Если с 3-м значением и другой индекса, то пропускаем
                if (add[2] >= 0 && add[2] !== item[2]) continue;
                //Ищем новый диапазон, если есть покрытие
                let replace = this.getNewDiapIfInclude(
                    [item[0], item[0] + item[1] - 1],
                    [add[0], add[0] + add[1] - 1]
                );
                //Если есть, то расширяем имеющийся
                if (replace) {
                    list[i][0] = replace[0];
                    list[i][1] = replace[1] - replace[0] + 1;
                    return false;
                }
            }
        }
        //Если не расширили имеющийся, то добавляем
        list.push(add);
    }

    /**
     * Возвращает массив чисел (диапазон), если найдено покрытие 2-х диапазонов
     * @param {Number[]} diap1 Диапазон чисел 1
     * @param {Number[]} diap2 Диапазон чисел 2
     * @return {Number[]|false}
     */
    getNewDiapIfInclude(diap1, diap2) {
        if (diap1[0] >= diap2[0]) {
            //Если диапазоны не пересекаются
            if (diap2[1] + 1 < diap1[0]) return false;
            //Берем максимальную границу
            let max = diap1[1];
            if (diap2[1] > max) max = diap2[1];
            return [diap2[0], max];
        } else {
            //Если диапазоны не пересекаются
            if (diap1[1] < diap2[0] - 1) return false;
            //Берем максимальную границу
            let max = diap1[1];
            if (diap2[1] > max) max = diap2[1];
            return [diap1[0], max];
        }
    }

    /**
     * Возвращает объект с данными инструмента для страницы
     * @return {Object}
     */
    getContentObject() {
        return {
            id: this.id,
            name: this.name,
            label: this.label,
            categories: this.categories,
            icon: this.icon,
            searched: this.searched,
            priority: this.priority
        }
    }

    /**
     * Возвращает массив с данными для менеджера окон
     * @return {Array}
     */
    getExecArgs() {
        return [
            this.name, this.source
        ]
    }

}

export default Tool