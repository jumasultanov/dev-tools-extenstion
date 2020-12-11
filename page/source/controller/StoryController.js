class StoryController {

    static parent;
    static items = [];
    static updated = false;
    static layer;
    static selected = 0;

    static setBox(parent) {
        this.parent = parent;
    }

    static loadItems() {
        return new Promise((resolve, reject) => {
            MessageController.getStory()
                .then(data => {
                    if (data?.story instanceof Array) {
                        this.items = [];
                        data.story.forEach(item => {
                            this.items.push(new Story(item));
                        });
                        this.selected = this.items.length;
                        resolve();
                    } else reject();
                })
                .catch(reject);
        });
    }

    static load() {
        if (this.updated) {
            this.gotoEnd();
            return;
        }
        this.updated = true;
        this.loadItems()
            .then(() => {
                this.display();
            })
            .catch(() => {
                this.updated = false;
            });
    }

    static add(tool) {
        if (!(tool instanceof Tool)) return false;
        try {
            let item = new Story({
                id: tool.getID(),
                name: tool.name,
                categories: (tool.categories instanceof Array ? [...tool.categories] : tool.categories)
            });
            this.items.push(item);
            this.selected = this.items.length;
            if (this.layer) {
                this.layer.append([item.getLayerData()]);
                this.gotoEnd();
            } else this.display();
        } catch(e) {
            console.error(e);
        }
    }

    static gotoEnd() {
        if (!this.layer) return;
        let hidden = this.layer.getLastElement();
        console.log(hidden);
        hidden?.scrollIntoView();
    }

    static started(disable = false) {
        this.isStart = !disable;
        return this;
    }

    static isStarted() {
        return this.isStart;
    }

    static reset() {
        this.selected = this.items.length;
    }

    static moveSelect(up = false) {
        this.started();
        if (up) this.selected--;
        else this.selected++;
        if (this.selected < 0) this.selected = 0;
        if (this.selected > this.items.length) this.selected = this.items.length;
        if (this.selected == this.items.length) return '';
        return this.items[this.selected]?.name || '';
    }

    static display() {
        if (!this.parent) return false;
        if (this.items.length) {
            let data = [];
            this.items.forEach(item => {
                data.push(item.getLayerData())
            });
            try {
                this.layer = new Layer(data, this.parent);
                this.layer.create().view();
                this.gotoEnd();
            } catch (e) {
                console.error(e);
            }
        }
    }

}