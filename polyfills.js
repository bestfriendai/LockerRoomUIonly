// Global polyfills for React Native compatibility
// This file ensures browser APIs and TypeScript helpers are available before any other code runs

console.log('[Polyfills] Initializing...');

// Import tslib helpers directly into global scope
try {
  const tslib = require('tslib');
  
  // Ensure tslib helpers are globally available on all possible global objects
  const globals = [
    typeof global !== 'undefined' ? global : null,
    typeof globalThis !== 'undefined' ? globalThis : null,
    typeof window !== 'undefined' ? window : null,
    typeof self !== 'undefined' ? self : null,
    this
  ].filter(Boolean);

  // Copy all tslib exports to global objects
  globals.forEach(g => {
    if (g && typeof g === 'object') {
      Object.keys(tslib).forEach(key => {
        if (key.startsWith('__')) {
          g[key] = tslib[key];
        }
      });
    }
  });

  console.log('[Polyfills] tslib helpers loaded successfully');
} catch (e) {
  console.error('[Polyfills] Failed to load tslib:', e.message);
  
  // Fallback: Define TypeScript helpers manually if tslib fails
  (function() {
    'use strict';

    // Helper function for setting up prototype chain
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
      return extendStatics(d, b);
    };

    // The main __extends function
    var __extends = function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    // __assign helper
    var __assign = function() {
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };

    // __rest helper
    var __rest = function (s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
            t[p[i]] = s[p[i]];
        }
      return t;
    };

    // __spreadArrays helper
    var __spreadArrays = function () {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
      return r;
    };

    // Set helpers on all possible global objects
    var globals = [
      typeof global !== 'undefined' ? global : null,
      typeof globalThis !== 'undefined' ? globalThis : null,
      typeof window !== 'undefined' ? window : null,
      typeof self !== 'undefined' ? self : null,
      this
    ].filter(Boolean);

    globals.forEach(function(g) {
      if (g && typeof g === 'object') {
        g.__extends = __extends;
        g.__assign = __assign;
        g.__rest = __rest;
        g.__spreadArrays = __spreadArrays;
      }
    });

    console.log('[Polyfills] Manual TypeScript helpers defined');
  })();
}

// Create robust window polyfill
(function() {
  'use strict';
  
  // Store critical functions that must always be available
  const noop = function() {};
  const returnTrue = function() { return true; };
  
  // Ensure window exists
  if (typeof window === 'undefined') {
    global.window = global;
  }
  
  // Force-define critical window methods with getters
  const criticalMethods = {
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: returnTrue,
    requestAnimationFrame: function(callback) { return setTimeout(callback, 16); },
    cancelAnimationFrame: function(id) { clearTimeout(id); }
  };
  
  // Define each method as a getter that always returns a function
  Object.keys(criticalMethods).forEach(function(method) {
    try {
      Object.defineProperty(global.window, method, {
        get: function() {
          return criticalMethods[method];
        },
        set: function() {
          // Silently ignore attempts to overwrite
          console.warn('[Polyfills] Attempt to overwrite window.' + method + ' blocked');
        },
        configurable: false,
        enumerable: true
      });
    } catch (e) {
      // Fallback: just assign the function
      global.window[method] = criticalMethods[method];
    }
  });
  
  // Also ensure these are on global directly for compatibility
  if (typeof global !== 'undefined') {
    Object.keys(criticalMethods).forEach(function(method) {
      if (!global[method]) {
        global[method] = criticalMethods[method];
      }
    });
  }
})();

// Polyfill document object
if (typeof document === 'undefined') {
  global.document = {
    createElement: function() { return {}; },
    createElementNS: function() { return {}; },
    getElementsByTagName: function() { return []; },
    getElementsByClassName: function() { return []; },
    getElementById: function() { return null; },
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() { return true; },
    documentElement: {
      style: {}
    },
    head: {
      appendChild: function() {}
    },
    body: {
      appendChild: function() {}
    },
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; }
  };
}

// Polyfill navigator object
if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'React Native',
    platform: 'iOS',
    appVersion: '1.0.0',
    product: 'ReactNative',
    vendor: 'Apple',
    onLine: true
  };
}

// Polyfill location object
if (typeof location === 'undefined') {
  global.location = {
    href: '',
    protocol: 'https:',
    host: 'localhost',
    hostname: 'localhost',
    port: '8081',
    pathname: '/',
    search: '',
    hash: '',
    reload: function() {},
    replace: function() {},
    assign: function() {}
  };
}

// Polyfill localStorage and sessionStorage
if (typeof localStorage === 'undefined') {
  const storagePolyfill = {
    _data: {},
    getItem: function(key) { return this._data[key] || null; },
    setItem: function(key, value) { this._data[key] = String(value); },
    removeItem: function(key) { delete this._data[key]; },
    clear: function() { this._data = {}; },
    key: function(index) { 
      const keys = Object.keys(this._data);
      return keys[index] || null;
    },
    get length() { return Object.keys(this._data).length; }
  };
  global.localStorage = storagePolyfill;
}

if (typeof sessionStorage === 'undefined') {
  const sessionStoragePolyfill = {
    _data: {},
    getItem: function(key) { return this._data[key] || null; },
    setItem: function(key, value) { this._data[key] = String(value); },
    removeItem: function(key) { delete this._data[key]; },
    clear: function() { this._data = {}; },
    key: function(index) { 
      const keys = Object.keys(this._data);
      return keys[index] || null;
    },
    get length() { return Object.keys(this._data).length; }
  };
  global.sessionStorage = sessionStoragePolyfill;
}

// Verify TypeScript helpers are available
(function() {
  const requiredHelpers = ['__extends', '__assign', '__rest'];
  const missingHelpers = [];
  
  requiredHelpers.forEach(helper => {
    if (typeof global[helper] === 'undefined') {
      missingHelpers.push(helper);
    }
  });
  
  if (missingHelpers.length > 0) {
    console.error('[Polyfills] WARNING: Missing TypeScript helpers:', missingHelpers.join(', '));
  } else {
    console.log('[Polyfills] All TypeScript helpers verified');
  }
})();

// Final verification and protection of window methods
(function() {
  if (typeof window !== 'undefined') {
    const windowMethods = ['addEventListener', 'removeEventListener', 'dispatchEvent'];
    windowMethods.forEach(method => {
      if (typeof window[method] !== 'function') {
        console.error(`[Polyfills] ERROR: window.${method} is not a function`);
        // Force fix it
        window[method] = function() {};
      }
    });
    
    // Set up a continuous protector that runs after all imports
    setTimeout(function protectWindow() {
      windowMethods.forEach(method => {
        if (typeof window[method] !== 'function') {
          console.warn(`[Polyfills] Repairing window.${method}`);
          window[method] = function() {};
        }
      });
    }, 0);
  }
})();

console.log('[Polyfills] Initialization complete');