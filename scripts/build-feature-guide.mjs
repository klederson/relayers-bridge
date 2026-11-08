// Export the website as one local HTML guide. No server or external files needed.
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
let html=await read('site/index.html');
// The offline guide never loads website analytics or its preferences UI.
html=html.replace('<script type="module" src="analytics.js"></script>','');
const css=await read('site/styles.css');
const catalog=await read('site/i18n.js');
let app=await read('site/app.js');
app=app.replace(/^import .*from '\.\/i18n\.js';\s*/,'');
app=app.replace("let language='en'","let language='pt'").replace("locales.includes(saved)?saved:'en'","locales.includes(saved)?saved:'pt'");
const mark='data:image/svg+xml;base64,'+Buffer.from(await read('site/assets/mark.svg')).toString('base64');
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+css+'\n</style>');
const script=(catalog+'\n'+app).replace(/<\/script/gi,'<\\/script');
html=html.replace('<script type="module" src="app.js"></script>','<script type="module">\n'+script+'\n</script>');
html=html.replaceAll('assets/mark.svg',mark);
await writeFile(new URL('docs/feature-guide.html',root),'<!-- Generated from site/ by scripts/build-feature-guide.mjs. The local guide starts in Portuguese. -->\n'+html);
console.log('Standalone guide: docs/feature-guide.html');

