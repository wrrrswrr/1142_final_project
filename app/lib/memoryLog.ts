export function appendMemoryLog(src: string) {
  try {
    const stored = localStorage.getItem('game-memory-log');
    const log: string[] = stored ? JSON.parse(stored) : [];
    if (!log.includes(src)) {
      log.push(src);
      localStorage.setItem('game-memory-log', JSON.stringify(log));
      window.dispatchEvent(new Event('memory-log-update'));
    }
  } catch {}
}
