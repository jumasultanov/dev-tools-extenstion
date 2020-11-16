import Exception from '../exception/Exception.js';
import FetchException from '../exception/FetchException.js';

class Fetch {

    url;
    headers;
    method;
    data;

    constructor(url, data = {}, headers = {}) {
        this.url = url;
        this.data = data;
        this.headers = headers;
    }

    get() {
        this.method = 'GET';
        return this.run();
    }

    post() {
        this.method = 'POST';
        return this.run();
    }

    run() {
        return new Promise((resolve, reject) => {
            let params = {
                headers: Object.assign({
                    'Extension-Request': true
                }, this.headers),
                method: this.method,
                body: Fetch.objectToFormData(this.data)
            };
            fetch(this.url, params)
                .then(res => {
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
                    if (typeof data == "string") throw new FetchException(FetchException.RESPONSE_TEXT, data);
                    let err = '';
                    if (data) {
                        if (data.error) err = data.error;
                        else resolve(data);
                    }
                    throw new FetchException(FetchException.RESPONSE_ERROR, err || 'Пустое значение');
                })
                .catch(err => {
                    if (err instanceof FetchException) reject(err);
                    else reject(new FetchException(FetchException.FAILED));
                });
        });
    }
    
    static objectToFormData(obj, form, namespace) {
        var fd = form || new FormData();
        var formKey;
        for(var property in obj) {
            if(obj.hasOwnProperty(property)) {
                if(namespace) formKey = namespace + '[' + property + ']';
                else formKey = property;
                var append = true;
                if(typeof obj[property] === 'object' && !(obj[property] instanceof File)) append = false;
                if (obj[property] instanceof Array && !obj[property].length) append = true;
                if (append) fd.append(formKey, obj[property]);
                else this.objectToFormData(obj[property], fd, formKey);
            }
        }
        return fd;
    }

}

export default Fetch