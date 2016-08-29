(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './has'], factory);
    }
})(function (require, exports) {
    "use strict";
    var has_1 = require('./has');
    console.log("WebVR is supported: " + has_1.default('webvr'));
    console.log("Gamepad is supported: " + has_1.default('gamepad'));
});
//# sourceMappingURL=../_debug/main.js.map