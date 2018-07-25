var Web3 = require('./lib/web3');

// wechat app
if (typeof wx !== 'undefined' && typeof wx.Web3 === 'undefined') {
    wx.Web3 = Web3;
}

// dont override global variable
if (typeof window !== 'undefined' && typeof window.Web3 === 'undefined') {
    window.Web3 = Web3;
}

module.exports = Web3;
