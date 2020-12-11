class Tool {

    id; name; label; icon; categories; searched;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.label = data.label;
        this.icon = data.icon;
        this.categories = data.categories;
        this.searched = data.searched;
    }

    getID() {
        return this.id;
    }

    getElementSearch() {
        return {
            type: 'element',
            name: 'div',
            attrs: { 
                class: 'cmd-search-item',
                style: this.icon?`background-image:url(${this.icon})`:''
            },
            children: [
                {
                    type: 'element',
                    name: 'div',
                    attrs: { class: 'cmd-search-item-name' },
                    children: this.getSearched('name')
                },
                {
                    type: 'element',
                    name: 'div',
                    attrs: { class: 'cmd-search-item-label' },
                    children: this.getSearched('label')
                },
                {
                    type: 'element',
                    name: 'div',
                    attrs: { class: 'cmd-search-item-category' },
                    children: this.categories.map((item, index) => {
                        return {
                            type: 'element',
                            name: 'div',
                            attrs: { class: 'cmd-category-tag' },
                            children: this.getSearchedCategory(item, index)
                        }
                    })
                }
            ]
        }
    }

    getSearchedCategory(text, key) {
        return this.getSearched('categories', text, key);
    }

    getSearched(property, text = '', key = false) {
        let result = [];
        text = text || this[property];
        if (this.searched?.[property]?.length) {
            let offset = 0;
            this.searched[property].forEach(item => {
                if (key !== false && item[2] !== key) return;
                let index = item[0] - offset;
                let str = text.substr(index, item[1]);
                let prev = text.slice(0, index);
                result.push({ type: 'text', text: prev });
                result.push({
                    type: 'element',
                    name: 'span',
                    attrs: { class: 'cmd-search-item-found' },
                    children: [{ type: 'text', text: str }]
                });
                text = text.slice(index + item[1]);
                offset = item[0] + item[1];
            });
        }
        result.push({ type: 'text', text });
        return result;
    }

}