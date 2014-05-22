(function () {
/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../node_modules/almond/almond", function(){});

define('joga/dependencyTracker',[],function() {
    
    function DependencyTracker() {
        this.observers = [];

        this.push = function(observer) {
            this.observers.push(observer);
            return this;
        };

        this.pop = function() {
            this.observers.pop();
            return this;
        };

        this.notify = function(changedProperty) {
            if (this.observers.length > 0) {
                this.observers[this.observers.length - 1](changedProperty);
            }
            return this;
        };
    }
    
    return new DependencyTracker();
});
define('joga/objectProperty',['joga/dependencyTracker'], function(dependencyTracker) {
    
    function objectPropertyFactory(initialValue) {

        function objectProperty(value) {
            return objectProperty.evaluate(value, this);
        }

        objectProperty.evaluate = evaluate;
        objectProperty.initialize = initialize;
        objectProperty.mixinTo = mixinTo;
        objectProperty.applySelf = applySelf;

        objectProperty.subscribe = subscribe;
        objectProperty.unsubscribe = unsubscribe;
        objectProperty.notify = notify;

        objectProperty.isNull = isNull;
        objectProperty.isNotNull = isNotNull;
        objectProperty.get = get;
        objectProperty.put = put;
        objectProperty.forEach = forEach;

        objectProperty.initialize(initialValue);

        return objectProperty;
    }

    function evaluate(newValue, self) {
        this.self = self;
        if (newValue === undefined) {
            dependencyTracker.notify(this);
            return this.value;
        }
        this.value = newValue;
        this.notify();
        return this.self;
    }

    function initialize(initialValue) {
        this.value = null;
        this.observers = [];
        this.evaluate(initialValue);
    }

    function mixinTo(property) {
        var key;
        for(key in this) {
            property[key] = this[key];
        }
        return this;
    }

    function applySelf(args) {
        return this.apply(this.self, args);
    }

    function subscribe(observer) {
        this.observers.push(observer);
        return this;
    }

    function unsubscribe(observer) {
        var index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
        return this;
    }

    function notify() {
        var observers = this.observers.slice(0),
            i;
        for (i = 0; i < observers.length; i++) {
            observers[i](this);
        }
        return this;
    }

    function isNull() {
        return this.applySelf() === null;
    }

    function isNotNull() {
        return !this.isNull();
    }

    function get(key) {
        return this.applySelf()[key];
    }

    function put(key, value) {
        this.value[key] = value;
        this.notify();
    }

    function forEach(iterator) {
        var key;
        for (key in this.applySelf()) {
            iterator.call(this.self, this.value[key], key);
        }
    }

    return objectPropertyFactory;
});

define('joga/arrayProperty',['joga/objectProperty'], function (objectProperty) {
    
    function arrayPropertyFactory(initialValue) {

        function arrayProperty(value) {
            return arrayProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(arrayProperty);

        arrayProperty.push = push;
        arrayProperty.pop = pop;
        arrayProperty.remove = remove;
        arrayProperty.clear = clear;
        arrayProperty.shift = shift;
        arrayProperty.unshift = unshift;
        arrayProperty.reverse = reverse;
        arrayProperty.sort = sort;
        arrayProperty.forEach = forEach;

        arrayProperty.initialize(initialValue);

        return arrayProperty;
    }

    function push(value) {
        this.value.push(value);
        this.notify();
        return this;
    }

    function pop() {
        var popped = this.value.pop();
        this.notify();
        return popped;
    }

    function remove(value) {
        var index = this.value.indexOf(value);
        while (index !== -1) {
            this.value.splice(index, 1);
            index = this.value.indexOf(value);
        }
        this.notify();
        return this;
    }

    function clear() {
        this.applySelf([[]]);
        this.notify();
        return this;
    }

    function shift() {
        var shifted = this.applySelf().shift();
        this.notify();
        return shifted;
    }

    function unshift(value) {
        this.applySelf().unshift(value);
        this.notify();
        return this;
    }

    function reverse() {
        this.applySelf().reverse();
        this.notify();
        return this;
    }

    function sort(comparator) {
        this.applySelf().sort(comparator);
        this.notify();
        return this;
    }

    function forEach(iterator) {
        var i;
        if (this.applySelf().forEach) {
            this.value.forEach(iterator.bind(this.self));
        } else {
            for (i = 0; i < this.value.length; i++) {
                iterator.call(this.self, this.value[i], i);
            }
        }
        return this;
    }

    return arrayPropertyFactory;
});
define('joga/booleanProperty',['joga/objectProperty'], function (objectProperty) {
    
    function booleanPropertyFactory(initialValue) {
        
        function booleanProperty(value) {
            return booleanProperty.evaluate(value, this);
        }
        
        objectProperty().mixinTo(booleanProperty);
        
        booleanProperty.toggle = toggle;
        
        booleanProperty.initialize(initialValue);
        
        return booleanProperty;
    }
    
    function toggle() {
        this.evaluate(!this.value);
        return this;
    }

    return booleanPropertyFactory;
});
define('joga/computedProperty',['joga/objectProperty', 'joga/dependencyTracker'], function(objectProperty, dependencyTracker) {

    function computedPropertyFactory(initialValue) {

        function computedProperty(value) {
            return computedProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(computedProperty);

        computedProperty.evaluate = evaluate;
        computedProperty.initialize = initialize;
        computedProperty.applyWrapped = applyWrapped;
        
        computedProperty.initialize(initialValue);

        return computedProperty;
    }
    
    function evaluate(newValue, self) {
        var value,
            i;
        
        this.self = self;
        
        if (newValue !== undefined) {
            this.value = newValue;
            return this.self;
        }

        for (i = 0; i < this.dependencies.length; i++) {
            this.dependencies[i].unsubscribe(this.notify);
        }

        this.dependencies = [];
        this.wrapped = null;

        dependencyTracker.push(this.subscriber);

        this.value = this.computer.apply(this.self, arguments);

        dependencyTracker.pop();

        for (i = 0; i < this.dependencies.length; i++) {
            this.dependencies[i].subscribe(this.notify);
        }

        dependencyTracker.notify(this);

        return this.value;
    }
    
    function initialize(initialValue) {
        objectProperty().initialize.call(this, null);
        this.computer = initialValue;
        this.dependencies = [];

        this.notify = function() {
            var observers = this.observers.slice(0),
                i;
            for (i = 0; i < observers.length; i++) {
                observers[i](this);
            }
            return this.self;
        }.bind(this);
        
        this.subscriber = function(property) {
            if (this.dependencies.indexOf(property) === -1) {
                this.dependencies.push(property);
            }
            this.wrapped = property;
        }.bind(this);

        this.evaluate(initialValue);
    }
    
    function applyWrapped(args) {
        this.wrapped.apply(this.self, args);
        return this.self;
    }

    return computedPropertyFactory;
});

define('joga/bindings/ElementBinding',['joga/computedProperty'], function (computedProperty) {

    function ElementBinding(element, model) {
        this.element = element;
        this.model = model;
    }

    ElementBinding.removeChildNodes = function (element) {
        while(element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    ElementBinding.prototype.child = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.child.update = function() {
            ElementBinding.removeChildNodes(this.element);
            this.element.appendChild(computed.apply(this.model));
        }.bind(this);

        this.child.update();

        computed.subscribe(this.child.update);
    };

    ElementBinding.prototype.childnodes = function (dataExpression) {
        var i,
            computed = computedProperty(dataExpression),
            nodes = computed.apply(this.model);

        this.childnodes.update = function() {
            ElementBinding.removeChildNodes(this.element);

            for (i = 0; i < nodes.length; i++) {
                this.element.appendChild(nodes[i]);
            }
        }.bind(this);

        this.childnodes.update();

        computed.subscribe(this.childnodes.update);
    };

    ElementBinding.prototype.class = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.class.update = function() {
            if (this.class.lastClassName) {
                this.element.classList.remove(this.class.lastClassName);
            }
            this.class.lastClassName = computed.apply(this.model);
            this.element.classList.add(this.class.lastClassName);
        }.bind(this);

        this.class.update();

        computed.subscribe(this.class.update);
    };

    ElementBinding.prototype.do = function(dataExpression) {
        this.do.dataExpression = dataExpression;
        foreachDo.apply(this);
    };

    ElementBinding.prototype.id = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.id.update = function() {
            this.element.id = computed.apply(this.model);
        }.bind(this);

        this.id.update();

        computed.subscribe(this.id.update);
    };

    function foreachDo() {
        if (this.foreach.dataExpression && this.do.dataExpression) {

            var computed = computedProperty(function () {
                var models = this.foreach.dataExpression.apply(this.model),
                    elements = [],
                    i;
                for (i = 0; i < models.length; i++) {
                    elements.push(this.do.dataExpression.apply(models[i]));
                }
                return elements;
            }.bind(this));

            this.foreach.update = function() {
                var i,
                    nodes = computed();
                ElementBinding.removeChildNodes(this.element);
                for (i = 0; i < nodes.length; i++) {
                    this.element.appendChild(nodes[i]);
                }
            }.bind(this);

            this.foreach.update();

            computed.subscribe(this.foreach.update);
        }
    }

    ElementBinding.prototype.foreach = function(dataExpression) {
        this.foreach.dataExpression = dataExpression;
        foreachDo.apply(this);
    };

    ElementBinding.prototype.onclick = function (dataExpression) {
        this.element.onclick = function (event) {
            event.preventDefault ? event.preventDefault() : event.returnValue = false;
            dataExpression.call(this.model);
        }.bind(this);
    };

    ElementBinding.prototype.text = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.text.update = function() {
            ElementBinding.removeChildNodes(this.element);
            this.element.appendChild(document.createTextNode(computed.apply(this.model)));
        }.bind(this);

        this.text.update();

        computed.subscribe(this.text.update);
    };

    ElementBinding.prototype.title = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.title.update = function() {
            this.element.title = computed.apply(this.model);
        }.bind(this);

        this.title.update();

        computed.subscribe(this.title.update);
    };

    return ElementBinding;
});

define('joga/bindings/HTMLInputElementBinding',['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLInputElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLInputElementBinding.prototype = new ElementBinding();

    HTMLInputElementBinding.prototype.checked = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.checked.update = function() {
            this.element.checked = computed.apply(this.model);
            this.element.onchange = function () {
                computed.applyWrapped([this.element.checked]);
            }.bind(this);
        }.bind(this);

        this.checked.update();

        computed.subscribe(this.checked.update);
    };
    
    HTMLInputElementBinding.prototype.value = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.value.update = function() {
            this.element.value = computed.apply(this.model);
        }.bind(this);

        this.value.update();
        
        this.element.onchange = function () {
            computed.applyWrapped([this.element.value]);
        }.bind(this);

        computed.subscribe(this.value.update);
    };

    return HTMLInputElementBinding;
});

define('joga/elementBinder',['joga/bindings/ElementBinding', 'joga/bindings/HTMLInputElementBinding'], function (ElementBinding, HTMLInputElementBinding) {
    
    function ElementBinder() {
        this.mapping = {
            INPUT: HTMLInputElementBinding
        };
    }
    
    ElementBinder.prototype.bind = function (element, model) {
        var i,
            child,
            dataKey;

        for (i = 0; i < element.childNodes.length; i++) {
            child = element.childNodes[i];
            child.binding = this.bind(child, model);
        }
        
        element.binding = this.create(element, model);

        for (dataKey in element.dataset) {
            element.binding[dataKey] = element.binding[dataKey].bind(element.binding);
            element.binding[dataKey](new Function("return " + element.dataset[dataKey]));
        }
    };
    
    ElementBinder.prototype.create = function (element, model) {
        var factory = ElementBinding;
        
        if (element.tagName in this.mapping) {
            factory = this.mapping[element.tagName];
        }
        
        return new factory(element, model);
    };
    
    return new ElementBinder();
});
define('joga/elementProperty',['joga/objectProperty', 'joga/dependencyTracker', 'joga/elementBinder'], function (objectProperty, dependencyTracker, elementBinder) {

    function elementPropertyFactory(initialValue) {

        function elementProperty(value) {
            return elementProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(elementProperty);

        elementProperty.evaluate = evaluate;

        elementProperty.initialize(initialValue);

        return elementProperty;
    }

    function evaluate(newValue, self) {
        this.self = self;

        if (newValue) {
            this.initialValue = newValue;
            this.value = null;
            return this.self;
        }

        if (this.value === null) {
            dependencyTracker.push(function () {});

            this.value = createElement(this.initialValue);
            
            elementBinder.bind(this.value, this.self);

            dependencyTracker.pop();
        }

        return this.value;
    }

    function createElement(element) {
        var div;

        if (element instanceof Node) {
            return element;
        }

        div = document.createElement("div");
        div.innerHTML = element;
        return div.firstChild;
    }

    return elementPropertyFactory;
});

define('joga/stringProperty',['joga/objectProperty'], function(objectProperty) {
    
    function stringPropertyFactory(initialValue) {
        
        function stringProperty(value) {
            return stringProperty.evaluate(value, this);
        }
        
        objectProperty().mixinTo(stringProperty);
        
        stringProperty.isBlank = isBlank;
        stringProperty.isNotBlank = isNotBlank;
        stringProperty.isEmpty = isEmpty;
        stringProperty.isNotEmpty = isNotEmpty;
        
        stringProperty.initialize(initialValue);
        
        return stringProperty;
    }
    
    function isBlank() {
        return this.applySelf() === null || this.applySelf().trim() === "";
    }

    function isNotBlank() {
        return !this.isBlank();
    }

    function isEmpty() {
        return this.applySelf() === null || this.applySelf() === "";
    }

    function isNotEmpty() {
        return !this.isEmpty();
    }

    return stringPropertyFactory;
});
define('joga',[
    'joga/arrayProperty',
    'joga/booleanProperty',
    'joga/computedProperty',
    'joga/dependencyTracker',
    'joga/bindings/ElementBinding',
    'joga/elementProperty',
    'joga/objectProperty',
    'joga/stringProperty'
],
function (
    arrayProperty,
    booleanProperty,
    computedProperty,
    dependencyTracker,
    ElementBinding,
    elementProperty,
    objectProperty,
    stringProperty
) {
    
    var joga = {
        dependencyTracker: dependencyTracker,
        ElementBinding: ElementBinding,
        arrayProperty: arrayProperty,
        booleanProperty: booleanProperty,
        computedProperty: computedProperty,
        elementProperty: elementProperty,
        objectProperty: objectProperty,
        stringProperty: stringProperty
    };
    
    window.joga = joga;
    
    return joga;
});

require(["joga"]);
}());