// Set up performance monitoring
performance.mark('app-init')

if (window.self !== window.top) {
  // We're in an iframe
  // 1. Immediately disable HMR WebSocket
  window.__NEXT_HMR_LATENCY_CB = null;
  window.__NEXT_HMR_CB = null;

  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function (url, protocols) {
    if (url && url.includes('/_next/webpack-hmr')) {
      return {
        url: url,
        addEventListener: function () { },
        removeEventListener: function () { },
        dispatchEvent: function () { return true; },
        send: function () { },
        close: function () { },
        onopen: null,
        onclose: null,
        onerror: null,
        onmessage: null
      };
    }
    return new OriginalWebSocket(url, protocols);
  };
  window.__NEXT_ERROR_OVERLAY_GLOBAL_HOOK__ = {
    ReactDevOverlay: null,
    initialState: { nextJsVersion: '', buildId: '' },
    initialDisplayState: { preventFallback: false },
    onUnhandledError: () => { },
    onUnhandledRejection: () => { },
    register: () => { },
  };

  // 4. Prevent Next.js API calls
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    if (url && typeof url === 'string' &&
      (url.includes('__nextjs_original-stack-frames') ||
        url.includes('/_next/'))) {
      // Return a resolved promise with empty response
      return Promise.resolve(new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return originalFetch.apply(this, arguments);
  };
}
 
window.addEventListener('error', (event) => {
    // Post to parent
    window.parent.postMessage({
        type: 'CONTAINER_APP_ERROR',
        message: event.message,
        source: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        error: event.error?.stack
    }, '*');
})

window.addEventListener('unhandledrejection', (event) => {
  window.parent.postMessage({
    type: 'CONTAINER_APP_ERROR',
    error: 'Unhandled Promise Rejection',
    reason: event.reason?.stack || String(event.reason),
    message: event.reason?.message
  }, '*');
});

// Store a reference to the original console.error function.
const originalConsoleError = console.error;

console.error = function (...args) {
  originalConsoleError.apply(console, args);
  
  try {
    let message = '';
    let stack = '';
    let source = '';
    
    // Handle different ways errors can be passed to console.error
    if (args.length > 0) {
      // Case 1: First arg is an Error object
      if (args[0] instanceof Error) {
        message = args[0].message;
        stack = args[0].stack;
      } 
      // Case 2: String message with possible error object later
      else if (typeof args[0] === 'string') {
        message = args[0];
        
        // Look for Error objects in other arguments
        for (let i = 1; i < args.length; i++) {
          if (args[i] instanceof Error) {
            stack = args[i].stack;
            break;
          }
        }
      }
      // Case 3: Object with error properties
      else if (typeof args[0] === 'object' && args[0] !== null) {
        if (args[0].message) message = args[0].message;
        if (args[0].stack) stack = args[0].stack;
        if (args[0].error) {
          const errorObj = args[0].error;
          if (typeof errorObj === 'string') message = errorObj;
          else if (errorObj && errorObj.message) message = errorObj.message;
        }
      }
      
      // Try to determine source from the stack or other args
      const stackLines = stack ? stack.split('\n') : [];
      if (stackLines.length > 1) {
        source = stackLines[1].trim();
      }
      
      // Check for webpack paths in any string arguments
      for (const arg of args) {
        if (typeof arg === 'string' && arg.includes('webpack-internal:')) {
          if (!source) source = arg;
          if (arg.includes('Error:') && !message) {
            message = arg;
          }
        }
      }
    }

    // Handle JSON stringified errors
    if (!message && args.some(arg => typeof arg === 'string' && arg.includes('"error":'))) {
      for (const arg of args) {
        if (typeof arg === 'string') {
          try {
            const parsed = JSON.parse(arg);
            if (parsed.error) message = typeof parsed.error === 'string' ? parsed.error : parsed.error.message || 'JSON error object';
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    }

    // Safe stringify for rawArgs
    const safeStringify = (obj) => {
      try {
        return String(obj);
      } catch (e) {
        return '[Object with circular references]';
      }
    };

    window.parent.postMessage({
      type: 'CONTAINER_APP_ERROR',
      message: message || 'Console error captured',
      source: source || 'unknown',
      error: stack || safeStringify(args[0]),
      rawArgs: args.map(safeStringify)
    }, '*');
  } catch (loggingError) {
    originalConsoleError('Error in console.error override:', loggingError);
  }
};