// ============================================
// AUTHENTICATION MODULE (FR-1, FR-2, FR-3)
// ============================================

// Check if already logged in
(function checkAuth() {
    const user = JSON.parse(localStorage.getItem('kc_user') || 'null');
    if (user && window.location.pathname.endsWith('index.html') || (user && window.location.pathname === '/')) {
        window.location.href = 'dashboard.html';
    }
})();

// Form switching
function showForm(formId) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(formId).classList.add('active');
}

function showResetPassword() {
    showForm('reset-form');
}

// Toggle password visibility
function togglePassword(btn) {
    const input = btn.parentElement.querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
}

// MFA digit navigation
function mfaNext(el) {
    if (el.value.length === 1) {
        const next = el.nextElementSibling;
        if (next && next.classList.contains('mfa-digit')) next.focus();
    }
}

// Password strength indicator
document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('reg-password');
    if (passInput) {
        passInput.addEventListener('input', (e) => {
            const val = e.target.value;
            const strength = document.getElementById('pass-strength');
            let score = 0;
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;
            const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981'];
            const widths = ['25%', '50%', '75%', '100%'];
            strength.innerHTML = score > 0 ? `<div class="bar" style="width:${widths[score-1]};background:${colors[score-1]}"></div>` : '';
        });
    }

    // File upload label
    const fileInputs = document.querySelectorAll('.file-upload input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const span = e.target.parentElement.querySelector('span');
            span.textContent = e.target.files[0]?.name || 'Click to upload certificate';
        });
    });
});

// ============================================
// LOGIN HANDLER (FR-3)
// ============================================
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    
    btn.innerHTML = '<span class="spinner"></span> Signing in...';
    btn.disabled = true;

    // Simulate auth delay
    await new Promise(r => setTimeout(r, 1000));

    // Check local users first
    const users = JSON.parse(localStorage.getItem('kc_users') || '[]');
    let user = users.find(u => u.email === email && u.password === password);

    // Demo accounts
    if (!user) {
        const demoAccounts = {
            'admin@kgotla.co.bw': { password: 'admin123', role: 'admin', name: 'Admin User', org: 'Kgotla Capital' },
            'sme@kgotla.co.bw': { password: 'sme123', role: 'sme', name: 'Kago Mosweu', org: 'Mosweu Engineering' },
            'investor@kgotla.co.bw': { password: 'inv123', role: 'investor', name: 'Naledi Tsiane', org: 'Botswana Pension Fund' },
            'regulator@kgotla.co.bw': { password: 'reg123', role: 'regulator', name: 'Thabo Molefe', org: 'NBFIRA' }
        };
        const demo = demoAccounts[email];
        if (demo && demo.password === password) {
            user = { id: generateId(), email, ...demo, created_at: new Date().toISOString(), status: 'active', mfa_enabled: demo.role !== 'sme' };
        }
    }

    if (!user) {
        showToast('Invalid email or password', 'error');
        btn.innerHTML = '<span>Sign In</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        btn.disabled = false;
        return;
    }

    // MFA check for investors, regulators, admins (FR-3, NFR-7)
    if (user.mfa_enabled && user.role !== 'sme') {
        document.getElementById('mfa-section').style.display = 'block';
        btn.innerHTML = '<span>Verify & Sign In</span>';
        btn.disabled = false;
        
        // For demo purposes, accept any 6-digit code
        const mfaInputs = document.querySelectorAll('.mfa-digit');
        const allFilled = Array.from(mfaInputs).every(i => i.value.length === 1);
        if (!allFilled) {
            showToast('Enter 6-digit MFA code (use 123456 for demo)', 'info');
            mfaInputs[0].focus();
            return;
        }
    }

    // Success - store session
    localStorage.setItem('kc_user', JSON.stringify(user));
    logAudit('user_login', { email: user.email, role: user.role });
    showToast('Welcome back, ' + user.name + '!', 'success');
    
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
}

// ============================================
// REGISTRATION HANDLER (FR-1, FR-2)
// ============================================
async function handleRegister(e) {
    e.preventDefault();
    const role = document.querySelector('input[name="role"]:checked').value;
    const name = document.getElementById('reg-name').value;
    const org = document.getElementById('reg-org').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const nationalId = document.getElementById('reg-national-id').value;
    const taxId = document.getElementById('reg-tax-id').value;

    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    // Check existing users
    const users = JSON.parse(localStorage.getItem('kc_users') || '[]');
    if (users.find(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }

    const user = {
        id: generateId(), role, name, org, email, password,
        national_id: nationalId, tax_id: taxId,
        status: role === 'admin' ? 'active' : 'pending',
        mfa_enabled: role !== 'sme',
        kyc_verified: false,
        created_at: new Date().toISOString()
    };

    users.push(user);
    localStorage.setItem('kc_users', JSON.stringify(users));
    
    logAudit('user_registered', { email, role, name });
    showToast('Account created! ' + (role === 'admin' ? 'You can now log in.' : 'Pending admin approval.'), 'success');
    
    setTimeout(() => showForm('login-form'), 1000);
}

// ============================================
// PASSWORD RESET (FR-3)
// ============================================
async function handleReset(e) {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    
    await new Promise(r => setTimeout(r, 800));
    showToast('Password reset link sent to ' + email, 'success');
    logAudit('password_reset_requested', { email });
    setTimeout(() => showForm('login-form'), 1500);
}
