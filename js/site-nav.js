/* Shared customer navigation for the storefront pages. */
(function renderSiteNavigation() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const nav = header.querySelector('.main-nav');
    if (!nav) return;

    const page = window.location.pathname.split('/').pop() || 'index.html';
    const links = [
        ['index.html', 'Home'],
        ['shop.html', 'Shop'],
        ['index.html#quiz', 'Skin Check'],
        ['index.html#consultations', 'Consultations'],
        ['index.html#about', 'Our Approach'],
        ['account/dashboard.html', 'My Dashboard'],
        ['cart.html', 'Cart']
    ];

    nav.id = 'mainNav';
    nav.innerHTML = links.map(([href, label]) => {
        const target = href.split('#')[0];
        const active = target === page && !href.includes('#') ? ' active' : '';
        const count = href === 'cart.html' ? ' <span id="cartCount">0</span>' : '';
        return `<a href="${href}" class="${active}">${label}${count}</a>`;
    }).join('');

    const updateCartBadge = () => {
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem('reviveCart')) || [];
        } catch {
            cart = [];
        }

        const count = cart.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );
        const badge = nav.querySelector('#cartCount');
        if (badge) badge.textContent = String(count);
    };

    updateCartBadge();
    window.addEventListener('storage', event => {
        if (event.key === 'reviveCart') updateCartBadge();
    });

    let toggle = header.querySelector('.menu-toggle');
    if (!toggle) {
        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'menu-toggle';
        toggle.setAttribute('aria-label', 'Open menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<span></span><span></span><span></span>';
        header.insertBefore(toggle, nav);
    }

    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('no-scroll', open);
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
    }));

    header.dataset.navReady = 'true';
}());
