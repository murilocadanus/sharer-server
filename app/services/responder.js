/**
 * @file Defines the Responder service.
 */
const errors = require('./errors');

const allowedLatency = process.env.ALLOWED_LATENCY || 1000;

/**
 * Logs time taken by a request and set off an
 * alert if it more than allowed latency limit
 *
 * @param: {number} startTime - The time request was entertained
 */
function logTime(startTime, path = '', isError = false) {
  const timeTaken = Date.now() - startTime;
  console.log(`Time taken: ${timeTaken}ms`);
  if (timeTaken > allowedLatency) {
    console.log(`ALERT: Latency of ${timeTaken}ms${isError ? ' from error' : ''} (${path})`);
  }
}

module.exports = {

  /**
   * Responds client with a success reply
   */
  success: (res, data, code) => {
    res.status(code || 200).send({ data });
  },

  /*
  * Shortcut for responding wiht an error message
  */
  errorMessage: (res, message) => {
    res
    .status(200)
    .send({
      error: {
        code: 500,
        message: message
      }
    });
    logTime(res.startTime, res.path, true);
  },

  /**
   * Responds client with a failure reply
   */
  error: (res, err, code) => {
    if (!err.code || err.code === 500) {
      console.log(err);
      console.log(err.details);
    } else {
      console.log(err);
    }
    res
      .status(code || 200)
      .send({
        error: {
          code: err.code || errors.internalServerError().code,
          message: err.code ? err.message : errors.internalServerError().message
        }
      });
    logTime(res.startTime, res.path, true);
  },

  /**
   * Initialize data property of request object
   * Assigns the params to a .params object.
   * the params will be taken from .query if get
   * and .body if post
   */
  init: (req, res, next) => {
    req.data = {};
    req.obj = {};
    switch (req.method) {
      case 'POST': req.obj = req.body; break;
      case 'GET': req.obj = req.query; break;
      default :
    }
    console.log('Request > ', {
      method: req.method,
      path: req.path,
      obj: JSON.stringify(req.obj, null, 2).substr(0, 200)
    });
    res.startTime = Date.now();
    res.path = req.path;
    next();
  },

  /**
   * Replies client with whatever is there in
   * data property of request object
   */
  reply: (req, res, next) => {
    // If request has not been handled,
    // keep it unhandled
    if (!req.route || !req.route.stack) {
      return next();
    }
    if (!res.headersSent) {
      res.send({ data: req.data });
      logTime(res.startTime, req.path);
    }
    next();
  }
};
