export let layer = [
    {
        type: 'element',
        name: 'div',
        attrs: { class: 'dev-tools-windows' },
        children: [
            {
                type: 'element',
                name: 'div',
                attrs: { class: 'background-layer' }
            },
            {
                type: 'element',
                name: 'div',
                attrs: { class: 'windows-control-layer' },
                children: [
                    {
                        type: 'element',
                        name: 'div',
                        attrs: { class: 'control-left-layer' },
                        children: [
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'control-element control-view-option', dataView: 1 },
                            },
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'control-element control-view-option', dataView: 2 },
                            },
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'control-element control-view-option', dataView: 4 },
                            }
                        ]
                    },
                    {
                        type: 'element',
                        name: 'div',
                        attrs: { class: 'control-right-layer' },
                        children: [
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'control-element control-setting' },
                            },
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'control-element control-profile' },
                            },
                            {
                                type: 'element',
                                name: 'div',
                                attrs: { class: 'control-element control-close' },
                            }
                        ]
                    }
                ]
            },
            {
                type: 'element',
                name: 'div',
                attrs: { class: 'windows-container-layer' },
                children: [
                    {
                        type: 'element',
                        name: 'div',
                        attrs: { class: 'windows-view-container' }
                    },
                    {
                        type: 'element',
                        name: 'div',
                        attrs: { class: 'windows-tray-layer' }
                    }
                ]
            }
        ]
    }
]