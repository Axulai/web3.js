/*
    This file is part of ethereum.js.

    ethereum.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    ethereum.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with ethereum.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/** @file ipcprovider.js
 * @authors:
 *   Fabian Vogelsteller <fabian@ethdev.com>
 * @date 2015
 */

"use strict";

var utils = require('../utils/utils');
var errors = require('./errors');


var IpcProvider = function (path, net) {
    var _this = this;
    this.responseCallbacks = {};
    this.path = path;
    
    net = net || require('net');


    try {
        this.connection = net.connect({path: this.path});
    } catch(error) {
        throw errors.InvalidConnection(path);
    }

    // this.connection.on('error', function(e){
    //     throw errors.InvalidConnection(path);
    // }); 



    // LISTEN FOR CONNECTION RESPONSES
    this.connection.on('data', function(result) {
        result = result.toString();

        try {
            result = JSON.parse(result);

        } catch(e) {
            throw errors.InvalidResponse(result);                
        }

        var id;

        // get the id which matches the returned id
        if(utils.isArray(result)) {
            result.forEach(function(load){
                if(_this.responseCallbacks[load.id])
                    id = load.id;
            });
        } else {
            id = result.id;
        }


        // fire the callback
        if(_this.responseCallbacks[id]) {
            _this.responseCallbacks[id](null, result);
            delete _this.responseCallbacks[id];
        }

    });
};

/**
Get the adds a callback to the responseCallbacks object,
which will be called if a response matching the response Id will arrive.

@method _getResponse
*/
IpcProvider.prototype._getResponse = function(payload, callback) {
    var id = payload.id || payload[0].id;

    this.responseCallbacks[id] = callback;
};


IpcProvider.prototype.isConnected = function() {
    // try reconnect, when connection is gone
    if(!this.connection._handle)
        this.connection.connect({path: this.path});

    return !!this.connection._handle;
};

IpcProvider.prototype.send = function (payload) {

    if(this.connection.writeSync) {

        // try reconnect, when connection is gone
        if(!this.connection._handle)
            this.connection.connect({path: this.path});

        var result = this.connection.writeSync(JSON.stringify(payload));

        try {
            result = JSON.parse(result);
        } catch(e) {
            throw errors.InvalidResponse(result);                
        }

        return result;

    } else {
        throw new Error('You tried to send "'+ payload.method +'" synchronously. Synchronous requests are not supported by the IPC provider.');
    }
};

IpcProvider.prototype.sendAsync = function (payload, callback) {
    // try reconnect, when connection is gone
    if(!this.connection._handle)
        this.connection.connect({path: this.path});


    this.connection.write(JSON.stringify(payload));
    this._getResponse(payload, callback);
};

module.exports = IpcProvider;
