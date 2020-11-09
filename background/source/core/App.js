import ServiceController from '../controller/ServiceController.js';
import ContentController from '../controller/ContentController.js';
import PopupController from '../controller/PopupController.js';

class App {

    static obj;

    user;
    keys;

    constructor() {
        /**
         * TODO:
         */
    }

    init() {
        /**
         * TODO:
         *  start service
         */
        ServiceController.connect();
        ContentController.connect();
        PopupController.connect();
    }

    static getInstance() {
        if (!this.obj) this.obj = new this();
        return this.obj;
    }

}

export default App