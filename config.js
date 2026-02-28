// ============================================
// SUPABASE CONFIGURATION
// ============================================
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Initialize Supabase client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ============================================
// TOAST NOTIFICATIONS (FR-26)
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeOut 0.3s var(--ease)'; setTimeout(() => toast.remove(), 300); }, 4000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatCurrency(amount, currency = 'BWP') {
    return new Intl.NumberFormat('en-BW', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function formatPula(amount) {
    return 'P' + new Intl.NumberFormat('en-BW', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-BW', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-BW', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatPercent(val) { return val.toFixed(1) + '%'; }

function generateId() { return 'id_' + Math.random().toString(36).substr(2, 9); }

function getRiskColor(risk) {
    return risk === 'low' ? 'var(--risk-low)' : risk === 'medium' ? 'var(--risk-medium)' : 'var(--risk-high)';
}

function getRiskBadge(risk) {
    return `<span class="badge-status ${risk}">${risk.charAt(0).toUpperCase() + risk.slice(1)} Risk</span>`;
}

// Audit logging helper (FR-20)
function logAudit(action, details = {}) {
    const entry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        user_id: AppStore?.currentUser?.id || 'system',
        user_name: AppStore?.currentUser?.name || 'System',
        user_role: AppStore?.currentUser?.role || 'system',
        action,
        details: JSON.stringify(details),
        ip_address: '127.0.0.1'
    };
    // Store locally
    const logs = JSON.parse(localStorage.getItem('kc_audit_logs') || '[]');
    logs.unshift(entry);
    if (logs.length > 1000) logs.pop();
    localStorage.setItem('kc_audit_logs', JSON.stringify(logs));
    return entry;
}
