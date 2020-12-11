import ServiceController from '../controller/ServiceController.js';
import ContentController from '../controller/ContentController.js';
import PopupController from '../controller/PopupController.js';

class App {

    static obj;

    user;
    keys;

    constructor() {
        
    }

    init() {
        ServiceController.connect()
            .then(() => {

            })
            .catch(err => {
                console.error(err.get());
            });
        ContentController.connect();
        PopupController.connect();
    }

    static getInstance() {
        if (!this.obj) this.obj = new this();
        return this.obj;
    }

}

export default App