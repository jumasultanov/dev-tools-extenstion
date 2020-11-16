export let layer = [
    {
        type: 'element',
        name: 'div',
        attrs: { class: 'dev-tools-cmd' },
        children: [
            {
                type: 'element',
                name: 'div',
                attrs: { class: 'fade-layer' }
            },
            {
                type: 'element',
                name: 'div',
                attrs: { class: 'cmd-layer' },
                children: [
                    {
                        type: 'element',
                        name: 'div',
                        attrs: { class: 'cmd-story cmd-custom-scroll' },
                        children: [
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'cmd-story-line' },
                                children: [
                                    {
                                        type: 'text',
                                        text: 'DevTools Service, 2020. Все права защищены.'
                                    }
                                ]
                            },
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'cmd-story-line' }
                            },
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'cmd-story-line' },
                                children: [
                                    {
                                        type: 'text',
                                        text: 'Для открытия инструмента начните вводить его название или ключевые слова'
                                    }
                                ]
                            },
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'cmd-story-line' }
                            }
                        ]
                    },
                    {
                        type: 'element',
                        name: 'div',
                        attrs: { class: 'cmd-input' },
                        children: [
                            {
                                type: 'element',
                                name: 'span',
                                attrs: { class: 'cmd-input-prev' },
                                children: [
                                    {
                                        type: 'text',
                                        text: '>'
                                    }
                                ]
                            },
                            {
                                type: 'element',
                                name: 'span',
                                attrs: { class: 'cmd-input-command-line-box' },
                                children: [
                                    {
                                        type: 'element',
                                        name: 'span',
                                        attrs: { class: 'cmd-input-command-line' },
                                    },
                                    {
                                        type: 'element',
                                        name: 'span',
                                        attrs: { class: 'cmd-input-caret' }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
]