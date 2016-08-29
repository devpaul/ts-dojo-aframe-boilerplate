(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'dojo-has/has'], factory);
    }
})(function (require, exports) {
    "use strict";
    var has_1 = require('dojo-has/has');
    has_1.add('webvr', function () {
        return 'getVRDisplays' in navigator;
    });
    has_1.add('gamepad', function () {
        return 'getGamepads' in navigator;
    });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = has_1.default;
});
//# sourceMappingURL=../_debug/has.js.map