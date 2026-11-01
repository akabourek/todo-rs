const log=[];
const pickOk=(want)=>{const i=st.opts.findIndex(o=>!!o.ok===want);document.querySelectorAll('#q-opts .opt')[i].click();};
document.getElementById('setup').requestSubmit();
log.push('start ids='+st.ids.length);
for(let n=0;n<st.ids.length;n++){ pickOk(true); document.getElementById('next').click(); }
log.push('allok='+document.getElementById('r-score').textContent+' resultVisible='+!document.getElementById('result').hidden+' missHidden='+document.getElementById('r-miss-card').hidden+' retryHidden='+document.getElementById('retry').hidden+' rows='+document.querySelectorAll('#r-table tr').length);
document.getElementById('restart').click();
document.getElementById('setup').requestSubmit();
for(let n=0;n<st.ids.length;n++){ pickOk(false); document.getElementById('next').click(); }
log.push('allbad='+document.getElementById('r-score').textContent+' miss='+document.querySelectorAll('#r-miss details').length+' retry='+document.getElementById('retry').textContent+' ferris='+document.getElementById('r-ferris').getAttribute('href'));
document.getElementById('retry').click();
log.push('retry ids='+st.ids.length+' uniq='+new Set(st.ids).size);
// klávesy: 1 odpoví, další stisk už nic nezmění
document.dispatchEvent(new KeyboardEvent('keydown',{key:'1'}));
const a1=st.answers.length; document.dispatchEvent(new KeyboardEvent('keydown',{key:'b'}));
log.push('keys answers='+a1+'->'+st.answers.length+' focusNext='+(document.activeElement.id==='next'));
document.getElementById('stop').click();
log.push('stop score='+document.getElementById('r-score').textContent);
document.getElementById('restart').click();
// rychlý režim + filtr lekcí
document.querySelector('input[value=quick]').checked=true;
document.querySelectorAll('input[name=lesson]').forEach(c=>{c.checked=c.value==='5';});
document.getElementById('setup').dispatchEvent(new Event('change'));
log.push('filter all='+document.getElementById('count-all').textContent+' quick='+document.getElementById('count-quick').textContent);
document.getElementById('setup').requestSubmit();
log.push('quick ids='+st.ids.length+' lessons='+[...new Set(st.ids.map(i=>QUESTIONS[i].l))].join());
document.getElementById('stop').click(); document.getElementById('restart').click();
// vybrané nic => tlačítko vypnuté
document.querySelectorAll('input[name=lesson]').forEach(c=>{c.checked=false;});
document.getElementById('setup').dispatchEvent(new Event('change'));
log.push('none disabled='+document.getElementById('go').disabled);
// náhodnost možností: správná na všech pozicích
const pos=new Set();for(let i=0;i<200;i++){pos.add(shuffle(QUESTIONS[0].opts).findIndex(o=>o.ok));}
log.push('ok positions='+[...pos].sort().join());
log.push('checks stripped='+QUESTIONS.every(q=>!('checks' in q)));
document.title=log.join(' || ');
