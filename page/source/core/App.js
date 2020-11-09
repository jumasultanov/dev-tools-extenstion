class App {

    static obj;

    constructor() {
        KeyController.connect();
        MessageController.connect();
        MessageController.getControlData()
            .then(data => {
                console.log(data);
                if (data.keys) KeyController.setActionKeys(data.keys);
            });
    }

    static getInstance() {
        if (!this.obj) this.obj = new this();
        return this.obj;
    }

}