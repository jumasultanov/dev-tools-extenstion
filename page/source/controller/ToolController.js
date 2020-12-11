class ToolController {

    static items = [];
    static parent = null;
    static layer;
    static isViewed = false;
    static selectIndex = 0;

    static setBox(parent) {
        this.parent = parent;
    }

    static set(items) {
        this.items = [];
        if (items?.length) {
            items.forEach(item => {
                if (!item.id) return;
                this.items.push(new Tool(item));
            });
        }
        return this;
    }

    static startSearch(str) {
        if (str?.length > 1) {
            MessageController.getListTools(str)
                .then(data => {
                    this.set(data?.tools).display();
                    this.autoSelect();
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            this.stopSearch();
        }
    }

    static stopSearch() {
        this.set([]).display();
    }

    static autoSelect() {
        if (!this.layer) return false;
        this.selectIndex = 0;
        this.moveSelect(0);
    }

    static unSelect() {
        let item = this.layer.items[this.selectIndex];
        item?.block.get().classList.remove('selected');
    }

    static moveSelect(up = false) {
        let index = 0;
        if (typeof up == 'boolean') {
            if (up) index = this.selectIndex - 1;
            else index = this.selectIndex + 1;
        } else {
            up = +up;
            if (isNaN(up)) return false;
            index = up;
        }
        if (index < 0) index = this.items.length - 1;
        if (index >= this.items.length) index = 0;
        this.unSelect();
        this.selectIndex = index;
        let item = this.layer.items[index];
        item.block.get().classList.add('selected');
    }

    static getSelected() {
        return this.items[this.selectIndex] || null;
    }

    static runSelected() {
        return new Promise((resolve, reject) => {
            if (this.isView()) {
                let item = this.getSelected();
                this.selectIndex = 0;
                MessageController.toolExec(item.getID())
                    .then(resolve)
                    .catch(reject);
            } else {
                reject();
            }
        });
    }

    static isView() {
        return this.isViewed;
    }

    static display() {
        if (!this.parent) return false;
        this.isViewed = false;
        if (this.layer) {
            this.layer.hide().destroy();
            this.layer = null;
        } else this.parent.innerHTML = '';
        if (this.items.length) {
            let data = [];
            this.items.forEach(item => {
                data.push(item.getElementSearch())
            });
            try {
                this.layer = new Layer(data, this.parent);
                this.layer.create().view();
                this.isViewed = true;
            } catch (e) {
                console.error(e);
            }
        }
    }

}