class KeyController {

    static items = [
        {
            code: 81,
            ctrl: true,
            action: {
                method: 'commander'
            }
        }
    ];

    static set(items) {
        if (!(items instanceof Array)) return false;
        let newItems = [];
        items.forEach(item => {
            let index = this.getIndexByMethod(item.action.method);
            if (index===false) newItems.push(item);
            else this.items.splice(index, 1, item);
        });
        this.items = this.items.concat(newItems);
    }

    static getIndexByMethod(method) {
        for (let i in this.items) {
            if (this.items[i].action.method == method) return i;
        }
        return false;
    }

}

export default KeyController