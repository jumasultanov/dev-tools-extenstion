/**
 * Класс для работы с вызовами методов
 */
class Action {

    static methods = {
        custom: null, //Для кастомных событий 
        background: [MessageController, 'send'], //Отправляем событие в бэк
        commander: [CommanderController, 'open'], //Открываем коммандер
        window: [WindowController, 'open'] //Открываем менеджер окон,
    }

    //Название метода действия
    method;
    //Аргументы для вызова
    args;
    //Если метод custom, то формат данных вызова другой
    //Другой формат
    custom;
    
    constructor(method, args, custom = null) {
        if (!method in Action.methods) throw new ActionException(ActionException.METHOD_NOT_EXIST);
        this.method = method;
        this.args = args || [];
        this.custom = custom;
    }

    /**
     * Вызов метода по параметрам
     */
    run() {
        //Ищем метод из списка
        let item = Action.methods[this.method];
        try {
            //Если найден, то вызываем по 1-му формату, иначе по 2-му
            if (item) {
                item[0][item[1]].apply(item[0], this.args);
            } else {
                this.custom[0].apply(this.custom[1] || null, this.args);
            }
        } catch (e) {
            //Формируем исключение и доп. инфо для нее
            let methodCall = `${this.method}: `;
            if (item) methodCall += `[${item[0].name}, ${item[1]}]`;
            else methodCall += `${this.custom[1].name?this.custom[1].name+'.':''}${this.custom[0].name}`;
            throw new ActionException(ActionException.METHOD_CALL_ERROR, methodCall);
        }
    }

    /**
     * Создание объекта по другому формату
     * @param {Array} data [
     *      Function method,
     *      Object|Function context,
     *      Array args
     * ] Входные данные по вызову
     * @return {Action}
     */
    static newCustom(data) {
        return new Action('custom', data[2], data.slice(0, 2));
    }

}