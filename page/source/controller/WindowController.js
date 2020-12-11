class WindowController {

    static layer;
    static inited = false;
    static items = [];
    static selectedIndex = 0;
    static currentPosition = -1;
    static offsetPosition = 20;
    static reservePositions = [];

    static styles = [
        "page/css/window.css"
    ];

    static setElements() {
        let box = this.layer.getElement('.dev-tools-windows');
        this.fade = box.querySelector('.background-layer');
        this.control = box.querySelector('.windows-control-layer');
        this.tray = box.querySelector('.windows-tray-layer');
        this.windowsList = box.querySelector('.windows-view-container');
        WindowElement.setParent(this.windowsList);
        TrayElement.setParent(this.tray);
        //Events
        //Close
        this.close = box.querySelector('.windows-control-layer .control-close');
        this.close?.addEventListener('click', ev => {
            this.layerHide();
        });
        //Profile
        this.profile = box.querySelector('.windows-control-layer .control-profile');
        this.profile?.addEventListener('click', ev => {
            this.openProfile();
        });
        //Settings
        this.setting = box.querySelector('.windows-control-layer .control-setting');
        this.setting?.addEventListener('click', ev => {
            this.openSetting();
        });
        //View positions
        this.viewPos = box.querySelectorAll('.windows-control-layer .control-view-option');
        this.viewPos?.forEach(el => {
            let dataView = +el.getAttribute('dataView');
            el.addEventListener('click', ev => {
                this.updatePositions(dataView);
            });
        })
    }

    static init() {
        return new Promise((resolve, reject) => {
            this.createLayer()
                .then(() => {
                    this.addStyles()
                        .then(() => {
                            this.inited = true;
                            this.setElements();
                            resolve();
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    static addStyles() {
        let addedStylesCount = 0;
        let counter = resolve => {
            addedStylesCount++;
            if (this.styles.length == addedStylesCount) resolve();
        }
        return new Promise((resolve, reject) => {
            if (this.styles?.length) {
                this.styles.forEach(href => {
                    let style = chrome.extension.getURL(href);
                    try {
                        let link = new Block('element', 'link', {
                            rel: 'stylesheet',
                            type: 'text/css',
                            href: style
                        });
                        document.head.appendChild(link.create().get());
                        link.get().onload = () => counter(resolve);
                        link.get().onerror = () => counter(resolve);
                    } catch(err) {
                        reject(err);
                    }
                });
            } else resolve();
        });
    }

    static createLayer() {
        return new Promise((resolve, reject) => {
            MessageController.getWindowLayer()
                .then(data => {
                    if (data.layer) {
                        try {
                            this.layer = new Layer(data.layer);
                            this.layer.create();
                            resolve();
                        } catch (e) {
                            console.error(e);
                            reject();
                        }
                    } else reject();
                })
                .catch(reject);
        });
    }

    static layerShow() {
        this.layer.view();
        setTimeout(() => {
            this.fade.classList.add('layer-show');
            setTimeout(() => {
                this.control.classList.add('layer-show');
                this.tray.classList.add('layer-show');
            }, 100);
        }, 50);
    }

    static layerHide() {
        this.fade.addEventListener("transitionend", () => {
            this.layer.hide();
        }, { once: true });
        this.fade.classList.remove('layer-show');
        this.control.classList.remove('layer-show');
        this.tray.classList.remove('layer-show');
    }

    static updatePositions(fill) {
        this.currentPosition = fill;
        if (!this.items.length) return;
        let selected = this.getPositionsItems();
        selected?.forEach((index, key) => {
            let [x, y, w, h] = this.getOrientation(fill, key);
            this.items[index].setXY(x, y).setDimension(w, h).showFromMinimize();
        });
        this.items.forEach((item, key) => {
            if (selected.indexOf(key) < 0 && item.isView()) {
                item.minimize();
            }
        });
        this.viewPos?.forEach(el => {
            let dataView = +el.getAttribute('dataView');
            if (dataView == fill) el.classList.add('activated');
            else el.classList.remove('activated');
        })
    }

    static getPositionsItems() {
        if (this.selectedIndex < 0) return null;
        if (!this.items.length) return null;
        let selected = [];
        let checkIndex = this.selectedIndex;
        let back = false;
        while (selected.length < this.currentPosition) {
            if (checkIndex in this.items) {
                let item = this.items[checkIndex];
                if (item.isView()) {
                    selected.push(checkIndex);
                }
            }
            if (checkIndex >= this.items.length - 1) {
                back = true;
                checkIndex = this.selectedIndex;
            }
            if (back) {
                checkIndex--;
                if (checkIndex < 0) break;
            } else checkIndex++;
        }
        return selected;
    }

    static getOrientation(pos, key = 0) {
        pos = pos || this.currentPosition;
        let [x, y, w, h] = [0, 0, 0, 0];
        let width = this.windowsList.offsetWidth;
        let height = this.windowsList.offsetHeight;
        switch (pos) {
            case -1:
            case 1:
                w = width - 2 * this.offsetPosition;
                h = height - 2 * this.offsetPosition;
                x = this.offsetPosition;
                y = this.offsetPosition;
                break;
            case 2:
                w = (width - 3 * this.offsetPosition)/2;
                h = height - 2 * this.offsetPosition;
                x = this.offsetPosition + (key%2)*(w + this.offsetPosition);
                y = this.offsetPosition;
                break;
            case 4:
                w = (width - 3 * this.offsetPosition)/2;
                h = (height - 3 * this.offsetPosition)/2;
                x = this.offsetPosition + (key%2)*(w + this.offsetPosition);
                y = this.offsetPosition + Math.floor(key/2)*(h + this.offsetPosition);
                break;
        }
        return [x, y, w, h];
    }

    static openSetting() {
        /**
         * TODO:
         */
        alert('В разработке');
    }

    static openProfile() {
        /**
         * TODO:
         */
        alert('В разработке');
    }

    static open(title, src) {
        if (this.inited) {
            if (!this.layer.isView()) this.layerShow();
            let index = this.getIndexElementByTitle(title);
            let element = null;
            if (index === null) {
                this.selectedIndex = this.items.length;
                let [x, y, w, h] = this.getOrientation(1);
                element = this.add(title, src).setXY(x, y).setDimension(w, h);
            } else {
                this.selectedIndex = index;
                element = this.items[index];
            }
            element.show().focus();
        } else {
            this.init()
                .then(() => {
                    this.open(title, src);
                });
        }
    }

    static add(title, src) {
        let element = new WindowElement(title, src);
        element.onClose(el => this.closedWindowElement(el));
        element.onFocus(el => this.focusedWindowElement(el));
        this.items.push(element);
        return element;
    }

    static closedWindowElement(element) {
        let index = this.getIndexElement(element);
        if (index > -1) {
            this.items.splice(index, 1);
            let nextIndex = -1;
            if (index in this.items) nextIndex = index;
            else if (index > 0) nextIndex = index - 1;
            if (nextIndex > -1) this.items[nextIndex].focus();
            else this.selectedIndex = -1;
        }
    }

    static focusedWindowElement(element) {
        if (!this.items.length) return;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === element) {
                this.selectedIndex = i;
                continue;
            }
            this.items[i].blur();
        }
    }

    static getIndexElement(element) {
        if (!this.items.length) return -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === element) return i;
        }
        return -1;
    } 

    static getIndexElementByTitle(title) {
        if (!this.items.length) return null;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].getTitle() === title) return i;
        }
        return null;
    }
    
}