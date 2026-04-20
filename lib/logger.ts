import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'system.log');

export class Logger {
  private static formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  }

  private static appendToLog(level: string, message: string) {
    const formatted = this.formatMessage(level, message);
    
    // In serverless environments, we also want to see it in console
    if (level === 'error') {
      console.error(formatted.trim());
    } else {
      console.log(formatted.trim());
    }

    try {
      fs.appendFileSync(LOG_FILE, formatted);
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  static info(message: string) {
    this.appendToLog('info', message);
  }

  static error(message: string) {
    this.appendToLog('error', message);
  }

  static warn(message: string) {
    this.appendToLog('warn', message);
  }

  static async getRecentLogs(limit: number = 50): Promise<string[]> {
    try {
      if (!fs.existsSync(LOG_FILE)) return [];
      
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      const lines = content.trim().split('\n');
      return lines.slice(-limit).reverse();
    } catch (err) {
      console.error('Failed to read log file:', err);
      return [`[ERROR] Failed to read logs: ${err}`];
    }
  }
}
