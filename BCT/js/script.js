document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const burger   = document.getElementById('burger');
    const drawer   = document.getElementById('drawer');
    const backdrop = document.getElementById('backdrop');

    const lockScroll = (lock) => {
        if (lock) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    const openDrawer = () => {
        if (!drawer || !backdrop) return;
        drawer.classList.add('open');
        backdrop.hidden = false;
        burger?.setAttribute('aria-expanded', 'true');
        drawer?.setAttribute('aria-hidden', 'false');
        lockScroll(true);
    };
    const closeDrawer = () => {
        if (!drawer || !backdrop) return;
        drawer.classList.remove('open');
        backdrop.hidden = true;
        burger?.setAttribute('aria-expanded', 'false');
        drawer?.setAttribute('aria-hidden', 'true');
        lockScroll(false);
    };

    burger?.addEventListener('click', () => {
        drawer?.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    backdrop?.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer?.classList.contains('open')) closeDrawer();
    });

    const tabs  = document.querySelectorAll('.tabs .tab');
    const cards = document.querySelectorAll('.products-grid .product');

    function applyFilter(key) {
        cards.forEach(card => {
            const cat = card.getAttribute('data-cat');
            card.classList.toggle('hidden', !(key === 'all' || key === cat));
        });
    }
    const initialTab = document.querySelector('.tabs .tab.active');
    if (initialTab) applyFilter(initialTab.dataset.filter);

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.dataset.filter);
        });
    });

    function initSlider(container, { autoplay = 6000 } = {}) {
        if (!container) return { destroy: () => {} };
        const imgs = Array.from(container.querySelectorAll('img'));
        if (!imgs.length) return { destroy: () => {} };

        const capBox   = container.querySelector('.slider-caption');
        const capTitle = capBox?.querySelector('.cap-title');
        const capSub   = capBox?.querySelector('.cap-sub');
        const setCaptionFrom = (img) => {
            if (!capBox) return;
            const t = img?.dataset?.cap || '';
            const s = img?.dataset?.sub || '';
            if (capTitle) capTitle.textContent = t;
            if (capSub)   capSub.textContent   = s;
            capBox.style.display = (t || s) ? 'block' : 'none';
        };

        let idx = imgs.findIndex(i => i.classList.contains('active'));
        if (idx < 0) idx = 0;
        imgs.forEach((im, i) => im.classList.toggle('active', i === idx));
        setCaptionFrom(imgs[idx]);

        const prev = container.querySelector('.slider-arrow.prev');
        const next = container.querySelector('.slider-arrow.next');

        const show = i => {
            imgs.forEach(im => im.classList.remove('active'));
            imgs[i].classList.add('active');

            if (capBox) capBox.style.opacity = '0';
            setTimeout(() => {
                setCaptionFrom(imgs[i]);
                if (capBox) capBox.style.opacity = '1';
            }, 120);

            idx = i;
        };
        const go = delta => {
            const n = imgs.length;
            if (!n) return;
            const i = (idx + delta + n) % n;
            show(i);
        };

        prev?.addEventListener('click', () => go(-1));
        next?.addEventListener('click', () => go(1));

        let startX = 0, isTouch = false;
        const onTouchStart = e => { isTouch = true; startX = e.touches[0].clientX; };
        const onTouchEnd   = e => {
            if (!isTouch) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 30) go(dx < 0 ? 1 : -1);
            isTouch = false;
        };
        container.addEventListener('touchstart', onTouchStart, { passive: true });
        container.addEventListener('touchend',   onTouchEnd,   { passive: true });

        let timer = null;
        const start = () => { stop(); if (autoplay > 0) timer = setInterval(() => go(1), autoplay); };
        const stop  = () => { if (timer) clearInterval(timer); timer = null; };
        start();
        container.addEventListener('mouseenter', stop);
        container.addEventListener('mouseleave', start);

        return {
            destroy() {
                stop();
                prev?.replaceWith(prev.cloneNode(true));
                next?.replaceWith(next.cloneNode(true));
                container.removeEventListener('touchstart', onTouchStart);
                container.removeEventListener('touchend',   onTouchEnd);
                container.removeEventListener('mouseenter', stop);
                container.removeEventListener('mouseleave', start);
            }
        };
    }


    document.querySelectorAll('.product-media').forEach(pm => initSlider(pm, { autoplay: 5000 }));

    document.querySelectorAll('.hero-slider').forEach(hs => initSlider(hs, { autoplay: 4000 }));

    const modal = document.getElementById('productModal');
    if (modal) {
        const pmTitle  = document.getElementById('pmTitle');
        const pmSlider = document.getElementById('pmSlider');
        const pmText   = document.getElementById('pmText');
        const pmMail   = document.getElementById('pmMail');
        let modalSliderInstance = null;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.close();
        });
        modal.addEventListener('cancel', () => {

            modalSliderInstance?.destroy();
            pmSlider.innerHTML = '';
            pmText.innerHTML = '';
        });

        document.addEventListener('click', (e) => {
            const btn       = e.target.closest('[data-open]');
            const mediaClick= e.target.closest('.product-media');
            const closeBtn  = e.target.closest('[data-close]');

            if (closeBtn) {
                modal.close();
                modalSliderInstance?.destroy();
                pmSlider.innerHTML = '';
                pmText.innerHTML = '';
                return;
            }

            const card = btn?.closest('.product') || mediaClick?.closest('.product');
            if (!card) return;

            const title = card.querySelector('.product-title')?.textContent?.trim() || 'Позиция';
            pmTitle.textContent = title;

            pmSlider.innerHTML = '';
            const images = Array.from(card.querySelectorAll('.product-media img')).map(img => {
                const clone = img.cloneNode(true);
                clone.classList.toggle('active', img.classList.contains('active'));
                delete clone.dataset.cap;
                delete clone.dataset.sub;
                return clone;
            });
            images.forEach(clone => pmSlider.appendChild(clone));

            const prev = document.createElement('button');
            prev.className = 'slider-arrow prev';
            prev.setAttribute('aria-label','Назад');
            prev.textContent = '‹';
            const next = document.createElement('button');
            next.className = 'slider-arrow next';
            next.setAttribute('aria-label','Вперёд');
            next.textContent = '›';
            pmSlider.appendChild(prev);
            pmSlider.appendChild(next);

            pmText.innerHTML = card.querySelector('.product-details')?.innerHTML || '';

            const subject = encodeURIComponent(`Заказ: ${title}`);
            pmMail.href = `mailto:bct.22@mail.ru?subject=${subject}&body=Позиция/параметры:%0AКол-во:%0AАдрес доставки:%0A`;

            if (typeof modal.showModal === 'function') {
                modal.showModal();
                modalSliderInstance?.destroy();
                modalSliderInstance = initSlider(pmSlider, { autoplay: 6000 });
            }
        });
    }
});

<!--Web page provided by N0Pumpkin aka Nurel Orazayev-->