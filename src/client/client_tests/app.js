import './app.scss';
import * as R from 'ramda';
import { cEl } from '../common/utils';
import { Action, EventAction } from '../../shared/interfaces/action';
import {
    ActionSocket, ActionSocketSubscriber,
    defaultSocketConfig, defaultSubscriberConfig
} from '../action/socket';



const selectors = {
    button: '[data-action="trigger"]',
    output: '[data-action="output"]'
}


const elements = {
    button: cEl(selectors.button),
    output: cEl(selectors.output)
}


const tryToJson = R.tryCatch(JSON.stringify, String)


const writeOutput = (message)=> elements.output().insertAdjacentHTML('beforeend', `
        <br>
        ${message}
        <br>
    `)


const writeMessage = R.compose(
    writeOutput,
    (s)=> `<b>Received message:<b> ${s}`,
    tryToJson
)



//-- App test


const logSubscriberConfig = {
    next: (x)=> {
        console.log(`next: ${x}`)

        writeMessage(x)
        return x
    },

    error: (e)=> {
        const message = `Caught a socket error: ${e}`
        console.error(message)
        writeOutput(message)
        return e
    }
}


const testSocket = ()=> new ActionSocket(defaultSocketConfig)


const initTestSocket = ()=> testSocket().init(logSubscriberConfig)


//-- Http Actions

const addToNow = (n)=> Date.now() + n


const searchBreadCrumbs = [
    { query: "What would s", time: Date.now()},
    { query: "What would someone sear", time: addToNow(10)},
    { query: "What would someone search for?", time: addToNow(20)}
]


const HttpData = {
    actionType: 'POST',
    
    target: {
        id: 123,
        name: 'Test Http Action Target Name',
        data: {
            name: 'Test Http Action Target Data Name',
            message: 'Hello websocket!'
        }
    },
    
    breadCrumbs: searchBreadCrumbs
}



const testHttpAction = (socket)=> socket.pushAction(
    new Action(HttpData.actionType, HttpData.target, HttpData.breadCrumbs)
)



const testDomAction = (socket)=> (event)=> socket.pushAction(
    EventAction.of(event)
)



const initTestSuite = ()=> {
    const socket = initTestSocket()

    socket.socket.subscribe(logSubscriberConfig)

    writeOutput(`<b>Socket connection open</b>
        <br>
        <p>Setting up Dom Event Action</p>
    `)

    const eventActionAsJson = (e)=> tryToJson(
        EventAction.of(e).toObject()
    )

    elements.button().addEventListener('click', (e)=> {
        e.preventDefault()
        writeOutput(`
            <b>Button clicked.</b>  Dispatching event action as:<br>
            ${eventActionAsJson(e)}
            <br>
        `)
        const eventCopy = {type: e.type, target: elements.button()}
        testDomAction(socket)(eventCopy)

        window.buttonEvent = e
    })


    setTimeout(()=> {
        writeOutput('About to test HTTP Action')
        testHttpAction(socket)
    }, 500)
}




//-- Global exports
window.testSocket = testSocket
window.initTestSocket = initTestSocket
window.elements = elements
window.ActionSocket = ActionSocket
window.initTestSuite = initTestSuite
window.EventAction = EventAction

window.defaultSocketConfig = defaultSocketConfig
window.defaultSubscriberConfig = defaultSubscriberConfig
window.R = R




window.addEventListener('load', ()=> setTimeout(initTestSuite, 2000))