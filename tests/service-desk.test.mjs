import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {randomUUID,randomBytes,createHmac} from 'node:crypto';
import {WebSocketServer} from 'ws';
import {createDesk} from '../examples/service-desk/server.mjs';
import {signFrame,createFrameVerifier} from '../extension/bridge/wire.js';
process.env.RELAYERS_DESK_TEST='1';
test('the tutorial desk receives only its own signed IN and sends a scoped reply once with OUT credentials',async()=>{
 const connection=randomUUID(),inId=randomUUID(),outId=randomUUID(),daemon=randomUUID(),eventId=randomUUID(),secret='a'.repeat(64),key=randomBytes(32);
 let client,subscribe,command,outHeaders,outCount=0, refreshCount=0, expired=true;
 const apiServer=createServer(async(req,res)=>{
  let raw='';for await(const part of req)raw+=part;
  let data;
  if(req.url==='/v1/auth/device/code') data={device_code:'qa-device',user_code:'TEST-1234',verification_uri_complete:'https://panel.relayers.app/auth/device?user_code=TEST-1234',expires_in:600};
  else if(req.url==='/v1/auth/device/token')data={access_token:'qa-access',refresh_token:'qa-refresh'};
  else if(req.url==='/v1/auth/refresh') {refreshCount++;assert.equal(JSON.parse(raw).refresh_token,'qa-refresh');data={access_token:'qa-renewed',refresh_token:'qa-renewed-refresh'};}
  else if(req.url==='/v1/endpoints/?per_page=100') {if(expired){expired=false;res.writeHead(401,{'Content-Type':'application/json'}).end(JSON.stringify({error:{code:'unauthorized'}}));return;}assert.equal(req.headers.authorization,'Bearer qa-renewed');data=[{id:inId,public_id:'desk-in',slug:'whatsapp-in-'+connection},{id:outId,public_id:'desk-out',slug:'whatsapp-out-'+connection}];}
  else if(req.url==='/v1/webhooks/desk-out') {outCount++;outHeaders=req.headers;command=JSON.parse(raw);assert.equal(req.headers.authorization,undefined);assert.equal(req.headers['x-relayers-signature'],createHmac('sha256',secret).update(raw).digest('hex'));data={event_id:eventId};}
  else if(req.url===`/v1/events/${eventId}/deliveries`)data=[{status:'success',response_body:JSON.stringify({status:'accepted'})}];
  else if(req.url===`/v1/daemons/${daemon}/`&&req.method==='DELETE')data={};
  else {res.writeHead(404).end('{}');return;}
  res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({data}));
 });
 const ws=new WebSocketServer({server:apiServer});const frames=[];
 ws.on('connection',socket=>{client=socket;const verify=createFrameVerifier(key);socket.on('message',async raw=>{const frame=JSON.parse(raw);frames.push(frame);if(frame.type==='auth'){assert.equal(frame.token,'qa-access');socket.send(JSON.stringify({type:'auth_ok',daemon_id:daemon,session_key:key.toString('base64')}));}else{await verify(frame);if(frame.type==='subscribe')subscribe=frame;}});});
 await new Promise(resolve=>apiServer.listen(0,'127.0.0.1',resolve));const api=`http://127.0.0.1:${apiServer.address().port}`;
 const desk=await createDesk({port:0,api});
 try{
  const home=await fetch(desk.url),cookie=home.headers.get('set-cookie').split(';')[0];assert.equal(home.status,200);
  assert.ok((await home.text()).includes('Balcão de pedidos'));
  const post=async(path,body={})=>{const response=await fetch(desk.url+path,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie,Origin:desk.url},body:JSON.stringify(body)});return {status:response.status,body:await response.json()};};
  assert.equal((await fetch(desk.url+'/state')).status,403);
  assert.equal((await fetch(desk.url+'/state',{headers:{Cookie:cookie,Origin:'https://unrelated.invalid'}})).status,403);
  assert.equal((await post('/auth/start')).status,200);assert.equal((await post('/auth/poll')).body.state,'connected');
  assert.equal((await post('/configure',{inUrl:api+'/v1/webhooks/desk-in',outUrl:'https://unrelated.invalid/v1/webhooks/desk-out',secret})).status,400);
  assert.equal((await post('/configure',{inUrl:api+'/v1/webhooks/desk-in',outUrl:api+'/v1/webhooks/desk-out',secret})).status,200);
  assert.equal(refreshCount,1,'Expired API access is renewed once without retrying message sends');
  await new Promise(resolve=>setTimeout(resolve,20));assert.deepEqual(subscribe.endpoint_ids,[inId]);
  const payload={schema:'relayers.whatsapp.v1',type:'message.received',eventId:randomUUID(),connectionId:connection,accountId:'12025550000@c.us',chatId:'12025550140@c.us',text:'Is my order ready?'};
  async function deliver(overrides={}){client.send(JSON.stringify(await signFrame(key,{type:'deliver',endpoint_id:inId,url:desk.url+'/messages',method:'POST',body:Buffer.from(JSON.stringify(payload)).toString('base64'),delivery_id:randomUUID(),...overrides})));await new Promise(resolve=>setTimeout(resolve,50));}
  await deliver({url:'http://127.0.0.1:1/private'});assert.equal(desk.state().messages.length,0);
  await deliver({endpoint_id:randomUUID()});assert.equal(desk.state().messages.length,0);
  await deliver();await deliver();assert.equal(desk.state().messages.length,1);assert.equal(desk.state().messages[0].text,payload.text);
  assert.deepEqual(frames.filter(f=>f.type==='deliver_resp').map(f=>f.status_code),[400,400,204,204]);
  const requestId=randomUUID(),input={id:payload.eventId,text:'Your order is ready for pickup.',requestId};
  assert.equal((await post('/reply',input)).body.status,'queued');assert.equal((await post('/reply',input)).body.status,'queued');assert.equal(outCount,1);
  assert.equal(command.commandId,requestId);assert.equal(command.connectionId,connection);assert.equal(command.chatId,payload.chatId);assert.equal(command.accountId,payload.accountId);assert.equal(command.type,'message.send');assert.equal(outHeaders['x-idempotency-key'],requestId);assert.ok(Date.parse(command.expiresAt)>Date.now());
  assert.equal((await post('/reply',{...input,text:'Changed'})).status,400);assert.equal(outCount,1);
  assert.equal((await post('/results')).body.messages[0].replies[0].status,'accepted');
  assert.doesNotMatch(JSON.stringify(desk.state()),/qa-access|qa-refresh|1202555|aaaaaaaaaa|signing_secret/);
  assert.equal((await post('/disconnect')).body.state,'disconnected');assert.equal(desk.state().messages.length,0);
 }finally{await desk.close();for(const socket of ws.clients)socket.terminate();await new Promise(resolve=>ws.close(resolve));await new Promise(resolve=>apiServer.close(resolve));}
});

test('two loopback desks keep independent cookies even in the same browser host',async()=>{
 const first=await createDesk({port:0}),second=await createDesk({port:0});
 try{
  assert.notEqual(first.state().daemonName,second.state().daemonName,'Each desk needs its own selectable name');
  const a=await fetch(first.url),b=await fetch(second.url);
  const firstCookie=a.headers.get('set-cookie').split(';')[0],secondCookie=b.headers.get('set-cookie').split(';')[0];
  assert.notEqual(firstCookie.split('=')[0],secondCookie.split('=')[0]);
  const sharedBrowserCookies=firstCookie+'; '+secondCookie;
  for(const desk of [first,second]){
   const response=await fetch(desk.url+'/state',{headers:{Cookie:sharedBrowserCookies}});
   assert.equal(response.status,200);
   assert.equal((await response.json()).state,'disconnected');
  }
  assert.equal((await fetch(second.url+'/state',{headers:{Cookie:firstCookie}})).status,403);
 }finally{await first.close();await second.close();}
});
