class App {

    static obj;
    serverSuccess = false;

    constructor() {
        this.run();
    }

    run() {
        KeyController.connect();
        MessageController.connect();
        MessageController.getControlData()
            .then(data => {
                if (data.serverSuccess) this.serverSuccess = true;
                if (data.keys) KeyController.setActionKeys(data.keys);
            });
    }

    static getInstance() {
        if (!this.obj) this.obj = new this();
        return this.obj;
    }

}