/**
 * NOTE: This may take 5-10 minutes to run.
 * 
 * @TODO: (2019-Mar-09) - Get metrics for efficiency & efficacy; adjust default network config accordingly.
 *                      - Implement unit tests
 */
const {
    TextField,
    DateField,
    ActionFieldSpec
} = require('./field')
const { initUserSearchActions } = require('./test_data/user_generator')
const { SearchModelActionTask } = require('./action.search')


/**
 * The `runTestTask` consists of 3 main steps:
 * 
 * 1. Our 'initUserSearchActions' function will generate test Users, Accounts, and random
 * search actions to mock Users searching for other Users (eg. on a social media platform)
 * 
 * 2. Run the SearchActionTask using a FieldSpec based off of the User Model
 * 3. The SearchActionTask trains a Recurrent Neural Network by comparing the search queries (generated in step 1),
 * and stores the results in the 'NeuralStep' mongoBD document.
 * 
 * Optional Step
 * 4. The If one were to run the `testTask` again, then it will run the training task again,
 * but the network will "remember" where it left off from the last run
 */

const UserFieldSpec = new ActionFieldSpec({
    first_name: TextField.of('first_name'),
    last_name: TextField.of('last_name'),
    username: TextField.of('username'),
    created: DateField.of('created')
})

const testTask = ()=> SearchModelActionTask('User', UserFieldSpec)

const runTestTask = ()=> initUserSearchActions()
    .then(testTask)
    .catch(console.log)

runTestTask()


//-- UnComment this to debug
// module.exports = {
//     testTask,
//     runTestTask
// }


const _COPY_PASTE_INTO_NODE_SHELL_FOR_DEBUGGING = `

var R = require('ramda')
var { User, NeuralStep, Action, Account } = require('./src/server/models/index')
var brain = require('brain.js')

var actionSearch = {
    testTask,
    runTestTask
} = require('./src/server/neural/test.action.search')


var results = {}

runTestTask().then((x)=> results = x).catch(console.log)


`