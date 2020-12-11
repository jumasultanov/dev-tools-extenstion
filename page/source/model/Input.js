class Input {

    events = {
        change: {},
        changeKB: {},
        move: {}
    }

    value;
    pos = 0;

    constructor(value = '') {
        this.value = value;
    }

    on(event, name, data) {
        if (!(event in this.events)) return false;
        if (!name) return false;
        if (!(data instanceof Array) || !data.length) return false;
        this.events[event][name] = data;
    }

    off(event, name) {
        if (!(event in this.events)) return false;
        if (!(name in this.events[event])) return false;
        delete this.events[event][name];
    }

    trigger(event) {
        if (!(event in this.events)) return false;
        for (let name in this.events[event]) ActionController.apply(this.events[event][name]);
    }

    set(value, kb = false) {
        this.value = value;
        this.trigger('change');
        if (kb) this.trigger('changeKB');
        return this;
    }

    get() {
        return this.value;
    }

    getPos() {
        return this.pos;
    }

    getPosFromRight() {
        return this.value.length - this.pos;
    }

    clear() {
        this.set('');
        this.movePos(0);
        return this;
    }

    add(value) {
        this.set(this.value.slice(0, this.pos) + value + this.value.slice(this.pos), true);
        this.movePos(this.pos + value.length);
        return this;
    }

    deleteLeft(length = 1) {
        if (this.pos) {
            this.set(this.value.slice(0, this.pos - length) + this.value.slice(this.pos), true);
            this.movePos(this.pos - length);
        }
        return this;
    }

    deleteRight(length = 1) {
        this.set(this.value.slice(0, this.pos) + this.value.slice(this.pos + length), true);
        return this;
    }

    deleteLeftWord() {
        let newPos = this.getBackwardWordPosition();
        return this.deleteLeft(this.pos - newPos);
    }

    deleteRightWord() {
        let newPos = this.getForwardWordPosition();
        return this.deleteRight(newPos - this.pos);
    }

    movePos(pos) {
        if (pos < 0) pos = 0;
        if (pos > this.value.length) pos = this.value.length;
        this.pos = pos;
        this.trigger('move');
        return this;
    }

    moveStart() {
        return this.movePos(0);
    }

    moveEnd() {
        return this.movePos(this.value.length);
    }

    moveForward(length = 1) {
        return this.movePos(this.pos + length);
    }

    moveBackward(length = 1) {
        return this.movePos(this.pos - length);
    }

    moveForwardWord() {
        return this.movePos(this.getForwardWordPosition());
    }

    moveBackwardWord() {
        return this.movePos(this.getBackwardWordPosition());
    }

    getForwardWordPosition() {
        let words = this.value.matchAll(/([^\wа-яА-Я][\wа-яА-Я])/g);
        for (let word of words) {
            let index = word.index + 1;
            if (this.pos < index) {
                return index;
            }
        }
        return this.value.length;
    }

    getBackwardWordPosition() {
        let words = this.value.matchAll(/([^\wа-яА-Я][\wа-яА-Я])/g);
        let prev = null;
        let prevIndex = 0;
        for (let word of words) {
            let index = word.index + 1;
            if (this.pos <= index) {
                if (prev) return prevIndex;
                else return 0;
            }
            prev = word;
            prevIndex = word.index + 1;
        }
        if (prev) return prevIndex;
        else return 0;
    }

}