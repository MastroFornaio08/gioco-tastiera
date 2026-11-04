/* Bot P2P locali per provare una stanza da dieci sospettati senza dieci telefoni extra. */
(function(){
  const bots=[];
  let filling=false;
  const $=s=>document.querySelector(s);
  function setStatus(message,error=false){const el=$('#bots-status');if(el){el.textContent=message;el.classList.toggle('err',error)}}
  function updateButtons(){const fill=$('#btn-fill-bots'),stop=$('#btn-stop-bots');if(fill)fill.disabled=filling||D.started||onlineCount()>=10;if(stop)stop.disabled=filling||bots.length===0}
  function playerName(id){return D.players[id]?.name||`Giocatore ${id.slice(1)}`}
  function handleBotData(bot,msg){
    if(!msg||!msg.tipo)return;
    if(msg.tipo==='pieno'){setStatus(`${bot.name}: stanza piena.`,true);return}
    if(msg.tipo==='gp'){
      const g=msg.g||{};
      if(g.kind==='hello'){bot.slot=g.id;bot.code=g.code;bot.joined=true;return}
      if(g.kind==='role'){
        bot.card=g.card;
        bot.actOnce=false;
        setTimeout(()=>sendBotDeal(bot),1500+Math.random()*5000);
      }
      if(g.kind==='private-deal')bot.inbox=(bot.inbox||[]).concat(g);
      return;
    }
    if(msg.tipo==='delitto-state'){bot.state=msg.state||null;if(bot.state.phase===3&&!bot.voteOnce)setTimeout(()=>sendBotVote(bot),600+Math.random()*1800)}
  }
  function sendBotVote(bot){if(!bot.conn?.open||!bot.slot||bot.voteOnce||!bot.state)return;const ids=Object.keys(bot.state.players||{});const pick=arr=>arr[Math.floor(Math.random()*arr.length)]||'';bot.conn.send({tipo:'gp',g:{kind:'vote',vote:{killer:pick(ids),partner:pick(ids),method:pick(bot.state.methods||[]),motive:pick(bot.state.motives||[])}}});bot.voteOnce=true}
  function connectBot(index){
    return new Promise((resolve,reject)=>{
      const name=`Bot ${String(index).padStart(2,'0')}`;
      const peerId=`dl-bot-${Rete.codice.toLowerCase()}-${index}-${Date.now().toString(36)}`;
      const peer=new Peer(peerId,PEER_OPTS);
      const bot={name,peer,conn:null,slot:null,joined:false,card:null,inbox:[],state:null};
      bots.push(bot);
      let settled=false;
      const timer=setTimeout(()=>finish(new Error(`${name}: tempo scaduto durante l’accesso.`)),18000);
      function finish(error){if(settled)return;settled=true;clearTimeout(timer);if(error)reject(error);else resolve(bot)}
      peer.on('open',()=>{
        const conn=peer.connect(PREFISSO_ID+Rete.codice,{reliable:true});
        bot.conn=conn;
        conn.on('open',()=>conn.send({tipo:'gp',g:{kind:'join',name}}));
        conn.on('data',msg=>{handleBotData(bot,msg);if(bot.joined)finish()});
        conn.on('error',()=>{});
      });
      peer.on('error',err=>finish(new Error(`${name}: ${err.message||'connessione non riuscita'}`)));
    });
  }
  function sendBotDeal(bot){
    if(!bot.conn?.open||!bot.slot||bot.actOnce||!bot.card)return;
    const state=bot.state||{};
    const players=state.players||D.players;
    let targetId='';
    if(bot.card.partner){targetId=Object.keys(players).find(id=>id!==bot.slot&&players[id]?.name===bot.card.partner)||''}
    if(!targetId){const options=Object.keys(players).filter(id=>id!==bot.slot);targetId=options[Math.floor(Math.random()*options.length)]||''}
    if(!targetId)return;
    const secret=!!bot.card.partner||Math.random()<.45;
    const text=bot.card.partner
      ?`Accordo segreto: so che siamo dalla stessa parte. Possiamo coordinarci.`
      :`Ho un’informazione sul caso. In cambio, mi aiuti a proteggere il mio segreto?`;
    bot.conn.send({tipo:'gp',g:{kind:'deal',to:targetId,text,privacy:secret?'secret':'public'}});
    bot.actOnce=true;
  }
  async function fill(){
    if(!D.host||!Rete.peer||!Rete.codice||D.started){setStatus('Solo il narratore può riempire una stanza prima dell’inizio.',true);return}
    const missing=10-onlineCount();
    if(missing<=0){setStatus('La stanza è già completa.');return}
    filling=true;updateButtons();
    try{
      const firstIndex=bots.length+1;
      for(let i=0;i<missing;i++){
        await connectBot(firstIndex+i);
        updateButtons();
        await new Promise(resolve=>setTimeout(resolve,220));
      }
      setStatus(`Pronto: ${onlineCount()} sospettati collegati (${bots.length} bot di prova). Puoi iniziare come narratore.`);
    }catch(error){setStatus(error.message||'Non è stato possibile collegare tutti i bot.',true)}
    finally{filling=false;updateButtons();if(typeof renderRoom==='function')renderRoom()}
  }
  function stop(){
    const removed=bots.length;
    bots.splice(0).forEach(bot=>{try{if(bot.peer&&!bot.peer.destroyed)bot.peer.destroy()}catch(e){}});
    updateButtons();
    if(removed)setStatus(`Rimossi ${removed} bot di prova.`);
  }
  $('#btn-fill-bots')?.addEventListener('click',fill);
  $('#btn-stop-bots')?.addEventListener('click',stop);
  window.DelittoBots={fill,stop,refresh:updateButtons,get count(){return bots.length}};
  window.addEventListener('beforeunload',stop);
  updateButtons();
})();
