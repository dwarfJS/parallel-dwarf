!function (root) {

    var Cache = {},
        _sim = {},
        _stack = [],
        _head = document.getElementsByTagName('head')[0],
        _require,
        _base,
        DOT_RE = /\/\.\//g,
        DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//,
        DOUBLE_SLASH_RE = /([^:/])\/\//g;

    function _isFunction(f) {
        return typeof f === 'function';
    }

    function _normalize(base, id) {
        if (_isUnnormalId(id)) return id;
        if (_isRelativePath(id)) return _resolvePath(base, id) + '.js';
        return id;
    }

    function _isUnnormalId(id) {
        return (/^https?:|^file:|^\/|\.js$/).test(id);
    }

    function _isRelativePath(path) {
        return (path + '').indexOf('.') === 0;
    }

    function _resolvePath(base, path) {
        path = base.substring(0, base.lastIndexOf('/') + 1) + path;
        path = path.replace(DOT_RE, '/');
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, '/');
        }
        return path = path.replace(DOUBLE_SLASH_RE, '$1/');
    }

    // just a async parallel
    function parallel(tasks, cb) {
        var results, pending, keys;
        if (Array.isArray(tasks)) {
            results = [];
            pending = tasks.length;
        } else {
            keys = Object.keys(tasks);
            results = {};
            pending = keys.length;
        }

        function done(i, err, result) {
            results[i] = result;
            if (--pending === 0 || err) {
                cb && cb(err, results);
                cb = null;
            }
        }

        if (!pending) {
            cb && cb(null, results);
            cb = null;
        } else if (keys) {
            keys.forEach(function (key) {
                tasks[key](done.bind(undefined, key));
            });
        } else {
            tasks.forEach(function (task, i) {
                task(done.bind(undefined, i));
            });
        }
    }

    // like a sync require
    function _getMod(opt) {
        var name = opt.name,
            base = opt.base,
            path = _normalize(base, name),
            mod;
        return (mod = Cache[path]) ?
            mod.exports : false; 
    }

    function _initCache(path) {
        return Cache[path] = {
            dones: [], 
            url: _sim[path] || path, 
            loaded: false
        };
    }

    function _runFactory(mod, factory) {
        if (_isFunction(factory)) {
            var module = { exports: {} },
                exports = factory(makeRequire({ base: mod.url }), module.exports, module) ||
                    module.exports;
            mod.exports = module.exports;
        } else {
            mod.exports = factory;
        }
        mod.dones.forEach(function (done) {
            done(null, mod.exports);
        });
    }

    function _makeMod(src, done) {
        _stack.forEach(function (o) {
            if (!o.m) o.m = src;
            var path = _normalize(src, o.m),
                factory = o.f,
                mod = Cache[path];
            if (!mod) {
                mod = _initCache(path);
                _runFactory(mod, factory);
            }
            !mod.exports && _runFactory(mod, factory);
        });
        _stack.length = 0;
    }

    function _buildCallback(opt) {
        var name = opt.name,
            base = opt.base,
            path = _normalize(base, name),
            url = _sim[path] || path,
            mod = Cache[path];

        return function (done) {
            if (!mod) {
                mod = _initCache(path);
                mod.dones.push(done);

                var node = document.createElement('script');
                node.addEventListener('load', _onload, false);
                node.addEventListener('error', _onerror, false);
                node.type = 'text/javascript';
                node.src = url;
                _head.appendChild(node);
                function _onload() {
                    _onend();
                    return _makeMod(path, done);
                }
                function _onerror() {
                    _onend();
                    _head.removeChild(node);
                    // TODO
                    return done(new Error('404'));
                }
                function _onend() {
                    node.removeEventListener('load', _onload, false);
                    node.removeEventListener('error', _onerror, false);
                }
            } else {
                done(null, mod.exports);
            }
        }
    }

    function makeRequire(opt) {
        // baseUrl
        var base = opt.base;
        function _r(deps, succ, fail) {
            // async
            if (succ) {
                deps.forEach(function (dep, i) {
                    // need build a callback
                    if (typeof dep === 'string') {
                        deps[i] = _buildCallback({
                            name: dep,
                            base: base
                        });
                    }
                });
                parallel(deps, function (err, results) {
                    if (err) return err();
                    succ.apply(undefined, results);
                });
            // sync
            } else {
                return _getMod({
                    name: deps,
                    base: base
                });
            }
        }
        return _r;
    }

    function require() {
        if (_require) return _require.apply(root, arguments);
        if (_base) {
            _require = makeRequire({ base: _base });
        } else {
            _require = makeRequire({ base: location.href });
        }
        return _require.apply(root, arguments);
    }

    function define(module, factory) {
        if (!factory) {
            factory = module;
            module = undefined;
        }
        _stack.push({
            m: module,
            f: factory
        });
    }

    root.define = define;
    root.require = require;

}(window);