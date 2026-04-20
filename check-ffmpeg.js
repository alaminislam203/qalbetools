const { exec } = require('child_process');

console.log('>>> [System Check] Checking for FFmpeg presence...');

// Try common paths and version check
const commands = [
    'ffmpeg -version',
    'which ffmpeg',
    'whereis ffmpeg',
    '/usr/bin/ffmpeg -version',
    '/usr/local/bin/ffmpeg -version'
];

async function runCheck() {
    for (const cmd of commands) {
        console.log(`\nTesting command: "${cmd}"`);
        try {
            const result = await new Promise((resolve, reject) => {
                exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        resolve({ success: false, msg: error.message });
                    } else {
                        resolve({ success: true, msg: stdout.split('\n')[0] });
                    }
                });
            });
            
            if (result.success) {
                console.log('✅ Found/Success:', result.msg);
            } else {
                console.log('❌ Failed:', result.msg.substring(0, 50) + '...');
            }
        } catch (e) {
            console.log('❌ Error executing command');
        }
    }
}

runCheck();
