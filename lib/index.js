'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.SimpleCollapse = SimpleCollapse;
exports.CollapseByParams = CollapseByParams;
exports.Collapse = Collapse;
exports.defaultHashFunction = defaultHashFunction;
function SimpleCollapse(target, name, descriptor) {
    assertUsage(target, name, descriptor);

    var decoratedMethod = descriptor.value;
    var pendingPromise = null;

    descriptor.value = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var functionArguments = args;

        if (!pendingPromise) {
            pendingPromise = decoratedMethod.apply(this, functionArguments).then(function (result) {
                pendingPromise = null;

                return result;
            });

            return pendingPromise;
        }

        return pendingPromise;
    };
}

function CollapseByParams() {
    var hashFunc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultHashFunction;

    return function (target, name, descriptor) {
        assertUsage(target, name, descriptor);

        var decoratedMethod = descriptor.value;
        var pendingPromises = new WeakMap();

        descriptor.value = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var functionArguments = args;
            var hash = hashFunc.apply(this, args);

            if (!pendingPromises[hash]) {
                pendingPromises[hash] = decoratedMethod.apply(this, functionArguments).then(function (result) {
                    pendingPromises[hash] = null;

                    return result;
                });

                return pendingPromises[hash];
            }

            return pendingPromises[hash];
        };
    };
}

function Collapse() {
    var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
    var hashFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultHashFunction;

    return function (target, name, descriptor) {
        assertUsage(target, name, descriptor);

        var decoratedMethod = descriptor.value;
        var pendingPromises = new WeakMap();

        descriptor.value = function () {
            var _this = this;

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            var functionArguments = args;
            var hash = hashFunc.apply(this, args);

            if (!pendingPromises[hash]) {
                var _ret = function () {
                    var pendingTimeout = setTimeout(function () {
                        pendingPromises[hash] = null;
                    }, timeout);

                    pendingPromises[hash] = decoratedMethod.apply(_this, functionArguments).then(function (result) {
                        pendingPromises[hash] = null;
                        clearTimeout(pendingTimeout);

                        return result;
                    });

                    return {
                        v: pendingPromises[hash]
                    };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }

            return pendingPromises[hash];
        };
    };
}

function defaultHashFunction() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
    }

    return args.join('|');
}

function assertUsage(target, name, descriptor) {
    if (typeof target === 'function') {
        throw new Error('Decorator can only be applied to functions');
    }

    if (typeof descriptor.value !== 'function') {
        throw new Error('Decorator can only be applied to functions');
    }
}