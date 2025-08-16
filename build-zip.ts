import { logFileSize } from "@remvst/js13k-tools";
import { spawn } from 'child_process';
import yargs from 'yargs/yargs';
import { archiveFile } from "zip-lib";

const argv = yargs(process.argv.slice(2)).options({
    html: { type: 'string', demandOption: true },
    zip: { type: 'string', default: null },
    optimize: { type: 'boolean', default: false },
}).parse();

(async () => {
    console.log('Zipping...');
    await archiveFile(argv.html, argv.zip);
    await logFileSize(argv.zip, 13 * 1024);

    if (argv.optimize) {
        console.log('Running advzip...');
        await new Promise<void>((resolve, reject) => {
            const subprocess = spawn('advzip', ['-z', argv.zip, '--shrink-insane']);

            subprocess.stderr.on('data', (data) => {
                console.error('stderr: ' + data);
            });

            subprocess.on('exit', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject('advzip failed with error code ' + code);
                }
            });
        });
        await logFileSize(argv.zip, 13 * 1024);

        console.log('Running ect...');
        await new Promise<void>((resolve, reject) => {
            // Guess I'm hardcoding this :p
            const subprocess = spawn('./Efficient-Compression-Tool/build/ect', [
                '-zip',
                argv.zip,
                '-9',
                '-strip',
            ]);

            subprocess.on('exit', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject('ect failed with error code ' + code);
                }
            });
        });
        await logFileSize(argv.zip, 13 * 1024);
    }
})();
