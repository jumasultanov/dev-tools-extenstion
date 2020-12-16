/**
 * Класс для работы с пунктом истории
 */
class Story {

    //Данные запущенного иснтрумента
    id; name; categories;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.categories = data.categories;
    }

    /**
     * Возвращает ID
     * @return {Number}
     */
    getID() {
        return this.id;
    }

    /**
     * Возвращает объект шаблона элемента
     * @return {Object}
     */
    getLayerData() {
        return {
            type: 'element',
            name: 'div',
            attrs: { class: 'cmd-story-line-request' },
            children: [
                {
                    type: 'element',
                    name: 'div',
                    attrs: { class: 'cmd-story-line' },
                    children: [
                        {
                            type: 'element',
                            name: 'div',
                            attrs: { class: 'cmd-input-prev' },
                            children: [{ type: 'text', text: '>' }]
                        },
                        {
                            type: 'element',
                            name: 'div',
                            attrs: { class: 'cmd-story-line-name' },
                            children: [{ type: 'text', text: this.name }]
                        },
                    ]
                },
                {
                    type: 'element',
                    name: 'div',
                    attrs: { class: 'cmd-story-response' },
                    children: []
                }
            ]
        }
    }

}