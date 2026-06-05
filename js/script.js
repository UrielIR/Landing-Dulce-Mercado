/* ============================================
   PRODUCTOS
   ============================================ */
const PRODUCTS = [
    {
        id: 1,
        name: "Alfajor Clásico",
        desc: "Tradicional alfajor relleno con generoso dulce de leche artesanal. Un clásico que encanta a todos.",
        qty: "25 unidades",
        price: 11990,
        tag: "Más vendido",
        image: "img/productos/alfajor-clasico.png"
    },
    {
        id: 2,
        name: "Alfajor Ganache de Chocolate",
        desc: "Exquisito alfajor relleno con una cremosa ganache de chocolate semi-amargo. Sabor intenso y premium.",
        qty: "25 unidades",
        price: 13990,
        tag: "Popular",
        image: "img/productos/alfajor-ganache.png"
    },
    {
        id: 3,
        name: "Alfajor Manjar Maracuyá",
        desc: "Fusión perfecta entre el dulzor del manjar y el toque ácido del maracuyá real. Una experiencia única.",
        qty: "25 unidades",
        price: 13990,
        tag: "Nuevo",
        image: "img/productos/alfajor-maracuya.png"
    },
    {
        id: 4,
        name: "Trufas Artesanales",
        desc: "Suaves trufas de chocolate elaboradas con ingredientes seleccionados. Textura irresistible que se funde en el paladar.",
        qty: "30 unidades",
        price: 6490,
        tag: null,
        image: "img/productos/trufas.png"
    },
    {
        id: 5,
        name: "Cocadas Tradicionales",
        desc: "Clásicas cocadas con el sabor auténtico del coco natural y la dulzura justa. Ideales para compartir.",
        qty: "30 unidades",
        price: 4990,
        tag: null,
        image: "img/productos/cocadas.png"
    },
    {
        id: 6,
        name: "Cuchuflí Relleno",
        desc: "Barquillos crujientes rellenos con abundante dulce de leche de campo. El favorito de grandes y chicos.",
        qty: "30 unidades",
        price: 5490,
        tag: null,
        image: "img/productos/cuchufli.png"
    }
];

/* ============================================
   CONFIGURACIÓN HERO CAROUSEL
   ============================================ */
const HERO_IMAGES = [
    "img/productos/alfajor-ganache.png",
    "img/productos/alfajor-clasico.png",
    "img/productos/alfajor-maracuya.png",
    "img/productos/trufas.png",
    "img/productos/cocadas.png",
    "img/productos/cuchufli.png"
];

function initHeroSlider() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    // Renderizamos las imágenes del carrusel
    slider.innerHTML = HERO_IMAGES.map((img, i) =>
        `<img src="${img}" alt="Producto Dulce Conexion" class="hero-slide ${i===0?'active':''}">`
    ).join('');

    const slides = slider.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;

    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
}

const SHIPPING = 3990;
const MP_PUBLIC_KEY = "APP_USR-1c815107-1d63-4272-b2d6-441d47cab54b";
const MP_BACKEND_URL = "http://localhost:3000";
let cart = [];
let mp = null;

/* ============================================
   LOCALSTORAGE
   ============================================ */
function loadCart() {
    try { const s = localStorage.getItem('dm_cart'); if(s) cart = JSON.parse(s); } catch(e){ cart=[]; }
}
function saveCart() { localStorage.setItem('dm_cart', JSON.stringify(cart)); }

function initMercadoPago() {
    if (window.MercadoPago) {
        mp = new MercadoPago(MP_PUBLIC_KEY, { locale: 'es-CL' });
    }
}

function buildPaymentItems() {
    const items = cart.map(item => ({
        title: item.name,
        quantity: item.qty,
        unit_price: item.price,
        currency_id: 'CLP'
    }));
    if (cart.length) {
        items.push({
            title: 'Despacho Región Metropolitana',
            quantity: 1,
            unit_price: SHIPPING,
            currency_id: 'CLP'
        });
    }
    return items;
}

async function createPreference(payload) {
    const res = await fetch(`${MP_BACKEND_URL}/create_preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Error al crear la preferencia' }));
        throw new Error(error.message || 'Error al crear la preferencia');
    }
    return res.json();
}

/* ============================================
   RENDER PRODUCTOS
   ============================================ */
function renderProducts() {
    const g = document.getElementById('productGrid');
    if(!g) return;
    g.innerHTML = PRODUCTS.map((p,i) => `
        <div class="product-card reveal reveal-d${(i%3)+1}">
            <div class="product-img-wrap">
                <img src="${p.image}" alt="${p.name} — ${p.qty}" loading="lazy">
                ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
            </div>
            <div class="product-body">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="product-meta-row">
                    <span class="product-unit">
                        <i data-lucide="package" style="width:13px;height:13px;"></i>
                        ${p.qty}
                    </span>
                    <span class="product-price">$${p.price.toLocaleString('es-CL')} <small>CLP</small></span>
                </div>
                <button class="btn-add" id="ab-${p.id}" onclick="addToCart(${p.id})">
                    <i data-lucide="plus" style="width:17px;height:17px;"></i>
                    Agregar al carrito
                </button>
            </div>
        </div>
    `).join('');
    safeCreateIcons();
}

/* ============================================
   CARRITO LOGIC
   ============================================ */
function addToCart(id) {
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    const ex = cart.find(x=>x.id===id);
    if(ex) ex.qty++; else cart.push({id:p.id,name:p.name,price:p.price,qty:1,image:p.image});
    saveCart(); updateUI();
    showToast(p.name + ' agregado');
    const b = document.getElementById('ab-'+id);
    if(b){
        b.classList.add('added');
        b.innerHTML='<i data-lucide="check" style="width:17px;height:17px;"></i> Agregado';
        safeCreateIcons();
        setTimeout(()=>{
            b.classList.remove('added');
            b.innerHTML='<i data-lucide="plus" style="width:17px;height:17px;"></i> Agregar al carrito';
            safeCreateIcons();
        },1400);
    }
}

function removeFromCart(id) {
    cart = cart.filter(x=>x.id!==id);
    saveCart(); updateUI();
}

function changeQty(id, d) {
    const item = cart.find(x=>x.id===id);
    if(!item) return;
    item.qty += d;
    if(item.qty <= 0) { removeFromCart(id); return; }
    saveCart(); updateUI();
}

function total() { return cart.reduce((s,i)=>s+i.price*i.qty, 0); }
function count() { return cart.reduce((s,i)=>s+i.qty, 0); }

/* ============================================
   UPDATE UI
   ============================================ */
function updateUI() {
    const c = count();
    const t = total();
    const ft = t + (c>0 ? SHIPPING : 0);

    // Badges
    ['navBadge','fabBadge'].forEach(id=>{
        const el = document.getElementById(id);
        if(el){ el.textContent=c; c>0?el.classList.add('show'):el.classList.remove('show'); }
    });

    // Count in header
    const cartCountEl = document.getElementById('cartCount');
    if(cartCountEl) cartCountEl.textContent = c>0 ? `(${c})` : '';

    const body = document.getElementById('cartBody');
    const foot = document.getElementById('cartFoot');

    if(!cart.length) {
        if(body) body.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon"><i data-lucide="shopping-bag" style="width:26px;height:26px;"></i></div>
                <p>Tu carrito está vacío</p>
                <p>Agrega productos para comenzar</p>
            </div>`;
        if(foot) foot.style.display='none';
        safeCreateIcons();
        return;
    }

    if(foot) foot.style.display='block';
    if(body) body.innerHTML = cart.map(i=>`
        <div class="cart-item">
            <img src="${i.image}" alt="${i.name}" class="ci-img">
            <div class="ci-info">
                <div class="ci-name">${i.name}</div>
                <div class="ci-price">$${(i.price*i.qty).toLocaleString('es-CL')}</div>
                <div class="ci-controls">
                    <button class="ci-qty-btn" onclick="changeQty(${i.id},-1)" aria-label="Menos">−</button>
                    <span class="ci-qty">${i.qty}</span>
                    <button class="ci-qty-btn" onclick="changeQty(${i.id},1)" aria-label="Más">+</button>
                </div>
            </div>
            <button class="icon-btn ci-remove" onclick="removeFromCart(${i.id})" aria-label="Eliminar">
                <i data-lucide="trash-2" style="width:15px;height:15px;"></i>
            </button>
        </div>
    `).join('');

    const cfSubtotal = document.getElementById('cfSubtotal');
    const cfShip = document.getElementById('cfShip');
    const cfTotal = document.getElementById('cfTotal');
    if(cfSubtotal) cfSubtotal.textContent = '$'+t.toLocaleString('es-CL');
    if(cfShip) cfShip.textContent = c>0 ? '$'+SHIPPING.toLocaleString('es-CL') : '$0';
    if(cfTotal) cfTotal.textContent = '$'+ft.toLocaleString('es-CL');
    safeCreateIcons();
}

/* ============================================
   CART OPEN / CLOSE
   ============================================ */
function openCart() {
    const overlay = document.getElementById('cartOverlay');
    const sidebar = document.getElementById('cartSidebar');
    if(overlay) overlay.classList.add('open');
    if(sidebar) sidebar.classList.add('open');
    document.body.style.overflow='hidden';
}
function closeCart() {
    const overlay = document.getElementById('cartOverlay');
    const sidebar = document.getElementById('cartSidebar');
    if(overlay) overlay.classList.remove('open');
    if(sidebar) sidebar.classList.remove('open');
    document.body.style.overflow='';
}

/* ============================================
   CHECKOUT
   ============================================ */
function openCheckout() {
    if(!cart.length) return;
    closeCart();
    const coTotal = document.getElementById('coTotal');
    if(coTotal) coTotal.textContent = '$'+(total()+SHIPPING).toLocaleString('es-CL');
    setTimeout(()=>{
        const overlay = document.getElementById('checkoutOverlay');
        if(overlay) overlay.classList.add('open');
        document.body.style.overflow='hidden';
    },380);
}
function closeCheckout() {
    const overlay = document.getElementById('checkoutOverlay');
    if(overlay) overlay.classList.remove('open');
    document.body.style.overflow='';
}

async function processPayment(e) {
    e.preventDefault();
    let ok=true;
    const n=document.getElementById('cName'),
          ph=document.getElementById('cPhone'),
          em=document.getElementById('cEmail'),
          ad=document.getElementById('cAddr');

    [n,ph,em,ad].forEach(i=>{ if(i) i.classList.remove('err'); });
    document.querySelectorAll('.fg-err').forEach(i=>i.classList.remove('show'));

    if(!n || !n.value.trim()){ if(n) n.classList.add('err'); const eName = document.getElementById('eName'); if(eName) eName.classList.add('show'); ok=false; }
    if(!ph || !ph.value.trim()||ph.value.replace(/\D/g,'').length<8){ if(ph) ph.classList.add('err'); const ePhone = document.getElementById('ePhone'); if(ePhone) ePhone.classList.add('show'); ok=false; }
    if(!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())){ if(em) em.classList.add('err'); const eEmail = document.getElementById('eEmail'); if(eEmail) eEmail.classList.add('show'); ok=false; }
    if(!ad || !ad.value.trim()){ if(ad) ad.classList.add('err'); const eAddr = document.getElementById('eAddr'); if(eAddr) eAddr.classList.add('show'); ok=false; }
    if(!ok) return;

    const btn = document.getElementById('btnPay');
    if(btn){
        btn.disabled=true;
        btn.innerHTML=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Creando pago...`;
    }

    const currentUrl = window.location.href.split('#')[0];
    const payload = {
        items: buildPaymentItems(),
        payer: {
            name: n.value.trim(),
            email: em.value.trim(),
            phone: {
                area_code: '56',
                number: ph.value.replace(/\D/g,'')
            }
        },
        shipments: { cost: SHIPPING, mode: 'not_specified' },
        back_urls: {
            success: currentUrl,
            failure: currentUrl,
            pending: currentUrl
        },
        auto_return: 'approved',
        external_reference: em.value.trim()
    };

    try {
        const data = await createPreference(payload);
        if (data.init_point) {
            window.location.href = data.init_point;
            return;
        }
        throw new Error('No se pudo obtener la URL de pago.');
    } catch (error) {
        console.error(error);
        showToast('No se pudo iniciar el pago. Revisa tu conexión o intenta más tarde.');
        if(btn){
            btn.disabled=false;
            btn.innerHTML='<i data-lucide="lock" style="width:17px;height:17px;"></i> Pagar de forma segura';
        }
        safeCreateIcons();
    }
}

function closeSuccess() {
    const overlay = document.getElementById('successOverlay');
    if(overlay) overlay.classList.remove('open');
    document.body.style.overflow='';
}

/* ============================================
   TOAST
   ============================================ */
function showToast(msg) {
    const c = document.getElementById('toastBox');
    if(!c) return;
    const t = document.createElement('div');
    t.className='toast';
    t.innerHTML=`<i data-lucide="check-circle" style="width:16px;height:16px;flex-shrink:0;color:var(--gold-400);"></i>${msg}`;
    c.appendChild(t);
    safeCreateIcons();
    setTimeout(()=>{ if(t.parentNode) t.remove(); },3000);
}

/* ============================================
   NAVBAR SCROLL
   ============================================ */
window.addEventListener('scroll', ()=>{
    const navbar = document.getElementById('navbar');
    if(navbar) navbar.classList.toggle('scrolled', window.scrollY>20);
}, {passive:true});

/* ============================================
   SCROLL REVEAL
   ============================================ */
function initReveal() {
    if(!('IntersectionObserver' in window)){
        // Fallback: make elements visible
        document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
        return;
    }
    const obs = new IntersectionObserver(entries=>{
        entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
    }, {threshold:0.08, rootMargin:'0px 0px -30px 0px'});
    document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

function safeCreateIcons(){
    if(typeof lucide !== 'undefined' && lucide && typeof lucide.createIcons === 'function'){
        try{ lucide.createIcons(); }catch(e){ console.warn('lucide.createIcons error', e); }
    }
}

/* ============================================
   ESCAPE KEY
   ============================================ */
document.addEventListener('keydown', e=>{
    if(e.key!=='Escape') return;
    const successOverlay = document.getElementById('successOverlay');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    if(successOverlay && successOverlay.classList.contains('open')) closeSuccess();
    else if(checkoutOverlay && checkoutOverlay.classList.contains('open')) closeCheckout();
    else if(cartSidebar && cartSidebar.classList.contains('open')) closeCart();
});

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', ()=>{
    loadCart();
    renderProducts();
    updateUI();
    initReveal();
    initHeroSlider();
    initMercadoPago();
    safeCreateIcons();
});
