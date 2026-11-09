import {execFileSync} from 'node:child_process';
import {readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
// Reuse the public protocol helper, never a private backend implementation.
await writeFile('examples/service-desk/wire.mjs',await readFile('extension/bridge/wire.js'));
await writeFile('examples/service-desk/LICENSE',await readFile('LICENSE'));
await mkdir('site/downloads',{recursive:true});
const archive=resolve('site/downloads/relayers-tutorial-desk.zip');
await rm(archive,{force:true});
execFileSync('zip',['-q','-X',archive,'server.mjs','wire.mjs','index.html','app.js','style.css','README.md','LICENSE','Open-Windows.cmd','Open-macOS.command','Open-Linux.sh'],{cwd:resolve('examples/service-desk')});
console.log('Tutorial desk: site/downloads/relayers-tutorial-desk.zip');
