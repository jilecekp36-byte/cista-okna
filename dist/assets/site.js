(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('hlavni-menu');
  const closeMenu = () => { if(!nav || !toggle) return; nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Otevřít menu'); };
  if(toggle && nav) {
    toggle.addEventListener('click', () => { const open=nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open?'Zavřít menu':'Otevřít menu'); });
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',event=>{if(event.key==='Escape') closeMenu();});
    document.addEventListener('click',event=>{if(!event.target.closest('.site-header')) closeMenu();});
    window.matchMedia('(min-width:801px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
  }
  const form=document.getElementById('quote-form');
  if(!form) return;
  const status=document.getElementById('form-status');
  const button=document.getElementById('quote-submit');
  let busy=false;
  const fail=message=>{status.textContent=message;status.focus();};
  form.querySelectorAll('input,textarea').forEach(field=>field.addEventListener('input',()=>field.setCustomValidity('')));
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy) return;
    for(const field of form.querySelectorAll('[required]')){
      field.value=field.value.trim();
      field.setCustomValidity(field.value?'':'Vyplňte prosím toto pole.');
    }
    if(!form.reportValidity())return;
    status.textContent='';
    // Netlify removes data-netlify when it has detected and registered the form.
    // A local file or an unprocessed deployment must never pretend to send a request.
    if(location.protocol==='file:' || form.hasAttribute('data-netlify')){
      fail('Formulář v tomto náhledu není připojený k odesílání. Napište nám na info@cista-okna.eu nebo zavolejte na +420 732 686 010.');
      return;
    }
    busy=true;button.disabled=true;button.setAttribute('aria-busy','true');
    const previous=button.innerHTML;button.textContent='Odesíláme…';
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
    try{
      const data=new URLSearchParams();
      for(const [key,value] of new FormData(form))data.append(key,String(value).trim());
      const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data.toString(),signal:controller.signal,credentials:'same-origin'});
      if(!response.ok)throw new Error('submission-not-confirmed');
      location.assign(form.getAttribute('action'));
    }catch(error){
      fail('Odeslání se nepodařilo potvrdit. Vyplněné údaje zůstaly ve formuláři. Pro ověření nebo domluvu nám napište na info@cista-okna.eu nebo zavolejte na +420 732 686 010.');
    }finally{
      clearTimeout(timeout);busy=false;button.disabled=false;button.removeAttribute('aria-busy');button.innerHTML=previous;
    }
  });
})();