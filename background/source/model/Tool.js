class Tool {

    id; name; label; categories; source; icon;
    searched;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.label = data.label;
        this.categories = data.categories;
        this.source = data.source;
        this.icon = data.icon;
    }

    isIncludes(keywords) {
        return true;
    }

    getContentObject() {
        return {
            id: this.id,
            name: this.name,
            label: this.label,
            categories: this.categories,
            icon: this.icon
        }
    }

}

export default Tool