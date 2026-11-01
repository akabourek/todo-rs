const bad=[];document.getElementById('setup').requestSubmit();
QUESTIONS.forEach((q,i)=>{begin([i]);answer(st.opts.findIndex(o=>o.ok));
 const t=document.getElementById('q-card')||document.getElementById('quiz');
 if(/\*\*|`|\*[a-z]/i.test([...t.querySelectorAll('h2,.opt-text:not(:has(.opt-code)),.fb-body p')].map(e=>{const c=e.cloneNode(true);c.querySelectorAll('code').forEach(x=>x.remove());return c.textContent;}).join(' ')))bad.push(i);});
document.title='nezpracovaná značka v otázkách: '+(bad.length?bad.join():'žádná');
