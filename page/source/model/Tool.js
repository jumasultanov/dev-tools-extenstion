class Tool {

    id; name; label; categories; icon;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.label = data.label;
        this.categories = data.categories;
        this.icon = data.icon;
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
                    children: [{ type: 'text', text: this.name }]
                },
                {
                    type: 'element',
                    name: 'div',
                    attrs: { class: 'cmd-search-item-label' },
                    children: [{ type: 'text', text: this.label }]
                }
            ]
        }
    }

}