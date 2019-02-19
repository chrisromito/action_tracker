/** @module nunjucks.context - Provides global variables for nunjucks templates
 * @exports setContext:: nunjucks {nunjucks} => {nunjucks}
 */

const setContext = (nunjucks)=> {
    const appendProp = (p)=> `mdc-theme--${p}`
    const materialColors = {
        background: {
            primary: appendProp('primary-bg'),
            secondary: appendProp('secondary-bg'),
            surface: appendProp('surface'),
            background: appendProp('background'),
        },
        text: {
            primary: appendProp('primary'),
            onPrimary: appendProp('on-primary'),
            secondary: appendProp('secondary'),
            onSecondary: appendProp('on-secondary'),
            onSurface: appendProp('on-surface'),
        }
    }

    nunjucks.addGlobal('materialColors', materialColors)
    return nunjucks
}

module.exports = setContext