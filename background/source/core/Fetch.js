import FetchException from '../exception/FetchException.js';

/**
 * Класс для работы с запросами
 */
class Fetch {

    //Данные запроса
    url;
    headers;
    method;
    data;

    constructor(url, data = {}, headers = {}) {
        this.url = url;
        this.data = data;
        this.headers = headers;
    }

    /**
     * GET-запрос
     * @return {Promise}
     */
    get() {
        this.method = 'GET';
        return this.run();
    }

    /**
     * POST-запрос
     * @return {Promise}
     */
    post() {
        this.method = 'POST';
        return this.run();
    }

    /**
     * Запрос
     * @return {Promise}
     */
    run() {
        return new Promise((resolve, reject) => {
            //Собираем данные по запросу
            let params = {
                headers: Object.assign({
                    'Extension-Request': true
                }, this.headers),
                method: this.method,
                body: Fetch.objectToFormData(this.data)
            };
            //Делаем fetch-запрос
            fetch(this.url, params)
                .then(res => {
                    //Проверяем данные и статус
                    if (res.status==200) {
                        let contentType = res.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            return res.json();
                        } else {
                            return res.text();
                        }
                    } else throw new FetchException(FetchException.RESPONSE_CODE_ERROR, res.status);
                })
                .then(data => {
                    //Проверяем данные
                    if (typeof data == "string") throw new FetchException(FetchException.RESPONSE_TEXT, data);
                    let err = '';
                    if (data) {
                        if (data.error) err = data.error;
                        else resolve(data);
                    }
                    throw new FetchException(FetchException.RESPONSE_ERROR, err || 'Пустое значение');
                })
                .catch(err => {
                    //Обрабатываем выброшенные исключения
                    if (err instanceof FetchException) reject(err);
                    else reject(new FetchException(FetchException.FAILED));
                });
        });
    }
    
    /**
     * Преобразование объекта в объект FormData
     * @param {Object} obj Объект, который надо преобразовать
     * @param {FormData|undefined} form Объекта формы, в который надо записать
     * @param {String|undefined} namespace Родительское название
     * @return {FormData}
     */
    static objectToFormData(obj, form, namespace) {
        var fd = form || new FormData();
        var formKey;
        for(var property in obj) {
            if(obj.hasOwnProperty(property)) {
                if (namespace) formKey = namespace + '[' + property + ']';
                else formKey = property;
                var append = true;
                if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) append = false;
                if (obj[property] instanceof Array && !obj[property].length) append = true;
                if (append) fd.append(formKey, obj[property]);
                else this.objectToFormData(obj[property], fd, formKey);
            }
        }
        return fd;
    }

}

export default Fetch