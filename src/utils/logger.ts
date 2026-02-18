type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

let currentLevel: LogLevel = 'info'

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function isEnabled(level: LogLevel): boolean {
  return levels[level] >= levels[currentLevel]
}

function log(level: LogLevel, message: string, ...meta: unknown[]): void {
  if (isEnabled(level)) {
    const prefix = `[${timestamp()}] [${level.toUpperCase()}]`
    const consoleFn = level === 'debug' ? console.debug : level === 'info' ? console.info : level === 'warn' ? console.warn : console.error
    consoleFn(`${prefix} ${message}`, ...meta)
  }
}

export const logger = {
  debug: (message: string, ...meta: unknown[]) => log('debug', message, ...meta),
  info: (message: string, ...meta: unknown[]) => log('info', message, ...meta),
  warn: (message: string, ...meta: unknown[]) => log('warn', message, ...meta),
  error: (message: string, ...meta: unknown[]) => log('error', message, ...meta),
  get level() {
    return currentLevel
  },
  set level(value: string) {
    currentLevel = value as LogLevel
  },
}

export function setLogLevel(level: string): void {
  currentLevel = level as LogLevel
}
