/* ============================================================
 *  BCT — ЛОГИКА САЙТА (js/script.js)
 *  ----------------------------------------------------------
 *  Что делает этот файл:
 *    • открывает/закрывает мобильное бургер-меню
 *    • рендерит карточки каталога, услуг, доставки
 *    • запускает слайдеры (на главной и в карточках)
 *    • открывает модалку «Подробнее» с характеристиками товара
 *
 *  Обычно сюда лезть не нужно — почти весь контент
 *  настраивается в js/data.js. См. EDITING_GUIDE.md.
 * ============================================================ */


/* ======================== УТИЛИТЫ ======================== */

/** Текущий путь до корня сайта.
 *  Подставляется в src картинок, чтобы они корректно
 *  работали и с главной (index.html), и со страниц
 *  внутри подпапки (catalog/roofing.html и т.д.) */
function getPathPrefix() {
  // Все страницы внутри /catalog/ должны лезть на уровень выше
  return location.pathname.includes('/catalog/') ? '../' : '';
}

/** Строит WhatsApp-ссылку с предзаполненным текстом */
function waLink(text) {
  const num = BCT.contacts.phone.replace(/\D/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/** Строит mailto-ссылку для запроса консультации */
function mailtoConsult(subject) {
  return `mailto:${BCT.contacts.email}`
       + `?subject=${encodeURIComponent(subject)}`
       + `&body=${encodeURIComponent('Имя:\nТелефон:\nВопрос:\n')}`;
}

/** Безопасное экранирование HTML (для значений из data.js) */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================
 *  ИНДЕКС ТОВАРОВ (для быстрого поиска по id)
 *  Заполняется при инициализации, используется в openModalById.
 * ============================================================ */
const PRODUCT_INDEX = {};
function buildProductIndex() {
  BCT.catalog.forEach(cat => {
    cat.items.forEach(item => {
      PRODUCT_INDEX[item.id] = { item, category: cat };
    });
  });
}


/* ======================== ХЕДЕР / МЕНЮ ======================== */

function initHeader() {
  const burger   = document.getElementById('burger');
  const drawer   = document.getElementById('drawer');
  const backdrop = document.getElementById('backdrop');
  if (!burger) return;

  function openDrawer()  {
    drawer.classList.add('open');
    backdrop.removeAttribute('hidden');
    burger.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.setAttribute('hidden', '');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', openDrawer);
  backdrop.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  // Год в футере
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}


/* ======================== СЛАЙДЕР ======================== */
/** Универсальный слайдер изображений.
 *  Контейнер должен содержать <img> и опционально кнопки .slider-arrow.prev/.next */
function initSlider(container) {
  if (!container) return;
  const imgs = Array.from(container.querySelectorAll('img'));
  if (!imgs.length) return;

  let cur = 0;
  imgs.forEach((img, i) => img.classList.toggle('active', i === 0));

  function show(n) {
    imgs[cur].classList.remove('active');
    cur = (n + imgs.length) % imgs.length;
    imgs[cur].classList.add('active');
    // Обновляем подпись hero-слайдера, если есть
    const cap = container.closest('.hero-slider')?.querySelector('.slider-caption');
    if (cap && BCT.heroSlides[cur]) {
      cap.querySelector('.cap-title').textContent = BCT.heroSlides[cur].title;
      cap.querySelector('.cap-sub').textContent   = BCT.heroSlides[cur].sub;
    }
  }

  container.querySelectorAll('.slider-arrow').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      show(cur + (btn.classList.contains('next') ? 1 : -1));
    });
  });

  // Авто-слайд только для hero
  if (container.classList.contains('hero-slider')) {
    setInterval(() => show(cur + 1), 4500);
  }
}


/* ======================== МОДАЛЬНОЕ ОКНО ======================== */

/** Открывает модалку с подробностями о товаре по его id.
 *  Безопаснее, чем передавать весь объект через onclick. */
function openModalById(productId) {
  const entry = PRODUCT_INDEX[productId];
  if (!entry) return;
  openModal(entry.item);
}

function openModal(item) {
  const modal = document.getElementById('product-modal');
  if (!modal) return;

  const prefix = getPathPrefix();

  // Слайдер
  const sliderEl = modal.querySelector('.modal-slider-imgs');
  sliderEl.innerHTML = item.images.map((src, i) =>
    `<img src="${prefix}${src}" alt="${escapeHTML(item.name)}" class="${i===0?'active':''}" loading="lazy">`
  ).join('');

  // Текст
  modal.querySelector('.modal-title').textContent   = item.name;
  modal.querySelector('.modal-sub').textContent     = item.sub || '';
  modal.querySelector('.modal-price').textContent   = item.price || '';
  modal.querySelector('.modal-apply').textContent   = item.application || '';
  modal.querySelector('.modal-objects').textContent = item.objects || '';

  // Характеристики
  const specsEl = modal.querySelector('.modal-specs');
  specsEl.innerHTML = (item.specs || []).map(s =>
    `<tr><td class="spec-label">${escapeHTML(s.label)}</td>` +
    `<td class="spec-value">${escapeHTML(s.value)}</td></tr>`
  ).join('');

  // Кнопки
  modal.querySelector('.modal-wa').href      = waLink('Интересует товар: ' + item.name);
  modal.querySelector('.modal-consult').href = mailtoConsult('Запрос цены: ' + item.name);

  const tdsBtn = modal.querySelector('.modal-tds');
  if (tdsBtn) tdsBtn.style.display = item.hasTDS ? '' : 'none';

  // Открываем
  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
  initSlider(modal.querySelector('.modal-slider'));
}

function initModal() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
  modal.querySelector('.modal-close')?.addEventListener('click', () => modal.close());
}


/* ======================== ТОВАРНАЯ КАРТОЧКА ======================== */

function renderProductCard(item) {
  const prefix = getPathPrefix();
  const imgs = item.images.map((src, i) =>
    `<img src="${prefix}${src}" alt="${escapeHTML(item.name)}" class="${i===0?'active':''}" loading="lazy">`
  ).join('');

  const arrows = item.images.length > 1
    ? `<button class="slider-arrow prev" aria-label="Назад">‹</button>
       <button class="slider-arrow next" aria-label="Вперёд">›</button>`
    : '';

  const specsShort = (item.specs || []).slice(0, 3).map(s =>
    `<div class="spec-chip"><span class="sc-label">${escapeHTML(s.label)}:</span> ${escapeHTML(s.value)}</div>`
  ).join('');

  const waHref = waLink('Интересует товар: ' + item.name);

  return `
<div class="product card" id="product-${escapeHTML(item.id)}">
  <div class="product-media">
    ${imgs}
    ${arrows}
  </div>
  <div class="product-title">${escapeHTML(item.name)}</div>
  ${item.sub ? `<div class="product-sub">${escapeHTML(item.sub)}</div>` : ''}
  <div class="product-specs-short">${specsShort}</div>
  ${item.price ? `<div class="product-price">${escapeHTML(item.price)}</div>` : ''}
  <div class="product-actions">
    <button class="btn btn-yellow btn-sm" onclick="openModalById('${item.id}')">Подробнее</button>
    <a class="btn btn-ghost btn-sm" href="${waHref}" target="_blank" rel="noopener">WhatsApp</a>
  </div>
</div>`;
}


/* ======================== ИНИЦИАЛИЗАЦИЯ СТРАНИЦ ======================== */

/** Главная */
function initHomePage() {
  // Hero-слайдер
  const heroEl = document.querySelector('.hero-slider');
  if (heroEl) {
    const imgsHtml = BCT.heroSlides.map((s, i) =>
      `<img src="${s.src}" alt="${escapeHTML(s.title)}" class="${i===0?'active':''}" loading="${i===0?'eager':'lazy'}">`
    ).join('');
    heroEl.querySelector('.hero-slider-imgs').innerHTML = imgsHtml;
    heroEl.querySelector('.cap-title').textContent = BCT.heroSlides[0].title;
    heroEl.querySelector('.cap-sub').textContent   = BCT.heroSlides[0].sub;
    initSlider(heroEl);
  }

  // Преимущества
  const advEl = document.querySelector('.advantages-grid');
  if (advEl) {
    advEl.innerHTML = BCT.advantages.map(a => `
      <div class="adv-card">
        <div class="adv-icon">${a.icon}</div>
        <div>
          <div class="adv-title">${escapeHTML(a.title)}</div>
          <div class="adv-text">${escapeHTML(a.text)}</div>
        </div>
      </div>`).join('');
  }

  // Превью каталога — 4 карточки категорий
  const catEl = document.querySelector('.catalog-preview');
  if (catEl) {
    catEl.innerHTML = BCT.catalog.map(cat => `
      <a class="cat-card card" href="${cat.slug}">
        <div class="cat-img-wrap">
          <img src="${cat.image}" alt="${escapeHTML(cat.label)}" loading="lazy">
        </div>
        <div class="cat-label">${escapeHTML(cat.label)}</div>
        <div class="cat-desc">${escapeHTML(cat.desc)}</div>
        <span class="cat-link">Смотреть →</span>
      </a>`).join('');
  }
}

/** Общая страница каталога (catalog.html) — все категории на одной странице */
function initCatalogPage() {
  const grid = document.querySelector('.catalog-list');
  if (!grid) return;

  BCT.catalog.forEach(cat => {
    const section = document.createElement('section');
    section.className = 'catalog-section';
    section.id = cat.id;
    section.innerHTML = `
      <div class="container">
        <h2 class="cat-section-title"><a href="${cat.slug}">${escapeHTML(cat.label)}</a></h2>
        <p class="muted">${escapeHTML(cat.desc)}</p>
        <div class="products-grid cards">
          ${cat.items.map(renderProductCard).join('')}
        </div>
      </div>`;
    grid.appendChild(section);
    section.querySelectorAll('.product-media').forEach(initSlider);
  });
}

/** Страница отдельной категории (catalog/roofing.html и т.п.) */
function initCategoryPage(categoryId) {
  const cat = BCT.catalog.find(c => c.id === categoryId);
  if (!cat) return;

  const h1 = document.querySelector('.page-head h1');
  const sub = document.querySelector('.page-head .muted');
  if (h1) h1.textContent = cat.label;
  if (sub) sub.textContent = cat.desc;

  const grid = document.querySelector('.products-grid');
  if (grid) {
    grid.innerHTML = cat.items.map(renderProductCard).join('');
    grid.querySelectorAll('.product-media').forEach(initSlider);
  }
}

/** Страница «Услуги» */
function initServicesPage() {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;
  grid.innerHTML = BCT.services.map(s => `
    <div class="svc-card card">
      <div class="svc-icon">${s.icon}</div>
      <h3>${escapeHTML(s.title)}</h3>
      <p>${escapeHTML(s.desc)}</p>
      <a class="btn btn-ghost btn-sm"
         href="${waLink('Интересует услуга: ' + s.title)}"
         target="_blank" rel="noopener">Узнать стоимость</a>
    </div>`).join('');
}

/** Страница «Доставка и оплата» */
function initDeliveryPage() {
  const methodsEl = document.querySelector('.delivery-methods');
  if (methodsEl) {
    methodsEl.innerHTML = BCT.delivery.methods.map(m => `
      <div class="dlv-card card">
        <div class="dlv-icon">${m.icon}</div>
        <h3>${escapeHTML(m.title)}</h3>
        <p>${escapeHTML(m.desc)}</p>
      </div>`).join('');
  }

  const paymentEl = document.querySelector('.payment-methods');
  if (paymentEl) {
    paymentEl.innerHTML = BCT.delivery.payment.map(m => `
      <div class="dlv-card card">
        <div class="dlv-icon">${m.icon}</div>
        <h3>${escapeHTML(m.title)}</h3>
        <p>${escapeHTML(m.desc)}</p>
      </div>`).join('');
  }

  const whyEl = document.querySelector('.why-us-list');
  if (whyEl) {
    whyEl.innerHTML = BCT.delivery.whyUs
      .map(t => `<li><span class="check">✓</span>${escapeHTML(t)}</li>`)
      .join('');
  }
}


/* ======================== ТОЧКА ВХОДА ======================== */

document.addEventListener('DOMContentLoaded', () => {
  buildProductIndex();
  initHeader();
  initModal();

  const page = document.body.dataset.page;
  if (page === 'home')      initHomePage();
  if (page === 'catalog')   initCatalogPage();
  if (page === 'services')  initServicesPage();
  if (page === 'delivery')  initDeliveryPage();

  // Страница категории (data-category="roofing" и т.п.)
  const catId = document.body.dataset.category;
  if (catId) initCategoryPage(catId);
});
