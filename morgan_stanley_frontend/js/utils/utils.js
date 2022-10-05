var lib = window.lib || { }

lib.utils = (function() {
  'use strict'

  function makeEventListenerFactory(element) {
    const handlers = []
    function addEventListener(event, eventHandler) {
      const handler = element.addEventListener(event, eventHandler)
      handlers.push({ event: event, handler: handler })
    }
    return { handlers: handlers, addEventListener: addEventListener }
  }

  return {
    dom: { makeEventListenerFactory: makeEventListenerFactory }
  }
}())
