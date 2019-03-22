import './app.scss';
import * as R from 'ramda';
import { cEl} from '../common/utils';
import { PopOver, LoaderPopOver, ProgressBarPopOver } from '../common/popover/popover';


const testPopOver = new PopOver('#popover-parent')
const loaderPopOver = new LoaderPopOver('#loader--popover-parent')
const progressPopOver = new ProgressBarPopOver('#progress--popover-parent')

testPopOver.init()

cEl('#popover--show')().addEventListener('click', ()=> testPopOver.show())

cEl('#loader--popover-parent')().addEventListener('click', ()=> {
    const rendered = loaderPopOver.render()
    setTimeout(()=> rendered(), 5000)
})

cEl('#progress--popover-parent')().addEventListener('click', ()=> {
    const rendered = progressPopOver.render()
    setTimeout(()=> rendered(), 5000)
})



// For fiddling around in the browser console
window.R = R
window._testPopOver = testPopOver
window._loaderPopOver = loaderPopOver
window._progressPopOver = progressPopOver
