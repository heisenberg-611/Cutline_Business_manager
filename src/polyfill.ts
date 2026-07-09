if (typeof window === 'undefined') {
  if (typeof navigator !== 'undefined' && !navigator.userAgent) {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'node.js',
      configurable: true
    })
  }
}
