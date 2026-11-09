import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createDesk} from '../examples/service-desk/server.mjs';
const desk=await createDesk({port:0}),otherDesk=await createDesk({port:0});
const browser=await chromium.launch({channel:process.env.SITE_BROWSER_CHANNEL||'chromium',headless:true});
try{
 const context=await browser.newContext();const external=[],errors=[];
 await context.route('**/*',route=>{if([desk.url,otherDesk.url].includes(new URL(route.request().url()).origin))return route.continue();external.push(route.request().url());return route.abort();});
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(desk.url);await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 for(const language of ['pt','en']){
  await page.locator('#language').selectOption(language);
  assert.equal(await page.locator('html').getAttribute('lang'),language);
  assert.equal(await page.locator('#connect').isVisible(),true);
  assert.equal(await page.locator('#ready').isVisible(),false);
  assert.equal(await page.locator('#save').isDisabled(),true,'Do not offer a save before the desk account is connected');
  assert.equal(await page.locator('#secret').getAttribute('type'),'password');
  assert.ok((await page.locator('footer').innerText()).includes(language==='pt'?'memória':'memory'));
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${language} at ${width}`);
  }
 }
 await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 assert.equal(await page.locator('html').getAttribute('lang'),'en','Keep the user language choice');
 const otherPage=await context.newPage();await otherPage.goto(otherDesk.url);await otherPage.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 for(const address of [desk.url,otherDesk.url])assert.equal((await page.request.get(address+'/state')).status(),200,'The same browser can control local and remote desks without replacing their cookies');
 const state=await(await page.request.get(desk.url+'/state')).json();assert.equal(state.authenticated,false);assert.deepEqual(state.messages,[]);
 assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 console.log('OK tutorial desk: starts without an account, protects the sending key, blocks premature setup, keeps language choice and fits mobile/desktop. No external requests or sends.');
}finally{await browser.close();await desk.close();await otherDesk.close();}
