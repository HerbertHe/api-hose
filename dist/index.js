'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime_1 = createCommonjsModule(function (module) {
var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var regenerator = runtime_1;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

var asyncToGenerator = _asyncToGenerator;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var classCallCheck = _classCallCheck;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defineProperty = _defineProperty;

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

var arrayLikeToArray = _arrayLikeToArray;

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

var arrayWithoutHoles = _arrayWithoutHoles;

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

var iterableToArray = _iterableToArray;

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

var unsupportedIterableToArray = _unsupportedIterableToArray;

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var nonIterableSpread = _nonIterableSpread;

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

var toConsumableArray = _toConsumableArray;

// 在此生成正则表达式
var BasicType = ["number", "boolean", "string", "undefined", "any", "null"];
var ArrayTypeRegEx = /Array<(\S+)>/;
/**
 * 请求标题正则表达式
 * @param prefix 前缀
 * @param suffix 后缀
 * 默认为 ReqXXXType
 */

var RequestHeadingRegEx = function RequestHeadingRegEx(prefix, suffix) {
  return new RegExp("((?! export).)*\\s*interface\\s*(".concat(prefix, "[A-Za-z0-9\\$\\_]+").concat(suffix, ")\\s*(extends\\s*([A-Za-z0-9\\$\\_\\, ]+))?\\s*\\{ *\\}?\\s*"));
};
/**
 * 普通标题正则表达式
 */

var SimpleHeadingRegEx = new RegExp("((?! export).)*\\s*interface\\s*([A-Za-z0-9\\$\\_]+)\\s*(extends\\s*([A-Za-z0-9\\$\\_\\, ]+))?\\s*\\{ *\\}?\\s*");
/**
 * 类型定义正则表达式单行
 */

var DeclareInlineTypeRegEx = /\s*type\s*([A-Za-z0-9\$\_]+)\s*=\s*([A-Za-z0-9\$\_\|& ]+)/;
/**
 * 类型定义正则表达式多行
 */

var DeclareMultiTypeHeadRegEx = /\s*type\s*([A-Za-z0-9\$\_]+)\s*= */;
/**
 * 通过测试下一项来考虑是否结束
 */

var DeclareMultiTypeContentRegEx = /\s*\| *([A-Za-z0-9\$\_\<\>]+) */;
/**
 * 请求描述正则表达式
 */

var RequestDescRegEx = /\s*\*\s+([^\s]*)/;
/**
 * 请求类型正则表达式
 */

var RequestMethodRegEx = /\s*\*\s*Method:\s*([^\n]*)/;
/**
 * 请求参数正则表达式
 * 如果没有描述的话只有三项
 */

var RequestParamRegEx = /\s*([A-Za-z0-9\$\_]+)(\?)?:\s*(\S+)(\s*\/\/\s*(\s\S+))?/;
/**
 * 处理参数结束正则表达式
 */

var RequestParamsEnd = /\s*\}\s*/;

var tempType = function tempType(type) {
  if (BasicType.includes(type)) {
    return type;
  } else if (ArrayTypeRegEx.test(type)) {
    var ans = ArrayTypeRegEx.exec(type);

    if (BasicType.includes(ans[1])) {
      // 检查标准类型
      return "Array\\<".concat(ans[1], "\\>");
    } else {
      // 自定义类型
      return "Array\\<[".concat(ans[1], "](#").concat(ans[1], ")\\>");
    }
  } else {
    // 自定义类型
    return "[".concat(type, "](#").concat(type, ")");
  }
};
/**
 * 生成文件版权模板
 */


var TempCopyright = function TempCopyright() {
  var array = ["The API Document is generated by api-hose!", "Author: Herbert He<Herbert.He0229@gmail.com>", "License: MIT", "Repo: https://github.com/HerbertHe/api-hose"];
  return array.map(function (item, index) {
    return "<!-- ".concat(item, " -->").concat(index === array.length - 1 ? "\n" : "");
  });
};
/**
 * 文件名模板
 * @param filename 文件名
 */

var TempFilename = function TempFilename(filename) {
  return "# ".concat(filename, "\n");
};
/**
 * 标题名模板
 * @param heading 标题名
 */

var TempHeading = function TempHeading(heading, extendsType, extendsDesc) {
  var _exportExtendsType = extendsType.length !== 0 ? extendsType.map(function (item) {
    return tempType(item);
  }) : [];

  return "## ".concat(heading, "\n").concat(_exportExtendsType.length !== 0 ? "\n> ".concat(extendsDesc, ": ").concat(_exportExtendsType.join(", "), "\n") : "");
};
/**
 * API描述模板
 * @param desc 描述信息
 */

var TempDescription = function TempDescription(desc) {
  return "***".concat(desc, "***\n");
};
/**
 * HTTP请求模板
 * @param prefix 不同语言的前缀
 * @param method 请求的方法
 */

var TempMethod = function TempMethod(prefix, method) {
  return "".concat(prefix, ": `").concat(method, "`\n");
};

var TempAlign = function TempAlign(align) {
  switch (align) {
    case "left":
      return "| :--- | :--- | :--- |";

    case "right":
      return "| ---: | ---: | ---: |";

    case "center":
      return "| :---: | :---: | :---: |";
  }
};
/**
 * 参数表格表头模板
 * @param {Array<string>} head 表头
 * @param {"left" | "right" | "center"} align 表格对齐方式
 */


var TempTableHead = function TempTableHead(head, align) {
  return "| ".concat(head[0], " | ").concat(head[1], " | ").concat(head[2], " |\n").concat(TempAlign(align));
};
/**
 * 参数表格内容模板
 * @param name 参数名
 * @param type 参数类型
 * @param desc 参数描述
 * @param optional 可选描述
 */

var TempTableContent = function TempTableContent(name, type, desc, optional) {
  var exportType = tempType(type);
  return "| ".concat(name, " | ").concat(exportType, " | ").concat(desc).concat(optional ? " (".concat(optional, ")") : "", " |");
};
/**
 * 参数表格结束模板
 */

var TempTableEnd = function TempTableEnd() {
  return "";
};
/**
 * 类型定义与联合类型模板
 * @param heading 定义的类型名称
 * @param types 联合类型数组
 * @param type 区别交叉类型和联合类型
 */

var TempType = function TempType(heading, types, type) {
  var _ansTypes = types.map(function (item) {
    return tempType(item);
  });

  return "## ".concat(heading, "\n\n> ").concat(_ansTypes.join(" ".concat(type === 0 ? "|" : "&", " ")), "\n");
};

var exporter = /*#__PURE__*/function () {
  var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(contentArray, opts) {
    var defaultI18nzhCN, defaultI18nEn, _paramsResArrayTmp, _resArrayTmp, _resUnionTypeTmp, _multiheadTmp;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            defaultI18nzhCN = {
              thead: ["参数", "类型", "说明"],
              optional: "可选的",
              method: "请求方法",
              "extends": "继承"
            };
            defaultI18nEn = {
              thead: ["Params", "Type", "Description"],
              optional: "optional",
              method: "Method",
              "extends": "Extends"
            }; // 临时存放请求参数生成结果的数组, 检测到结束符的时候释放掉

            _paramsResArrayTmp = []; // 临时存放生成结果的数组

            _resArrayTmp = []; // 临时存放多行联合类型的数组

            _resUnionTypeTmp = []; // 多行联合类型的名称

            _multiheadTmp = "";
            contentArray.map(function (item, index) {
              if (index === 0) {
                var _resArrayTmp2;

                (_resArrayTmp2 = _resArrayTmp).push.apply(_resArrayTmp2, toConsumableArray(TempCopyright()).concat([TempFilename(opts.filename)]));
              }

              if (RequestHeadingRegEx(opts.prefix, opts.suffix).test(item)) {
                var _opts$i18n;

                var ans = RequestHeadingRegEx(opts.prefix, opts.suffix).exec(item);
                var extendsType = !!ans[3] ? ans[4].split(",").map(function (item) {
                  return item.trim();
                }) : [];
                var extendsDesc = !!((_opts$i18n = opts.i18n) !== null && _opts$i18n !== void 0 && _opts$i18n["extends"]) ? opts.i18n["extends"] : opts.lang === "en-US" ? defaultI18nEn["extends"] : defaultI18nzhCN["extends"];

                _resArrayTmp.push(TempHeading(ans[2], extendsType, extendsDesc));

                return;
              } else if (SimpleHeadingRegEx.test(item)) {
                var _opts$i18n2;

                var _ans = SimpleHeadingRegEx.exec(item);

                var _extendsType = !!_ans[3] ? _ans[4].split(",").map(function (item) {
                  return item.trim();
                }) : [];

                var _extendsDesc = !!((_opts$i18n2 = opts.i18n) !== null && _opts$i18n2 !== void 0 && _opts$i18n2["extends"]) ? opts.i18n["extends"] : opts.lang === "en-US" ? defaultI18nEn["extends"] : defaultI18nzhCN["extends"];

                _resArrayTmp.push(TempHeading(_ans[2], _extendsType, _extendsDesc));

                return;
              }

              if (RequestMethodRegEx.test(item)) {
                var _opts$i18n3;

                var _ans2 = RequestMethodRegEx.exec(item);

                var method = !!((_opts$i18n3 = opts.i18n) !== null && _opts$i18n3 !== void 0 && _opts$i18n3.method) ? opts.i18n.method : opts.lang === "en-US" ? defaultI18nEn.method : defaultI18nzhCN.method;

                _resArrayTmp.push(TempMethod(method, _ans2[1]));

                return;
              } else if (RequestDescRegEx.test(item)) {
                var _ans3 = RequestDescRegEx.exec(item);

                _resArrayTmp.push(TempDescription(_ans3[1]));

                return;
              }

              if (RequestParamRegEx.test(item)) {
                var _opts$i18n5;

                // 等于零要加表头
                if (_paramsResArrayTmp.length === 0) {
                  var _opts$i18n4;

                  var thead = !!((_opts$i18n4 = opts.i18n) !== null && _opts$i18n4 !== void 0 && _opts$i18n4.thead) ? opts.i18n.thead : opts.lang === "en-US" ? defaultI18nEn.thead : defaultI18nzhCN.thead;

                  _paramsResArrayTmp.push(TempTableHead(thead, opts.align));
                }

                var _ans4 = RequestParamRegEx.exec(item);

                var optional = !!((_opts$i18n5 = opts.i18n) !== null && _opts$i18n5 !== void 0 && _opts$i18n5.thead) ? opts.i18n.optional : opts.lang === "en-US" ? defaultI18nEn.optional : defaultI18nzhCN.optional;

                _paramsResArrayTmp.push(TempTableContent(_ans4[1], _ans4[3], !!_ans4[5] ? _ans4[5] : "", !!_ans4[2] ? optional : ""));

                return;
              }

              if (RequestParamsEnd.test(item)) {
                _resArrayTmp = [].concat(toConsumableArray(_resArrayTmp), toConsumableArray(_paramsResArrayTmp), [TempTableEnd()]);
                _paramsResArrayTmp = [];
                return;
              }

              if (DeclareInlineTypeRegEx.test(item)) {
                // 单行的情况
                var type = 0;
                var types = [];

                var _ans5 = DeclareInlineTypeRegEx.exec(item);

                if (_ans5[2].includes("&")) {
                  types = _ans5[2].split("&").map(function (item) {
                    return item.trim();
                  });
                  type = 1;
                } else {
                  types = _ans5[2].split("|").map(function (item) {
                    return item.trim();
                  });
                  type = 0;
                }

                _resArrayTmp.push(TempType(_ans5[1], types, type));

                return;
              } else if (DeclareMultiTypeHeadRegEx.test(item)) {
                // 多行头
                var heading = DeclareMultiTypeHeadRegEx.exec(item);
                _multiheadTmp = heading[1];
                return;
              } else if (DeclareMultiTypeContentRegEx.test(item)) {
                // 多行内容
                var _type = DeclareMultiTypeContentRegEx.exec(item);

                _resUnionTypeTmp.push(_type[1]); // 判断下一项越界
                // 判断下一项是当前类型


                if (index === contentArray.length || !DeclareMultiTypeContentRegEx.test(contentArray[index + 1])) {
                  _resArrayTmp.push(TempType(_multiheadTmp, _resUnionTypeTmp, 0)); // 释放临时数组


                  _resUnionTypeTmp = [];
                }

                return;
              }
            });
            return _context.abrupt("return", Promise.resolve(_resArrayTmp.join("\n")));

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function exporter(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var APIHose = // 默认配置
function APIHose(content, opts) {
  var _this = this;

  classCallCheck(this, APIHose);

  defineProperty(this, "defaultOpts", {
    filename: "APIHose",
    prefix: "Req",
    suffix: "Type",
    lang: "zh-CN",
    align: "center"
  });

  defineProperty(this, "_opts", {});

  defineProperty(this, "_content", "");

  defineProperty(this, "_contentArray", []);

  defineProperty(this, "getOpt", function (key) {
    return _this._opts[key];
  });

  defineProperty(this, "split", function () {
    _this._contentArray = _this._content.split("\n").filter(function (item) {
      return !!item;
    });
  });

  defineProperty(this, "export", /*#__PURE__*/asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _this.split();

            _context.next = 3;
            return exporter(_this._contentArray, _this._opts);

          case 3:
            return _context.abrupt("return", _context.sent);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));

  this._opts = _objectSpread(_objectSpread({}, this.defaultOpts), opts);
  this._content = content;
} // 获取配置项
;

exports.APIHose = APIHose;
