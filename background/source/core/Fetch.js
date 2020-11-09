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
                    if (res.status==200) return res.json();
                })
                .then(data => {
                    let err = '';
                    if (data) {
                        if (data.error) err = data.error;
                        else resolve(data);
                    }
                    if (err) reject(err);
                })
                .catch(err => {
                    reject(err.message);
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