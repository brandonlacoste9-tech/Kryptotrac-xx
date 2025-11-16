export const haptics = {
  // Micro-feedback for button presses
  light: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5)
    }
  },

  // Medium feedback for actions
  medium: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20)
    }
  },

  // Success pattern (two short pulses)
  success: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 20, 30])
    }
  },

  // Error pattern (single long pulse)
  error: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(200)
    }
  },

  // Price alert - Big move detected (quick buzz → BIG buzz)
  priceAlert: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 200])
    }
  },

  // Portfolio up (victory pattern)
  portfolioUp: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  },

  // Portfolio down (warning pulse)
  portfolioDown: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200])
    }
  },

  // BB interaction - starts typing
  bbTyping: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  },

  // BB finishes response ("I got you" signature buzz)
  bbFinished: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 20, 30])
    }
  },

  // Refresh pattern (pull-to-refresh satisfaction)
  refresh: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 10, 20])
    }
  },

  // Critical alert (URGENT pattern like slot machine jackpot)
  critical: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 300])
    }
  },

  // Opportunity detected (pay attention buzz)
  opportunity: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }
  },

  // BB tip alert pattern
  bbTip: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 100])
    }
  },
}
