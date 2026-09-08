const SUB_LABELS = {"baloes": {"flutuante": "Flutuantes", "mesa": "Balão de Mesa", "bubble": "Bubble", "idade": "Idade", "cacho": "Cachos & Arranjos", "revelacao": "Chá Revelação", "topo": "Topo & Mini"}, "cestas": {"chocolate": "Doces & Chocolates", "pelucia": "Pelúcia & Carinho", "flores": "Flores", "bebida": "Bebidas", "bebe": "Chá de Bebê"}, "cafes": {"manha": "Café da Manhã", "kids": "Kids", "frios": "Caixa de Frios", "bebidas": "Bebidas & Petiscos"}};

// ---- Routing between home/catalogo ----
function route(){
  const hash = location.hash || '#/';
  const isCatalog = hash.startsWith('#/catalogo');
  document.querySelectorAll('[data-page]').forEach(s=>s.classList.remove('active'));
  document.querySelector(`[data-page="${isCatalog ? 'catalogo' : 'home'}"]`).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
  window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});

  if(isCatalog){
    const qs = hash.split('?')[1];
    const params = new URLSearchParams(qs || '');
    const tipo = params.get('tipo') || 'todos';
    setType(tipo, false);
  }
}
window.addEventListener('hashchange', route);
document.querySelectorAll('[data-nav-link]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    location.hash = a.getAttribute('href');
    route();
  });
});
document.querySelectorAll('[data-scroll]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const targetId = a.getAttribute('href');
    if(location.hash.startsWith('#/catalogo')){
      location.hash = '#/';
      setTimeout(()=>{
        document.querySelector(targetId)?.scrollIntoView({behavior:'smooth'});
      }, 30);
    } else {
      document.querySelector(targetId)?.scrollIntoView({behavior:'smooth'});
    }
  });
});

// ---- Filters ----
let currentType = 'todos';
let currentSub = 'todos';

function buildSubButtons(type){
  const wrap = document.getElementById('subfilters');
  const inner = document.getElementById('subfilters-inner');
  inner.innerHTML = '';
  if(type === 'todos'){
    wrap.classList.remove('show');
    return;
  }
  wrap.classList.add('show');
  const all = document.createElement('button');
  all.className = 'filter-btn sub-btn active';
  all.dataset.sub = 'todos';
  all.textContent = 'Todos';
  all.addEventListener('click', ()=>setSub('todos'));
  inner.appendChild(all);

  const labels = SUB_LABELS[type] || {};
  Object.keys(labels).forEach(key=>{
    const btn = document.createElement('button');
    btn.className = 'filter-btn sub-btn';
    btn.dataset.sub = key;
    btn.textContent = labels[key];
    btn.addEventListener('click', ()=>setSub(key));
    inner.appendChild(btn);
  });
}

function setType(type, updateHash=true){
  currentType = type;
  currentSub = 'todos';
  document.querySelectorAll('.type-btn').forEach(b=>b.classList.toggle('active', b.dataset.type === type));
  buildSubButtons(type);
  applyFilters();
  if(updateHash){
    location.hash = type === 'todos' ? '#/catalogo' : `#/catalogo?tipo=${type}`;
  }
}

function setSub(sub){
  currentSub = sub;
  document.querySelectorAll('.sub-btn').forEach(b=>b.classList.toggle('active', b.dataset.sub === sub));
  applyFilters();
}

function applyFilters(){
  const cards = document.querySelectorAll('#grid .card');
  let visible = 0;
  cards.forEach(c=>{
    const matchType = currentType === 'todos' || c.dataset.type === currentType;
    const matchSub = currentSub === 'todos' || c.dataset.sub === currentSub;
    const show = matchType && matchSub;
    if(show){
      c.style.display = '';
      c.style.animation = 'none';
      c.style.opacity = '0';
      c.style.transform = 'translateY(14px)';
      const delay = Math.min(visible, 10) * 0.045;
      requestAnimationFrame(()=>{
        c.style.animation = `revealUp .5s ${delay}s cubic-bezier(.22,.9,.32,1) both`;
      });
      visible++;
    } else {
      c.style.display = 'none';
    }
  });
  let empty = document.getElementById('empty-state');
  if(visible === 0){
    if(!empty){
      empty = document.createElement('div');
      empty.id = 'empty-state';
      empty.className = 'empty-state';
      empty.textContent = 'Nenhum modelo encontrado para esse filtro.';
      document.getElementById('grid').appendChild(empty);
    }
  } else if(empty){
    empty.remove();
  }
}

document.querySelectorAll('.type-btn').forEach(b=>{
  b.addEventListener('click', ()=>setType(b.dataset.type));
});

// ---- Scroll reveal ----
if(window.matchMedia('(prefers-reduced-motion: no-preference)').matches){
  document.querySelectorAll('.features, .type-grid, #sobre .stats').forEach(el=>el.classList.add('reveal-stagger'));
  const revealTargets = document.querySelectorAll('.who-grid > div, .cta-band, .catalog-hero > .wrap > *, .reveal-stagger');
  revealTargets.forEach(el=>el.classList.add('reveal'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.14, rootMargin:'0px 0px -40px 0px'});
  revealTargets.forEach(el=>io.observe(el));
}

route();