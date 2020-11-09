class ActionController {

    static activation(data) {
        try {
            let action = new Action(data.method, data.args);
            action.run();
        } catch (e) {
            console.error(e.get());
        }
    }

}