/**
 * @module account Provides Account model
 * Fields:
 *      username {String}
 *      password {String}
 *      first_name {String}
 *      last_name {String}
 *      date_of_birth {Date}
 *      is_male {Boolean}
 *      height {Number}
 *      stats {one-to-many}
 *      created {Date}
 *      updated {Date}
 */
const bcrypt = require('bcrypt')
// const mongoose = require('mongoose')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const model = mongoose.model

const SALT_WORK_FACTOR = 10



const AccountSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: true
    },
    first_name: {type: String, required: true, max: 100},
    last_name: {type: String, required: true, max: 100},

    //-- Stats
    date_of_birth: {type: Date, required: false},
    is_male: { type: Boolean, required: false, default: true},
    // Height in centimeters
    height: { type: Number, required: false},

    stats: [{
        type: Schema.Types.ObjectId,
        ref: 'Stats'
    }],

    //-- Meta-data
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
})

AccountSchema.pre('save', function(next) {
    const user = this
    user.updated = Date.now()

    if (!user.isModified('password')) {
        return next(user)
    }

    return bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
            return next(err)
        }

        return bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
                return next(err)
            }
            user.password = hash
            next()
        })
    })
})


/**  @method passwordValid : Check if a user's password is valid when they attempt to log in
 * @param {String} entered_password : Password entered by user
 * @returns {Promise}
 */
AccountSchema.methods.passwordValid = function(entered_password) {
    const account = this
    return new Promise((resolve, reject)=> {
        bcrypt.compare(entered_password, account.password, function(err, is_match) {
            if (err) {
                return reject(err)
            }
            return resolve(is_match)
        })
    })
}


// module.exports = mongoose.model('User', AccountSchema)

exports.Account = mongoose.model('Account', AccountSchema)

