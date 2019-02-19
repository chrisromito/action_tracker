


const wrap = (err, data)=> new Promise((resolve, reject)=> {
    if (err) {
        return reject(err)
    }
    return resolve(data)
})


module.exports.toPromise = (fn)=> fn(wrap)
