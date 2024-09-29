import { ConsoleLogger, Injectable } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import { promises as fsPromises } from 'fs';

@Injectable()
export class CloggerService extends ConsoleLogger {
  async logToFile(entry) {
    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/New_York',
    }).format(new Date())}\t${entry}\n`;

    try {
      if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'));
      }

      await fsPromises.appendFile(
        path.join(__dirname, '..', '..', 'logs', 'output.log'),
        formattedEntry,
      );
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  }
  log(message: any, context?: string) {
    const entry = `${context}\t${message}`;

    this.logToFile(entry);
    super.log(entry);
  }
  error(message: any, stackOrContext?: string) {
    const entry = `${stackOrContext}\t${message}`;

    this.logToFile(entry);
    super.error(message, stackOrContext);
  }
}
