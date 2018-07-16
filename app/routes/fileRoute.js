/**
 * @file Defines the file manager route handler.
 */

const file = require('../services/file');

module.exports = {

    /**
     * Uploads a file.
     */
    upload: (req, res, next) => {
        file.upload(req, res);
        next();
    },

    /**
     * Downloads a file.
     */
    download: (req, res, next) => {
        file.download(req, res);
        next();
    },

    /**
     * Download dictionary.
     */
    downloadDictionary: (req, res, next) => {
        file.downloadDictionary(req, res);
        next();
    }
};