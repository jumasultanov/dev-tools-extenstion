class ActionController {

    static activation(data) {
        try {
            let action = new Action(data.method, data.args);
            action.run();
        } catch (e) {
            console.error(e.get());
        }
    }

    static apply(data) {
        try {
            Action.newCustom(data).run();
        } catch (e) {
            console.error(e.get());
        }
    }

}