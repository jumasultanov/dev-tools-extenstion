import Tool from '../model/Tool.js';

class ToolController {
    
    static items = [];

    static set(items) {
        if (!(items instanceof Array)) return false;
        let newItems = [];
        items.forEach(item => {
            let index = this.getIndexByID(item.id);
            if (index===false) newItems.push(new Tool(item));
            else this.items.splice(index, 1, item);
        });
        this.items = this.items.concat(newItems);
    }

    static getIndexByID(id) {
        for (let i in this.items) {
            if (this.items[i].getID() == id) return i;
        }
        return false;
    }

    static search(keywords) {
        return this.items.reduce((prev, tool) => {
            if (tool.isIncludes(keywords)) return prev.concat(tool.getContentObject());
        }, []);
    }

}

export default ToolController