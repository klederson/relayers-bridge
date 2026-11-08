import { locales, messages, content } from './i18n.js';
const $=selector=>document.querySelector(selector);
let language='en', browser='firefox', direction='in', permissions={in:false,out:false}, outSent=false, result='waiting';
try {const requested=new URL(location.href).searchParams.get('lang');const saved=localStorage.getItem('relayersBridgeSiteLanguage');language=locales.includes(requested)?requested:locales.includes(saved)?saved:'en';}catch {}
const text=(tag,value,className)=>{const node=document.createElement(tag);node.textContent=value;if(className)node.className=className;return node;};
function renderCards(){
 const c=content[language];
 $('#feature-grid').replaceChildren(...c.features.map(item=>{const article=document.createElement('article');article.className='feature-item';const icon=text('span',item.icon,'feature-icon');icon.setAttribute('aria-hidden','true');article.append(icon,text('h3',item.title),text('p',item.body));return article;}));
 $('#control-list').replaceChildren(...c.controls.map((item,index)=>{const div=document.createElement('div');div.className='control-item';const number=text('span',String(index+1).padStart(2,'0'),'control-number');number.setAttribute('aria-hidden','true');const body=document.createElement('div');body.append(text('h3',item.title),text('p',item.body));div.append(number,body);return div;}));
 const opened=[...document.querySelectorAll('.faq-item')].map(node=>node.open);
 $('#faq-list').replaceChildren(...c.faq.map((item,index)=>{const details=document.createElement('details');details.className='faq-item';details.open=opened[index]??index<2;details.append(text('summary',item.title),text('p',item.body));return details;}));
}
function renderInstall(){
 const t=messages[language];
 for(const button of document.querySelectorAll('[data-browser]'))button.setAttribute('aria-selected',String(button.dataset.browser===browser));
 $('#install-steps').setAttribute('aria-labelledby','browser-'+browser);
 $('#install-steps').replaceChildren(...content[language].install[browser].map(step=>text('li',step)));
 $('#install-note').textContent=t[browser+'Note'];
}
function renderDemo(){
 const t=messages[language],incoming=direction==='in';
 for(const button of document.querySelectorAll('[data-direction]'))button.setAttribute('aria-selected',String(button.dataset.direction===direction));
 $('#demo-panel').setAttribute('aria-labelledby','tab-'+direction);
 $('#demo-permission').checked=permissions[direction];
 $('#permission-copy').textContent=t[incoming?'permissionIn':'permissionOut'];
 $('#run-demo-label').textContent=t[incoming?'runIn':'runOut'];
 $('#demo-message-label').textContent=t[incoming?'messageIn':'messageOut'];
 $('#demo-message-text').textContent=t[incoming?'sampleQuestion':'sampleAnswer'];
 $('#console-heading').textContent=t.whatHappens;
 $('#repeat-demo').hidden=incoming||!outSent;
 $('#demo-output').textContent=t[result];
 $('#demo-output').className='console-body'+(result==='blocked'?' blocked':result==='waiting'?'':' success');
}
function render(){
 const t=messages[language];
 document.documentElement.lang=language==='pt'?'pt-BR':language;
 for(const node of document.querySelectorAll('[data-i18n]')){const value=t[node.dataset.i18n];if(typeof value!=='string')throw new Error('Missing translation: '+node.dataset.i18n);node.textContent=value;}
 $('#language').value=language;
 document.title='RELAYERS Bridge — '+t.heroTitle+' '+t.heroAccent;
 document.querySelector('meta[name="description"]').content=t.heroLead;
 renderCards();renderInstall();renderDemo();
 document.documentElement.dataset.ready='true';
}
$('#language').addEventListener('change',event=>{language=event.target.value;try{localStorage.setItem('relayersBridgeSiteLanguage',language);const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);}catch{}render();});
for(const button of document.querySelectorAll('[data-browser]'))button.addEventListener('click',()=>{browser=button.dataset.browser;renderInstall();});
for(const link of document.querySelectorAll('[data-install-browser]'))link.addEventListener('click',()=>{browser=link.dataset.installBrowser;renderInstall();});
for(const button of document.querySelectorAll('[data-direction]'))button.addEventListener('click',()=>{direction=button.dataset.direction;result='waiting';renderDemo();});
$('#demo-permission').addEventListener('change',event=>{permissions[direction]=event.target.checked;result='waiting';renderDemo();});
function run(){if(!permissions[direction])result='blocked';else if(direction==='in')result='inResult';else if(outSent)result='duplicateResult';else{outSent=true;result='outResult';}renderDemo();}
$('#run-demo').addEventListener('click',run);$('#repeat-demo').addEventListener('click',run);
for(const group of document.querySelectorAll('[role="tablist"]'))group.addEventListener('keydown',event=>{const tabs=[...group.querySelectorAll('[role="tab"]')],index=tabs.indexOf(document.activeElement);if(index<0)return;let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();tabs[next].click();});
render();

