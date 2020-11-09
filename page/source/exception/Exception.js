class Exception {

    static ARG_FORMAT = 1;

    type;
    keyword;
    
    constructor(type, keyword = '') {
        this.type = type;
        this.keyword = keyword;
    }

    get() {
        var str = this.getTypeString();
        if (this.keyword) {
            str += ` (${this.keyword})`;
        }
        return str;
    }

    getTypeString() {
        switch (this.type) {
            case Exception.ARG_FORMAT: return 'Аргумент не соответствует типу';
        }
        return '';
    }

    has(type) {
        return this.type==type;
    }

}