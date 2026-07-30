import util from 'util';

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LEVEL_SEVERITY: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'session_token',
  'sessionToken',
  'qr_token',
  'qrToken',
  'authorization',
  'cookie',
]);

function redactSensitive(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(redactSensitive);
  }
  if (obj instanceof Error) {
    return {
      message: obj.message,
      stack: obj.stack,
      name: obj.name,
    };
  }
  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

class Logger {
  private baseContext: Record<string, any>;
  private minLevelVal: number;
  private isProd: boolean;

  constructor(baseContext: Record<string, any> = {}) {
    this.baseContext = baseContext;
    const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
    this.minLevelVal = LEVEL_SEVERITY[envLevel] || LEVEL_SEVERITY.info;
    this.isProd = process.env.NODE_ENV === 'production';
  }

  child(extraContext: Record<string, any>): Logger {
    return new Logger({ ...this.baseContext, ...extraContext });
  }

  private log(level: LogLevel, arg1: any, arg2?: any, ...args: any[]) {
    if (LEVEL_SEVERITY[level] < this.minLevelVal) return;

    const timestamp = new Date().toISOString();
    let data: Record<string, any> = {};
    let message = '';

    if (typeof arg1 === 'string') {
      message = util.format(arg1, arg2, ...args);
    } else if (typeof arg1 === 'object' && arg1 !== null) {
      data = redactSensitive(arg1);
      if (typeof arg2 === 'string') {
        message = util.format(arg2, ...args);
      }
    }

    const logPayload = {
      level,
      time: timestamp,
      ...this.baseContext,
      ...data,
      ...(message ? { msg: message } : {}),
    };

    if (this.isProd) {
      const output = JSON.stringify(logPayload);
      if (level === 'error' || level === 'fatal') {
        process.stderr.write(output + '\n');
      } else {
        process.stdout.write(output + '\n');
      }
    } else {
      const moduleTag = this.baseContext.module ? ` [${this.baseContext.module}]` : '';
      const levelUpper = level.toUpperCase().padEnd(5);
      const coloredMsg = `${timestamp} ${levelUpper}${moduleTag}: ${message}`;
      const hasData = Object.keys(data).length > 0;
      if (level === 'error' || level === 'fatal') {
        console.error(coloredMsg, hasData ? data : '');
      } else if (level === 'warn') {
        console.warn(coloredMsg, hasData ? data : '');
      } else {
        console.log(coloredMsg, hasData ? data : '');
      }
    }
  }

  trace(arg1: any, arg2?: any, ...args: any[]) { this.log('trace', arg1, arg2, ...args); }
  debug(arg1: any, arg2?: any, ...args: any[]) { this.log('debug', arg1, arg2, ...args); }
  info(arg1: any, arg2?: any, ...args: any[]) { this.log('info', arg1, arg2, ...args); }
  warn(arg1: any, arg2?: any, ...args: any[]) { this.log('warn', arg1, arg2, ...args); }
  error(arg1: any, arg2?: any, ...args: any[]) { this.log('error', arg1, arg2, ...args); }
  fatal(arg1: any, arg2?: any, ...args: any[]) { this.log('fatal', arg1, arg2, ...args); }
}

const logger = new Logger({ service: 'rong-plan-api', env: process.env.NODE_ENV || 'development' });

export default logger;
export const createChildLogger = (moduleName: string) => logger.child({ module: moduleName });
