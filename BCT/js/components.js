/* ============================================================
 *  BCT — ОБЩИЕ HTML-КОМПОНЕНТЫ (js/components.js)
 *  ----------------------------------------------------------
 *  Генерирует шапку, футер и модальное окно из данных BCT,
 *  чтобы менять контакты/меню в одном месте (js/data.js).
 *
 *  Вызовы рендера лежат в каждой HTML-странице в самом низу
 *  (в <script>...</script>), напр.:
 *      renderHeader('catalog', '');
 *      renderFooter('');
 *      renderModal();
 *
 *  pathPrefix — '' для корня, '../' для страниц в подпапке /catalog/.
 * ============================================================ */


/** Шапка сайта (логотип, меню, контакты, кнопка WA) */
function renderHeader(activePage, pathPrefix) {
  const prefix = pathPrefix || '';
  const c = BCT.contacts;

  const navItems = BCT.nav.map(item => {
    const isActive = item.href.includes(activePage) ? 'active' : '';
    return `<li><a class="nav-link ${isActive}" href="${prefix}${item.href}">${item.label}</a></li>`;
  }).join('');

  const drawerItems = BCT.nav.map(item => {
    const isActive = item.href.includes(activePage) ? 'active' : '';
    return `<a class="${isActive}" href="${prefix}${item.href}">${item.label}</a>`;
  }).join('');

  const header = document.querySelector('.site-header');
  if (header) {
    header.innerHTML = `
      <div class="container header-row">
        <a class="logo-badge" href="${prefix}index.html" aria-label="На главную">
          <img src="${prefix}logo/logo.png" alt="Building City Time">
        </a>

        <ul class="nav-list">${navItems}</ul>

        <div class="header-contacts">
          <a class="header-phone" href="tel:${c.phone}">${c.phoneDisplay}</a>
          <a class="header-email" href="mailto:${c.email}">${c.email}</a>
        </div>

        <a class="btn btn-yellow header-cta"
           href="${c.whatsapp}" target="_blank" rel="noopener">
          Получить консультацию
        </a>

        <button class="burger" id="burger"
                aria-label="Открыть меню" aria-expanded="false" aria-controls="drawer">
          <span></span><span></span><span></span>
        </button>
      </div>`;
  }

  const drawer = document.querySelector('.drawer-nav');
  if (drawer) {
    drawer.innerHTML = `
      ${drawerItems}
      <a class="btn btn-yellow btn-full"
         href="${c.whatsapp}" target="_blank" rel="noopener">
         Написать в WhatsApp
      </a>`;
  }

  const fab = document.querySelector('.whatsapp-fab');
  if (fab) fab.href = c.whatsapp;
}


/** Футер сайта */
function renderFooter(pathPrefix) {
  const prefix = pathPrefix || '';
  const c = BCT.contacts;
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container footer-grid">
      <div>
        <div class="footer-logo">Building City Time</div>
        <div class="footer-tagline">Строительные материалы и монтаж</div>
        <div class="footer-address">${c.address}</div>
      </div>
      <div>
        <ul class="footer-list">
          ${BCT.nav.map(n => `<li><a href="${prefix}${n.href}">${n.label}</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <ul class="footer-list">
          <li><a href="tel:${c.phone}">${c.phoneDisplay}</a></li>
          <li><a href="mailto:${c.email}">${c.email}</a></li>
          <li><a href="${c.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>
        </ul>
      </div>
    </div>
    <div class="container subfooter">© <span id="year"></span> Building City Time</div>`;
}


/** Модальное окно «Подробнее о товаре» */
function renderModal() {
  if (document.getElementById('product-modal')) return; // уже есть

  const modal = document.createElement('dialog');
  modal.id = 'product-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-title">—</div>
        <div class="modal-sub muted">—</div>
      </div>
      <button class="modal-close" aria-label="Закрыть">✕</button>
    </div>

    <div class="modal-slider">
      <div class="modal-slider-imgs"></div>
      <button class="slider-arrow prev" aria-label="Назад">‹</button>
      <button class="slider-arrow next" aria-label="Вперёд">›</button>
    </div>

    <div class="modal-price-row">
      <div class="modal-price"></div>
      <div class="modal-actions">
        <a class="btn btn-yellow modal-wa" href="#" target="_blank" rel="noopener">Запросить цену в WhatsApp</a>
        <a class="btn btn-ghost modal-consult" href="#">Получить консультацию</a>
        <a class="btn btn-ghost modal-tds" href="#" style="display:none">Скачать ТДС</a>
      </div>
    </div>

    <div class="modal-specs-wrap">
      <h4>Характеристики</h4>
      <table class="modal-specs"></table>
    </div>

    <div class="modal-info-row">
      <div class="modal-info-block">
        <div class="info-label">Применение</div>
        <div class="modal-apply"></div>
      </div>
      <div class="modal-info-block">
        <div class="info-label">Подходит для объектов</div>
        <div class="modal-objects"></div>
      </div>
    </div>

    <div class="modal-actions" style="margin-top:4px">
      <a class="btn btn-yellow modal-wa2"
         href="${BCT.contacts.whatsapp}" target="_blank" rel="noopener">
         WhatsApp инженера
      </a>
    </div>`;
  document.body.appendChild(modal);
}
