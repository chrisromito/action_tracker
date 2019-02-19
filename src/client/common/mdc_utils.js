const R = require('ramda');
import { MDCTextField } from '@material/textfield';
import { MDCSelect } from '@material/select';


// CSS Class added when an input has been initialized
const initClass = 'mdc--init'

const isInitialized = (el)=> el.classList.contains(initClass)

const getNodes = (qs)=> R.reject(isInitialized, document.querySelectorAll(qs))

const postInit = R.tap(
    (el)=> el.classList.add(initClass)
)

const setUpNodes = (mdc_class, qs)=> getNodes(qs).map(
    (el)=> {
        const instance = new mdc_class(el)
        postInit(el)
        return instance
    }
)


export const initSelects = (qs='.mdc-select')=> setUpNodes(MDCSelect, qs)

export const initText = (qs='.mdc-text-field')=> setUpNodes(MDCTextField, qs)

