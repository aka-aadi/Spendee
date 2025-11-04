// Inactivity timer utility
export const setupInactivityTimer = (onInactive, timeoutMinutes = 30) => {
  let timeoutId;
  const timeoutMs = timeoutMinutes * 60 * 1000; // Convert minutes to milliseconds

  const resetTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      onInactive();
    }, timeoutMs);
  };

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  // Events that reset the timer
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  const eventHandlers = events.map(event => {
    const handler = () => resetTimer();
    document.addEventListener(event, handler, { passive: true });
    return { event, handler };
  });

  // Start the timer
  resetTimer();

  // Return cleanup function
  return () => {
    clearTimer();
    eventHandlers.forEach(({ event, handler }) => {
      document.removeEventListener(event, handler);
    });
  };
};
