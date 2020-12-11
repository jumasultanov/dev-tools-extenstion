import Story from '../model/Story.js';
import Tool from '../model/Tool.js';

class StoryController {

    static items = [];

    static getAll() {
        return this.items;
    }

    static add(tool) {
        if (!(tool instanceof Tool)) return false;
        try {
            let item = new Story(
                tool.getID(),
                tool.name,
                tool.categories
            );
            this.items.push(item);
        }catch(e) {
            console.error(e);
        }
    }

}

export default StoryController