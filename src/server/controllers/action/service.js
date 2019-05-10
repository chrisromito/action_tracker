/**
 * @module service - Provide services/interfaces for Actions & various Action Types
 */
const { Future } = require('ramda-fantasy')
const { checkSchema } = require('express-validator/check')
const { Action, actionTypes } = require('../../models')



const QueryMonad = (q)=> ({
    map: (fn)=> QueryMonad( fn(q) ),

    flatMap: (fn)=> fn(q),

    chain: (fnList)=> fnList.reduce(
        (accum, fn)=> QueryMonad(accum).map(fn),
        q
    ),

    toPromise: ()=> new Promise((resolve, reject)=>
        q.exec()
            .then(resolve)
            .catch(reject)
    ),

    toFuture: ()=> Future((reject, resolve)=>
        q.exec()
            .then(resolve)
            .catch(reject)
    )
})


/**
 * @function ActionQuery
 * Query methods: require `context` to be an Action.Query
 * This allows you to chain together filters
 * 
 * @example
 * var myQuery = ActionQuery(Action.find())
 * var myUserId = '123'
 * var userQuery = myQuery.getUserActions(myUserId)
 * var userActionsSinceNow = userQuery.getActionsSince(Date.now())
 * var queryPromise = userActionsSinceNow.toPromise().then(console.log)
 * var queryFuture = userActionsSinceNow.toFuture(console.error, console.log)
 */
const ActionQuery = (q)=> ({
    map: (fn)=> ActionQuery(fn(q)),
    
    qMap: (fn)=> q.name && q.name === 'ActionQuery'
        ? q.map(fn)
        : ActionQuery(q).map(fn),

    apFind: (obj)=> ActionQuery(q.find(obj)),

    //-- Common Queries
    getUserActions: (userId)=> ActionQuery(q.find({user: userId })),

    getUserSessionActions: (userSessionId)=> ActionQuery(q.find({ userSession: userSessionId })),

    getActionsOfType: (actionType)=> ActionQuery(q.find({ actionType })),

    getActionsSince: (relativeDate)=> ActionQuery(q.find({
        timestamp: {
            $gt: relativeDate
        }
    })),

    getActionsForModel: (modelName)=> ActionQuery(q.where('target.name', modelName)),

    value: ()=> q,
    toPromise: ()=> QueryMonad(q).toPromise(),
    toFuture: ()=> QueryMonad(q).toFuture(),
})


/**
 * @function SearchAction - Service for creating Search-related actions.
 * 
 * @param {String} modelName - Name of the model that's being searched. Ex. 'User', 'Product', 'Image'
 * @param {(null|ObjectId)} userId
 * @param {(null|ObjectId)} userSessionId
 * @param {(null|Any[])} breadCrumbs
 * 
 * 
 * @method create
 * @param {String} targetData
 * @returns {Future[Error Action]}
 * 
 * @method searchSelection
 * @param {Action} searchActionId
 * @returns {Future[Error Action]}
 */
const SearchAction = (modelName, userSessionId=null, breadCrumbs=null)=> ({

    create: (targetData)=>
        Future((reject, resolve)=> 
            new Action({
                actionType: actionTypes.search,
                breadCrumbs: breadCrumbs || [],
                target: targetData,
                userSession: userSessionId
            }).save()
                .then(resolve)
                .catch(reject)
        ),

    searchSelection: (searchActionId)=> Future((reject, resolve)=> 
        Action.findById(searchActionId)
            .exec()
            .then((searchAction)=> 
                new Action({
                    actionType: actionTypes.search,
                    breadCrumbs: [searchAction],
                    target: {
                        data: JSON.parse(JSON.stringify(searchAction)),
                        id: searchAction._id,
                        name: modelName,
                    },
                    userSession: userSessionId
                }).save()
            )
            .then(resolve)
            .catch(reject)
    )
})



const ActionSchema = checkSchema({
    actionType: {
        custom: {
            options: (value)=> actionTypes.indexOf(value) > -1
        }
    },

    target: {
        exists: true
    }
})

module.exports = {
    ActionSchema,
    ActionQuery,
    QueryMonad,
    SearchAction
}