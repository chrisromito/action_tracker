const R = require('ramda')
const { Action, actionTypes, User, Account } = require('../../models/index')
const { lastNames, maleNames, femaleNames } = require('./names')
const { randomIntBetween, randomQueryString, randomItemFrom } = require('./utils')


/**
 * Account/User CRUD
 * 
 *=========================================*/

const randomAccountDetails = ()=> {
    const isMale = Boolean(randomIntBetween(0, 2))
    const firstName = randomItemFrom(
        isMale ? maleNames : femaleNames
    )
    const lastName = randomItemFrom(lastNames)
    const userName = `${firstName}${lastName}${randomIntBetween(1, 100000)}@actiontracker.test.com`
    return {
        username: userName,
        first_name: firstName,
        last_name: lastName,
        is_male: isMale,
        password: 'MySuperSafePassword'
    }
}

/**
 * @func generateRandomAccounts - Generates 200 random `Account` and `User` model instances
 * @returns {User[]}
 */
const generateRandomAccounts = ()=> {
    const accountDetails = R.range(0, 200).map(randomAccountDetails)

    return Account.insertMany(accountDetails)
        .then((accounts)=> {
            const userDetails = accounts.map((a)=> ({
                account: a._id,
                active: true
            }))

            return User.insertMany(userDetails)
        })
}


const getTestAccounts = ()=> Account.find({
    _id: {
        $in: accounts.map(R.prop('_id'))
    }
}).exec()


const _deleteRandomUsers = (accounts)=> User.deleteMany({
    account: {
        $in: accounts.map(R.prop('_id'))
    }
}).exec()

const _deleteUserAccounts = (accounts)=> Account.deleteMany({
    _id: {
        $in: accounts.map(R.prop('_id'))
    }
}).exec()


const deleteRandomAccounts = ()=> {
    const testAccounts = Account.find({})
        .where('username', /@actiontracker.test.com/gi)
        .exec()

    return testAccounts.then((accounts)=> Promise.all([
        _deleteRandomUsers(accounts),
        _deleteUserAccounts(accounts)
    ]))
}


/**
 * Action CRUD
 * 
 *=========================================*/


const randomSearchTargetSpec = R.compose(
    R.mergeDeepRight({
        id: null,
        name: 'User'
    }),
    R.applySpec({
        data: {
            first_name: R.identity,
            last_name: R.identity,
            username: R.identity
        },
        query: R.identity
    }),
    randomQueryString,
    R.view(R.lensPath([
        randomItemFrom(['first_name', 'last_name', 'username'])
    ]))
)

/**
 * @func generateRandomSearchActions - Generate Search Actions based on
 * Our existing Users & their respective accounts
 * 
 */
const generateRandomSearchActions = ()=> User.find().exists('account')
    .populate('account')
    .exec()
    .then((users)=> users.map((u)=> ({
            actionType: actionTypes.searchSelection,
            timestamp: Date.now(),
            //-- The user that was selected from our search results
            target: {
                // id: u._id,
                name: 'User',
                data: JSON.parse(JSON.stringify(u.account))
            },
            // The search action that lead to this selection
            breadCrumbs: [{
                actionType: actionTypes.searchAction,
                timestamp: Date.now() - randomIntBetween(1000, 5000),
                target: randomSearchTargetSpec(u.account)
            }]
        }))
        .map((action)=> new Action(action).save())
    )
    .then((actions)=> Promise.all(actions))


const initUserSearchActions = ()=> deleteRandomAccounts()
    .then(generateRandomAccounts)
    .then(generateRandomSearchActions)
    .catch(console.log)



module.exports = {
    getTestAccounts,
    generateRandomSearchActions,
    initUserSearchActions
}


const _COPY_PASTE_IN_NODE_SHELL = `

var R = require('ramda')
var foo = {
    Lenses,
    UserFieldSpec,
    randomAccountDetails,
    generateRandomAccounts,
    getTestAccounts,
    deleteRandomAccounts,
    initUserSearchActions
} = require('./src/server/neural/test_data/user_generator')


`