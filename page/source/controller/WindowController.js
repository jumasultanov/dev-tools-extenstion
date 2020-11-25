class WindowController {

    static layer;
    static inited = false;
    static items = [];
    static selectedIndex = 0;
    static currentPosition = 1;
    static offsetPosition = 30;
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
            if (dataView == this.currentPosition) el.classList.add('activated');
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
        /**
         * TODO:
         */
        console.log(fill);
    }

    static getOrientation(pos) {
        pos = pos || this.currentPosition;
        let [x, y, w, h] = [0, 0, 0, 0];
        let width = this.windowsList.offsetWidth;
        let height = this.windowsList.offsetHeight;
        switch (pos) {
            case 1:
                w = width - 2 * this.offsetPosition;
                h = height - 2 * this.offsetPosition;
                x = this.offsetPosition;
                y = this.offsetPosition;
                break;
            case 2:
                break;
            case 4:
                break;
        }
        return [x, y, w, h];
    }

    static openSetting() {
        /**
         * TODO:
         */
    }

    static openProfile() {
        /**
         * TODO:
         */
    }

    static open(title, src) {
        if (this.inited) {
            if (!this.layer.isView()) this.layerShow();
            this.selectedIndex = this.items.length;
            let [x, y, w, h] = this.getOrientation();
            this.add(title, src).setXY(x, y).setDimension(w, h).show().focus();
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
        if (index > -1) this.items.splice(index, 1);
    }

    static focusedWindowElement(element) {
        if (!this.items.length) return;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === element) continue;
            this.items[i].blur();
        }
    }

    static remove() {
        /**
         * TODO:
         */
    }

    static getIndexElement(element) {
        if (!this.items.length) return -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === element) return i;
        }
        return -1;
    } 
    
}