class Action {

    static methods = {
        background: [MessageController, 'send'], //Отправляем событие в бэк
        commander: [CommanderController, 'open'], //Открываем коммандер
        window: [WindowController, 'open'] //Открываем менеджер окон
    }

    method;
    args;
    
    constructor(method, args) {
        if (!method in Action.methods) throw new ActionException(ActionException.METHOD_NOT_EXIST);
        this.method = method;
        this.args = args || [];
    }

    run() {
        let item = Action.methods[this.method];
        try {
            item[0][item[1]].apply(item[0], this.args);
        } catch (e) {
            let methodCall = `${this.method}: [${item[0].name}, ${item[1]}]`;
            throw new ActionException(ActionException.METHOD_CALL_ERROR, methodCall);
        }
    }

}