const R = require('ramda')
const { Action, actionTypes, User, Account } = require('../../models/index')
const { randomIntBetween, randomQueryString, randomItemFrom } = require('./utils')
const RandomUserAccounts = require('./test_accounts').data
const pChain = require('../../utils/pchain')


/**
 * Account/User CRUD
 * 
 *=========================================*/

/**
 * @func generateRandomAccounts - Generates random `Account` and `User` model instances from `./test_accounts.js`
 * @returns {User[]}
 */
const generateRandomAccounts = ()=> {
    const accountDetails = RandomUserAccounts.map((user)=> ({
        username: `${user.first_name}${user.first_name}${randomIntBetween(1, 999999999999)}@actiontracker.test.com`,
        first_name: user.first_name,
        last_name: user.last_name,
        password: 'MySuperSafePassword'
    }))

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




const shuffle = (str)=> str.split('').sort(()=> 0.5 - Math.random()).join('')
const letters = 'abcdefghijklmnopqrstuvwxyz'

const appendRandomLetters = (str)=> str + ' ' + randomQueryString(shuffle(letters))


const randomSearchTargetSpec = (obj)=> {
    const fields = ['first_name', 'last_name', 'username']

    const randomFirstNameSearch = appendRandomLetters(
        R.prop('first_name', obj)
    )

    const randomizedFields = fields.reduce((accum, field_name)=> {
        accum[field_name] = randomFirstNameSearch
        return accum
    }, {})

    console.log(`randomized fields: ${JSON.stringify(randomizedFields, null,  4)}`)
    return R.mergeDeepRight({
        id: null,
        name: 'User'
    }, {
        data: randomizedFields,
        query: randomFirstNameSearch
    })
}

/**
 * @func generateRandomSearchActions - Generate Search Actions based on
 * Our existing Users & their respective accounts
 * 
 */
const MS_PER_MINUTE = 1000 * 60
const MS_PER_HOUR = MS_PER_MINUTE * 60
const MS_PER_DAY = MS_PER_HOUR * 24
const DAYS_PER_HALF_YEAR = 365 / 2
const MS_PER_HALF_YEAR = MS_PER_DAY * DAYS_PER_HALF_YEAR

const randomTimeFrom = (ms_threshold=MS_PER_HALF_YEAR)=> randomIntBetween(
    Date.now() - ms_threshold,
    Date.now()
)


/**
 * @func cyclicIndex - Get `index` from array.  If `index` > `arr`.length,
 * it will get the index from the array as if the array repeated until
 * we were able to get the index.
 * 
 * @example
 * var myArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * myArr.length //=> 11
 * cyclicIndex(myArr, 12) //=> 1
 * cyclicIndex(myArr, 13) //=> 2
 * cyclicIndex(myArr, 14) //=> 3
 */
const cyclicIndex = (arr, index)=> {
    const len = arr.length
    return index < len ? arr[index] : arr[index % len]
}

const randomSearchAction = (users, day_threshold, index)=> {
    const user = cyclicIndex(users, index)
    const timestamp = randomTimeFrom(day_threshold * MS_PER_DAY)

    return {
        actionType: actionTypes.searchSelection,
        timestamp: timestamp,
        //-- The user that was selected from our search results
        target: {
            name: 'User',
            data: JSON.parse(JSON.stringify(user.account))
        },
        // The search action that lead to this selection
        breadCrumbs: [{
            actionType: actionTypes.searchAction,
            timestamp: timestamp - randomIntBetween(1000, 5000),
            target: randomSearchTargetSpec(user.account)
        }]
    }
}


const generateRandomSearchActions = (n, day_threshold=DAYS_PER_HALF_YEAR)=> User.find()
    .where('account')
    .exists()
    .populate('account')
    .exec()
    .then((users)=> {
        const indexRange = R.range(0, n)
        // Generate a random search action targeting a random user
        const randomActionData = indexRange.map((_, index)=> randomSearchAction(users, day_threshold, index))
        // Create an Array of thunks so we can chain the promises together sequentially
        const searchActionThunks = randomActionData.map((action)=> {
            return ()=> new Action(action).save()
        })
        return pChain(searchActionThunks)
    }).catch((err)=> {
        console.log(`
        generateRandomSearchActions caught an error: ${err}
        Error location: ${err.fileName} @ line ${err.lineNumber} @ column ${err.columnNumber}
        `)
        return err
    })


const initUserSearchActions = (n=500)=> deleteRandomAccounts()
    .then(generateRandomAccounts)
    .then(()=> generateRandomSearchActions(n))
    .catch(console.log)



module.exports = {
    getTestAccounts,
    generateRandomAccounts,
    generateRandomSearchActions,
    initUserSearchActions
}
