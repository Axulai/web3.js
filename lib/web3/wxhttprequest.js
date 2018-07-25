; (function (global) {
    var WXHttpRequest = function (async) {
        this.async = async || false
        var look = true
        this.readyState = null
        this.responseText = null
        this.withCredentials = false

        // timeout
        this.timeout = 30
        this.ontimeout = function () { }
        this._options = {}

    }
    WXHttpRequest.prototype.open = function (method, host, async) {
        this._options = {}
        this.async = async
        this.readyState = 0
        this._options.url = host
        this._options.method = method
        this._options.header = { 'content-type': 'application/json' }
        this._options.success = function (res) { }
        this._options.fail = function (res) { }
        return this;
    }

    WXHttpRequest.prototype.send = function (payload) {
        if (this.async) {
            var that = this
            this._options.data = payload
            this._options.success = function (res) {
                if (res.statusCode == 200) {
                    that.readyState = 2
                    that.responseText = JSON.stringify(res.data)
                    that.readyState = 3
                    that.timeout = 0
                }
                that.readyState = 4
                that.onreadystatechange()

            }
            this._options.fail = function (err) {
                that.readyState = 2
                that.responseText = JSON.stringify(res.data)
                that.readyState = 3
                that.timeout = 1
                that.ontimeout()
                that.onreadystatechange()
            }
            that.readyState = 4
            try {
                wx.request(this._options)
                this.readyState = 1
              } catch (error) {
                throw new Error('ERR_CONNECTION_REFUSED')
              }
            
            
        } else {
            throw new Error('wxapp does not support sync mode');
            return false
            // Unable to implement dummy code
            var that = this
            this._options.data = payload
            this._options.success = function (res) {
                if (res.statusCode == 200) {
                    that.readyState = 2
                    that.responseText = JSON.stringify(res.data)
                    that.readyState = 3
                    that.timeout = 0
                }
                that.readyState = 4
                that.look = false

            }
            this._options.fail = function (err) {
                that.readyState = 2
                that.responseText = err
                that.readyState = 3
                that.timeout = 1
                that.readyState = 4
                look = false
            }

            wx.request(this._options)
            this.readyState = 1
            function watch() {
                setTimeout(function () {
                    var i = 1000
                    while (i--);
                    that.look && watch()
                })
            }
            watch(that.look)
        }


    }

    WXHttpRequest.prototype.setRequestHeader = function (key, value) {
        this._options.header[key] = value
    }

    WXHttpRequest.prototype.onreadystatechange = function () { }

    if (typeof module != 'undefined' && module.exports) {
        module.exports = WXHttpRequest;

    } else if (typeof define == 'function' && (define.amd || define.cmd)) {
        define(function () { return WXHttpRequest; });
    } else {
        global.WXHttpRequest = WXHttpRequest
    }

})(this)


