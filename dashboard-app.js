// ============================================
// DASHBOARD APP - Navigation, RBAC, Core Logic
// ============================================

// Auth guard
(function() {
    if (!AppStore.currentUser) { window.location.href = 'index.html'; return; }
})();

// ---- SIDEBAR & NAVIGATION ----
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function navigate(page, el) {
    if (el) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
    }
    document.getElementById('breadcrumb').innerHTML = `<span>${el ? el.querySelector('span').textContent : page}</span>`;
    renderPage(page);
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

// ---- RBAC (FR-4) ----
function applyRBAC() {
    const role = AppStore.currentUser.role;
    document.querySelectorAll('.nav-section[data-roles]').forEach(section => {
        const roles = section.dataset.roles.split(',');
        section.style.display = roles.includes(role) ? 'block' : 'none';
    });
}

// ---- NOTIFICATIONS (FR-26) ----
function renderNotifications() {
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    const unread = AppStore.notifications.filter(n => !n.read).length;
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
    
    list.innerHTML = AppStore.notifications.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')">
            <div class="notif-title">${n.title}</div>
            <div class="notif-desc">${n.desc}</div>
            <div class="notif-time">${formatDateTime(n.time)}</div>
        </div>
    `).join('');
}

function toggleNotifications() {
    const panel = document.getElementById('notif-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function markNotifRead(id) {
    const n = AppStore.notifications.find(n => n.id === id);
    if (n) n.read = true;
    renderNotifications();
}

function clearNotifications() {
    AppStore.notifications.forEach(n => n.read = true);
    renderNotifications();
}

// ---- MODAL ----
function openModal(html) {
    document.getElementById('modal').innerHTML = html;
    document.getElementById('modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
}

// ---- LOGOUT ----
function handleLogout() {
    logAudit('user_logout', { email: AppStore.currentUser.email });
    localStorage.removeItem('kc_user');
    window.location.href = 'index.html';
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    const user = AppStore.currentUser;
    if (!user) return;
    
    // Set user info
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = user.role.toUpperCase();
    document.getElementById('user-avatar').textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    applyRBAC();
    renderNotifications();
    renderPage('dashboard');
    
    // Close notifications on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-btn') && !e.target.closest('.notifications-panel')) {
            document.getElementById('notif-panel').style.display = 'none';
        }
    });
});

// Chart.js defaults
if (window.Chart) {
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#5A6B7F';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 16;
}
