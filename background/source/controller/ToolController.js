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

    static getByID(id) {
        let index = this.getIndexByID(id);
        if (index === false) return null;
        return this.items[index];
    }

    static search(keywords) {
        if (keywords == 'all') return this.getAll();
        let items = this.items.reduce((prev, tool) => {
            if (tool.isIncludes(keywords)) return prev.concat(tool.getContentObject());
            return prev;
        }, []);
        return items.sort((a, b) => b.priority - a.priority);
    }

    static getAll() {
        return this.items.map(tool => {
            return tool.getContentObject();
        });
    }

}

export default ToolController