/**
 * Класс для работы объектами, который отвечает за вызов методов по входным параметрам
 */
class ActionController {

    /**
     * Запуск метода по входным данным через объект Action
     * @param {Object} data {
     *      method: String,
     *      args: Array
     * } Входные данные для вызова метода
     */
    static activation(data) {
        try {
            let action = new Action(data.method, data.args);
            action.run();
        } catch (e) {
            console.error(e.get());
        }
    }

    /**
     * Запуск метода по входным данным через объект Action через другой формат данных
     * @param {Array} data [
     *      Function method,
     *      Object|Function context,
     *      Array args
     * ] Входные данные для вызова метода
     */
    static apply(data) {
        try {
            Action.newCustom(data).run();
        } catch (e) {
            console.error(e.get());
        }
    }

}