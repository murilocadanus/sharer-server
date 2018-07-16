/**
 * Promisify the function which follows node.js callback convention
 *
 * @param      {Function}  fn      The function
 * @return     {Promise}   The promisify-ed function
 */
const promisify = (fn) => function (...args) {
    return new Promise((resolve, reject) => {
        // here we assume the arguments to the callback follow node.js conventions
        const callback = (err, ret) => (err ? reject(err) : resolve(ret));
        // Now assume that the last argument will be used as a callback
        return fn.apply(this, args.concat([callback]));
    });
};

module.exports = {
    promisify : promisify  
};