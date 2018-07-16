/**
 * @file Defines the quadrigacx service.
 */
const request = require('request');
const ccxt = require ('ccxt');

module.exports = {
    ticker: (req) => 
        new Promise( function(resolve, reject) {

            let id = req.id;
            let symbol = req.symbol;
            let printTicker = async (exchange, symbol) => {
                let ticker = await exchange.fetchTicker(symbol);
                resolve(ticker.info);
            }

            // check if the exchange is supported by ccxt
            let exchangeFound = ccxt.exchanges.indexOf (id) > -1
            if (exchangeFound) {
                let exchange = new ccxt[id];
                printTicker(exchange, symbol);
            } else {
                console.log(`Exchange not found ${id}`);
                reject('Exchange not found');
            }

        })        
        .then((result) => result)
        .catch(err => console.log(err))
};