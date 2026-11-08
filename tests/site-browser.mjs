// Website communication and interactive demo checks. No live service calls.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { once } from 'node:events';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';
import { locales, messages, content } from '../site/i18n.js';

const root=resolve('site');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  const file=resolve(root,'.'+(path==='/'?'/index.html':decodeURIComponent(path)));
  if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(data);
 }catch{res.writeHead(404).end();}
});
server.listen(0,'127.0.0.1');await once(server,'listening');
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:process.env.SITE_BROWSER_CHANNEL||'chromium',headless:true});
const errors=[],foreign=[],failed=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(new URL(request.url()).origin!==origin)foreign.push(request.url());});
 page.on('response',response=>{if(response.status()>=400)failed.push(response.status()+' '+new URL(response.url()).pathname);});
 await page.goto(origin);await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 assert.equal(await page.locator('html').getAttribute('lang'),'en');
 assert.equal(await page.locator('.hero-directions').innerText().then(value=>value.includes('WhatsApp')&&value.includes('RELAYERS')),true);
 assert.equal(await page.locator('.faq-item').count(),8);
 assert.equal(await page.locator('.faq-item').nth(0).getAttribute('open')!==null,true);
 assert.equal(await page.locator('.faq-item').nth(1).getAttribute('open')!==null,true);
 const keys=await page.locator('[data-i18n]').evaluateAll(nodes=>[...new Set(nodes.map(node=>node.dataset.i18n))]);
 for(const locale of locales){
  for(const key of keys)assert.equal(typeof messages[locale][key],'string',locale+': missing '+key);
  assert.equal(content[locale].features.length,6);assert.equal(content[locale].controls.length,4);assert.equal(content[locale].faq.length,8);
  assert.ok(content[locale].features.every(item=>item.title&&item.body));
  await page.selectOption('#language',locale);
  assert.equal(await page.locator('h1').innerText(),messages[locale].heroTitle+'\n'+messages[locale].heroAccent);
  assert.equal(await page.locator('.feature-item').count(),6);
  await page.locator('#browser-firefox').click();
  assert.equal(await page.locator('#install-steps li').count(),4);
  assert.equal(await page.locator('#install-note').innerText(),messages[locale].firefoxNote);
  await page.locator('#run-demo').click();
  assert.equal(await page.locator('#demo-output').innerText(),messages[locale].blocked);
  await page.locator('#demo-permission').check();await page.locator('#run-demo').click();
  assert.equal(await page.locator('#demo-output').innerText(),messages[locale].inResult);
  await page.locator('#tab-out').click();
  assert.equal(await page.locator('#demo-permission').isChecked(),false,'IN consent cannot enable OUT');
  await page.locator('#run-demo').click();
  assert.equal(await page.locator('#demo-output').innerText(),messages[locale].blocked);
  await page.locator('#demo-permission').check();await page.locator('#run-demo').click();
  assert.equal(await page.locator('#demo-output').innerText(),messages[locale].outResult);
  await page.locator('#repeat-demo').click();
  assert.equal(await page.locator('#demo-output').innerText(),messages[locale].duplicateResult);
  await page.locator('#browser-chrome').click();
  assert.equal(await page.locator('#install-steps').innerText(),content[locale].install.chrome.join('\n'));
  assert.equal(await page.locator('#install-note').innerText(),messages[locale].chromeNote);
  for(const section of ['.hero','.final-cta']){
   for(const choice of ['chrome','firefox']){
    const link=page.locator(section+' [data-install-browser="'+choice+'"]');
    assert.equal(await link.isVisible(),true,'Both browsers must be offered in '+section);
    assert.equal(await link.innerText().then(text=>text.includes(messages[locale][choice==='chrome'?'tryChrome':'tryFirefox'])),true);
    await link.click();
    assert.equal(await page.locator('#browser-'+choice).getAttribute('aria-selected'),'true','A browser link must select its own instructions');
    assert.equal(await page.locator('#install-steps').innerText(),content[locale].install[choice].join('\n'));
   }
  }
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow: '+locale+' '+width);
  }
  await page.setViewportSize({width:1440,height:1050});
  // Reload resets the illustrative command and permissions; language preference survives.
  await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  assert.equal(await page.locator('html').getAttribute('lang'),locale==='pt'?'pt-BR':locale);
  assert.equal(await page.locator('#demo-permission').isChecked(),false);
 }
 // Exercise the complete page with different browser identities. Detection
 // only suggests a desktop choice; it never hides alternatives or overrides a choice.
 const desktopChrome='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
 const identities=[
  ['Chrome',desktopChrome,'chrome'],
  ['Firefox','Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0','firefox'],
  ['Edge',desktopChrome+' Edg/142.0.0.0',null],
  ['Opera',desktopChrome+' OPR/124.0.0.0',null],
  ['Safari','Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',null],
  ['Chrome on Android','Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/142.0.0.0 Mobile Safari/537.36',null],
  ['Firefox on Android','Mozilla/5.0 (Android 15; Mobile; rv:144.0) Gecko/144.0 Firefox/144.0',null]
 ];
 for(const [name,userAgent,detected] of identities){
  const visitor=await browser.newPage({userAgent});
  visitor.on('pageerror',error=>errors.push(error.message));
  visitor.on('request',request=>{if(new URL(request.url()).origin!==origin)foreign.push(request.url());});
  await visitor.goto(origin);await visitor.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  const selected=detected||'firefox';
  assert.equal(await visitor.locator('#browser-'+selected).getAttribute('aria-selected'),'true',name+': matching instructions');
  for(const section of ['.hero','.final-cta']){
   assert.equal(await visitor.locator(section+' [data-install-browser]').first().getAttribute('data-install-browser'),selected,name+': matching button first');
   assert.equal(await visitor.locator(section+' [data-install-browser="'+selected+'"]').evaluate(node=>!node.classList.contains('button-outline')),true);
  }
  assert.equal(await visitor.locator('#browser-choice').innerText(),detected?messages.en.browserDetected.replace('{browser}',name):messages.en.browserPick);
  const other=selected==='chrome'?'firefox':'chrome';
  await visitor.locator('.hero [data-install-browser="'+other+'"]').click();
  await visitor.selectOption('#language','pt');
  assert.equal(await visitor.locator('#browser-'+other).getAttribute('aria-selected'),'true',name+': manual choice survives language changes');
  assert.equal(await visitor.locator('#install-steps').innerText(),content.pt.install[other].join('\n'));
  await visitor.close();
 }
 await page.selectOption('#language','en');
 await page.locator('#tab-in').focus();await page.keyboard.press('ArrowRight');
 assert.equal(await page.locator('#tab-out').getAttribute('aria-selected'),'true');
 await page.locator('#browser-firefox').focus();await page.keyboard.press('End');
 assert.equal(await page.locator('#browser-chrome').getAttribute('aria-selected'),'true');
 const brokenHashes=await page.locator('a[href^="#"]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')).filter(href=>!document.getElementById(href.slice(1))));
 assert.deepEqual(brokenHashes,[]);
 for(const asset of ['/assets/mark.svg','/assets/social.png','/robots.txt','/sitemap.xml'])assert.equal((await page.request.get(origin+asset)).status(),200);
 await mkdir('artifacts',{recursive:true});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'artifacts/site-desktop.png'});
 await page.selectOption('#language','pt');await page.screenshot({path:'artifacts/site-pt.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/site-mobile.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(foreign,[],'The demo must not contact external services');assert.deepEqual(failed,[]);
 console.log('OK website: explicit IN/OUT, five complete languages, independent demo consent, duplicate-command illustration, Firefox/Chrome instructions, keyboard tabs, 320/390px layouts, social assets and no external calls.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

