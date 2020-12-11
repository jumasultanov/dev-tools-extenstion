class Tool {

    static priorities = {
        name: 10000,
        label: 100,
        categories: 10
    };

    id; name; label; categories; source; icon;
    searched = {};
    priority;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.label = data.label;
        this.categories = data.categories;
        this.source = data.source;
        this.icon = data.icon;
    }

    getID() {
        return this.id;
    }

    isIncludes(keywords) {
        this.priority = 0;
        this.searched = {
            name: [],
            label: [],
            categories: []
        };
        keywords = keywords.split(' ');
        keywords.forEach(word => {
            if (word.length < 2) return;
            let namePriority = this.getIncInText(this.name, word, this.searched.name);
            if (namePriority > 0) namePriority += Tool.priorities.name;
            let labelPriority = this.getIncInText(this.label, word, this.searched.label);
            if (labelPriority > 0) labelPriority += Tool.priorities.label;
            let categoryPriority = this.getIncInText(this.categories, word, this.searched.categories);
            if (categoryPriority > 0) categoryPriority += Tool.priorities.categories;
            this.priority += namePriority + labelPriority + categoryPriority;
        });
        let sortNum = (a, b) => a[0] - b[0];
        for (let k in this.searched) this.searched[k].sort(sortNum);
        return this.priority > 0;
    }

    getIncInText(text, word, searched = null) {
        let isArrayIndex = true;
        if (typeof text == 'string') {
            text = text.split(' ');
            isArrayIndex = false;
        }
        if (!(text instanceof Array)) return 0;
        word = word.toLowerCase();
        let offset = 0;
        return text.reduce((prev, item, index) => {
            let sum = prev;
            let inc = null;
            item = item.toLowerCase();
            if (item == word) {
                sum += 5;
                if (isArrayIndex) inc = [0, word.length, index];
                else inc = [offset, word.length];
            } else {
                let pos = item.indexOf(word);
                if (pos > -1) {
                    sum += 1;
                    if (isArrayIndex) inc = [pos, word.length, index];
                    else inc = [offset + pos, word.length];
                }
            }
            if (inc && searched instanceof Array) {
                this.includeDiap(searched, inc);
            }
            offset += item.length + 1;
            return sum;
        }, 0);
    }

    includeDiap(list, add) {
        /**
         * TODO:
         *  не учтен вариант, когда добавляемый может объединить более одного элемента
         *  например: list = [0, 3], [6, 9]
         *  а добавляемый [2, 5]
         */
        if (list?.length) {
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                if (add[2] >= 0 && add[2] !== item[2]) continue;
                let replace = this.getNewDiapIfInclude(
                    [item[0], item[0] + item[1] - 1],
                    [add[0], add[0] + add[1] - 1]
                );
                if (replace) {
                    list[i][0] = replace[0];
                    list[i][1] = replace[1] - replace[0] + 1;
                    return false;
                }
            }
        }
        list.push(add);
    }

    getNewDiapIfInclude(diap1, diap2) {
        if (diap1[0] >= diap2[0]) {
            if (diap2[1] + 1 < diap1[0]) return false;
            let max = diap1[1];
            if (diap2[1] > max) max = diap2[1];
            return [diap2[0], max];
        } else {
            if (diap1[1] < diap2[0] - 1) return false;
            let max = diap1[1];
            if (diap2[1] > max) max = diap2[1];
            return [diap1[0], max];
        }
    }

    getContentObject() {
        return {
            id: this.id,
            name: this.name,
            label: this.label,
            categories: this.categories,
            icon: this.icon,
            searched: this.searched,
            priority: this.priority
        }
    }

    getExecArgs() {
        return [
            this.name, this.source
        ]
    }

}

export default Tool