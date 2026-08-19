/* Shared admin navigation: one source of truth for every admin page. */
(function renderAdminSidebar() {
    const sidebar = document.querySelector(
        '.admin-sidebar, .customers-sidebar, .orders-sidebar, .admin-app-sidebar'
    );

    if (!sidebar) return;

    const page = window.location.pathname.split('/').pop() || 'dashboard.html';
    const links = [
        ['dashboard.html', '⌂', 'Dashboard'],
        ['products.html', '▦', 'Products'],
        ['orders.html', '▤', 'Orders'],
        ['customers.html', '♧', 'Customers'],
        ['settings.html', '⚙', 'Settings']
    ];

    const navigation = links.map(([href, icon, label], index) => {
        const section = index === 0 ? '<span class="nav-label nav-section">OVERVIEW</span>'
            : index === 1 ? '<span class="nav-label nav-section">STORE</span>'
            : index === 4 ? '<span class="nav-label nav-section">SYSTEM</span>'
            : '';
        const active = page === href ? ' active' : '';
        const badge = href === 'orders.html'
            ? '<span class="nav-badge" id="pendingOrderBadge">0</span>'
            : '';

        return `${section}<a href="${href}" class="admin-nav-link nav-link${active}"><span class="nav-icon">${icon}</span><span class="nav-text">${label}</span>${badge}</a>`;
    }).join('');

    sidebar.classList.add('admin-app-sidebar');
    sidebar.innerHTML = `
        <a href="dashboard.html" class="admin-brand admin-app-brand">
            <span class="admin-brand-mark admin-app-mark">RS</span>
            <span class="brand-copy"><strong>REVIVE</strong><small>ADMINISTRATION</small></span>
        </a>
        <nav class="admin-navigation admin-app-nav" aria-label="Admin navigation">${navigation}</nav>
        <div class="sidebar-bottom admin-app-footer">
            <a href="../index.html" class="view-store">↗ View REVIVE store</a>
            <button type="button" id="adminLogout" class="admin-logout">↪ Sign out</button>
        </div>`;
}());
