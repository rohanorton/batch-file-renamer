import chalk from 'chalk';
import { map } from 'lodash/fp';

const logger = {
    // default log level is silent!
    level: 0,

    init({ level, colour }) {
        this.colour = !!colour;
        const levelMap = { debug: 4, log: 3, warn: 2, error: 1, silent: 0 };
        this.level = levelMap[level] || 0;
    },
    debug(...args) {
        if (this.level < 4) return;
        if (this.colour) args = map(chalk.gray, args);
        console.log(...args);
    },
    log(...args) {
        if (this.level < 3) return;
        console.log(...args);
    },
    warn(...args) {
        if (this.level < 2) return;
        if (this.colour) args = map(chalk.yellow, args);
        console.log(...args);
    },
    error(...args) {
        if (this.level < 1) return;
        if (this.colour) args = map(chalk.red.bold, args);
        console.log(...args);
    }
};

export default logger;
