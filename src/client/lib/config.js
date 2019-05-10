const _defaultConfig = {
    url: {
        http: '',
        webSocket: ''    
    },

    user: {
        userId: null,
        userSessionId: null    
    },

    client: {
        clientId: null
    },

    pageView: {
        pageViewApi: '/page_view',
        pageViewId: null
    }
}

export const defaultConfig = {..._defaultConfig}


let _GlobalConfig = {..._defaultConfig}
window.__ActionTrackerConfig = _GlobalConfig



export const Config = {

    extendDefault(customConfig) {
        return {..._defaultConfig, ...customConfig}
    },

    getGlobalConfig() {
        return {..._GlobalConfig}
    },

    extendGlobal(newConfig) {
        _GlobalConfig = {...Config.getGlobalConfig(), ...newConfig}
        window.__ActionTrackerConfig = _GlobalConfig
        return Config.getGlobalConfig()
    }
}
