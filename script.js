const menuButton=document.querySelector('.menu-button');const nav=document.querySelector('#nav');if(menuButton){menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',open);menuButton.textContent=open?'Close':'Menu';});}document.querySelector('#year').textContent=new Date().getFullYear();const copyButton=document.querySelector('.copy-button');const copyStatus=document.querySelector('.copy-status');const checklist=`Quantamorph RFQ

Part description:
Quantity:
Drawing/model attached (PDF, DXF or STEP):
Material and finish:
Tolerances or critical requirements:
Required delivery date:
Additional notes:`;if(copyButton){copyButton.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(checklist);copyStatus.textContent='RFQ checklist copied.';}catch{copyStatus.textContent='Please copy the checklist manually.';}});}