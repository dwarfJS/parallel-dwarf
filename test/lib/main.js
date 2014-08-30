define(['./say', './data'], function (require, exports, module) {
    var mod = require('./say'),
        data = require('./data');

    module.exports = function () {
        return mod.sayHello(data.name);
    };
});