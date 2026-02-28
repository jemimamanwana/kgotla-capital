// ============================================
// PAGE RENDERERS - All dashboard pages
// ============================================
let chartInstances = {};
function destroyCharts() { Object.values(chartInstances).forEach(c => c.destroy()); chartInstances = {}; }

function renderPage(page) {
    destroyCharts();
    const el = document.getElementById('page-content');
    const role = AppStore.currentUser.role;
    const pages = {
        'dashboard': renderDashboard,
        'sme-profile': renderSMEProfile,
        'credit-scoring': renderCreditScoring,
        'compliance': renderCompliance,
        'pools': renderPools,
        'tranches': renderTranches,
        'risk-sim': renderRiskSim,
        'invest-dashboard': renderInvestDashboard,
        'subscriptions': renderSubscriptions,
        'payments': renderPayments,
        'reg-dashboard': renderRegDashboard,
        'user-mgmt': renderUserMgmt,
        'sys-config': renderSysConfig,
        'audit-log': renderAuditLog,
        'analytics': renderAnalytics,
        'impact': renderImpact,
    };
    if (pages[page]) pages[page](el);
}

// ============================================
// MAIN DASHBOARD
// ============================================
function renderDashboard(el) {
    const role = AppStore.currentUser.role;
    const user = AppStore.currentUser;
    const totalCapital = AppStore.getTotalCapital();
    const defaultRate = AppStore.getDefaultRate();
    const avgYield = AppStore.getAvgYield();
    const activeSMEs = AppStore.smes.filter(s => s.status === 'approved').length;
    const pendingSMEs = AppStore.smes.filter(s => s.status === 'pending').length;
    const totalInvestors = AppStore.investors.length;
    const totalJobs = AppStore.getTotalJobs();
    const totalRepaid = AppStore.payments.filter(p => p.type === 'repayment' && p.status === 'completed').reduce((s,p) => s + p.amount, 0);
    const latePayments = AppStore.payments.filter(p => p.status === 'late').length;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    el.innerHTML = `
        <!-- Welcome Banner -->
        <div style="background:linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-light) 100%);border-radius:var(--radius-lg);padding:28px 32px;margin-bottom:24px;color:white;position:relative;overflow:hidden">
            <div style="position:absolute;top:-30px;right:-30px;width:200px;height:200px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
            <div style="position:absolute;bottom:-50px;right:80px;width:150px;height:150px;background:rgba(255,255,255,0.03);border-radius:50%"></div>
            <div style="position:relative;z-index:1">
                <h2 style="color:white;margin-bottom:4px;font-size:1.5rem">${greeting}, ${user.name.split(' ')[0]}</h2>
                <p style="opacity:0.8;font-size:0.9rem;margin-bottom:16px">Welcome to your ${role === 'admin' ? 'administration' : role === 'sme' ? 'business' : role === 'investor' ? 'investment' : 'regulatory'} dashboard. Here is your overview for ${formatDate(new Date())}.</p>
                <div style="display:flex;gap:12px;flex-wrap:wrap">
                    ${role === 'admin' || role === 'sme' ? `<button class="btn" style="background:rgba(255,255,255,0.15);color:white;backdrop-filter:blur(10px)" onclick="navigate('sme-profile', document.querySelector('[data-page=\\'sme-profile\\']'))">View SME Profiles</button>` : ''}
                    ${role === 'admin' || role === 'investor' ? `<button class="btn" style="background:rgba(255,255,255,0.15);color:white;backdrop-filter:blur(10px)" onclick="navigate('invest-dashboard', document.querySelector('[data-page=\\'invest-dashboard\\']'))">Investment Hub</button>` : ''}
                    ${role === 'admin' ? `<button class="btn" style="background:var(--accent);color:white" onclick="navigate('user-mgmt', document.querySelector('[data-page=\\'user-mgmt\\']'))">${pendingSMEs} Pending Approvals</button>` : ''}
                </div>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Capital Mobilized</div><div class="stat-value">${formatPula(totalCapital)}</div><div class="stat-change up">↑ 12.3% this quarter</div><div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div></div>
            <div class="stat-card accent"><div class="stat-label">Active SMEs</div><div class="stat-value">${activeSMEs}</div><div class="stat-change up">↑ ${pendingSMEs} pending approval</div></div>
            <div class="stat-card success"><div class="stat-label">Average Yield</div><div class="stat-value">${formatPercent(avgYield)}</div><div class="stat-change up">↑ 0.3% from benchmark</div></div>
            <div class="stat-card ${defaultRate > 5 ? 'danger' : ''}"><div class="stat-label">Default Rate</div><div class="stat-value">${formatPercent(defaultRate)}</div><div class="stat-change ${defaultRate > 5 ? 'down' : 'up'}">${defaultRate > 5 ? '↑ Above target' : '↓ Below threshold'}</div></div>
        </div>

        <!-- Second Stats Row -->
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Repaid</div><div class="stat-value">${formatPula(totalRepaid)}</div><div class="stat-change up">↑ On track</div></div>
            <div class="stat-card accent"><div class="stat-label">Active Investors</div><div class="stat-value">${totalInvestors}</div><div class="stat-change up">↑ 2 new this quarter</div></div>
            <div class="stat-card success"><div class="stat-label">Jobs Supported</div><div class="stat-value">${totalJobs.toLocaleString()}</div><div class="stat-change up">Across ${activeSMEs} SMEs</div></div>
            <div class="stat-card ${latePayments > 0 ? 'danger' : ''}"><div class="stat-label">Late Payments</div><div class="stat-value">${latePayments}</div><div class="stat-change ${latePayments > 0 ? 'down' : 'up'}">${latePayments > 0 ? '↑ Requires attention' : 'All on time'}</div></div>
        </div>

        <!-- Charts Row -->
        <div class="grid-2">
            <div class="card"><div class="card-header"><h4>Capital Deployment (6 Months)</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-capital"></canvas></div></div></div>
            <div class="card"><div class="card-header"><h4>Sector Distribution</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-sectors"></canvas></div></div></div>
        </div>

        <!-- Activity + Pool Performance -->
        <div style="margin-top:20px" class="grid-2">
            <div class="card"><div class="card-header"><h4>Recent Transactions</h4><button class="btn btn-sm btn-ghost" onclick="navigate('payments', document.querySelector('[data-page=\\'payments\\']'))">View All</button></div><div class="card-body">
                <div class="timeline">${AppStore.payments.slice(-8).reverse().map(p => `
                    <div class="timeline-item"><div class="tl-time">${formatDate(p.date)}</div><div class="tl-title">${p.type === 'disbursement' ? 'Disbursement' : p.type === 'repayment' ? 'Repayment' : 'Investor Payout'} - ${p.reference}</div><div class="tl-desc">${formatPula(p.amount)} · <span class="badge-status ${p.status === 'completed' ? 'active' : p.status === 'late' ? 'high' : 'pending'}">${p.status}${p.days_late ? ' (' + p.days_late + 'd late)' : ''}</span></div></div>
                `).join('')}</div>
            </div></div>
            <div class="card"><div class="card-header"><h4>Pool Performance</h4><button class="btn btn-sm btn-ghost" onclick="navigate('pools', document.querySelector('[data-page=\\'pools\\']'))">Manage Pools</button></div><div class="card-body">
                ${AppStore.pools.map(pool => {
                    const tranches = AppStore.getPoolTranches(pool.id);
                    const smeCount = AppStore.getPoolSMEs(pool.id).length;
                    const totalSub = tranches.reduce((s,t) => s + t.subscribed, 0);
                    const totalAmt = tranches.reduce((s,t) => s + t.amount, 0);
                    const pct = totalAmt ? (totalSub/totalAmt*100) : 0;
                    return `<div style="margin-bottom:24px">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                            <div><strong style="font-size:0.9rem">${pool.name}</strong> <span style="font-size:0.75rem;color:var(--text-muted)">(${smeCount} SMEs)</span></div>
                            <div style="display:flex;gap:8px;align-items:center">
                                ${getRiskBadge(pool.risk_level)}
                                <span style="font-size:0.8rem;font-weight:600;color:var(--primary)">${formatPercent(pct)}</span>
                            </div>
                        </div>
                        <div class="progress-bar"><div class="fill green" style="width:${pct}%"></div></div>
                        <div class="tranche-visual" style="margin-top:8px">${tranches.map(t => `<div class="tranche-bar ${t.type}" style="width:${t.allocation_pct}%">${t.type.charAt(0).toUpperCase()} ${t.allocation_pct}%</div>`).join('')}</div>
                        <div style="display:flex;gap:12px;margin-top:6px;font-size:0.8rem;color:var(--text-muted)">
                            <span>Exposure: ${formatPula(pool.total_exposure)}</span>
                            <span>Coupon: ${pool.coupon_rate}%</span>
                            <span>Subscribed: ${formatPula(totalSub)}/${formatPula(totalAmt)}</span>
                        </div>
                    </div>`;
                }).join('')}
            </div></div>
        </div>

        <!-- Risk Overview + Top SMEs -->
        <div style="margin-top:20px" class="grid-2">
            <div class="card"><div class="card-header"><h4>Risk Overview</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-risk-overview"></canvas></div></div></div>
            <div class="card"><div class="card-header"><h4>Top Performing SMEs</h4></div><div class="card-body">
                <div class="table-wrap"><table><thead><tr><th>SME</th><th>Score</th><th>Risk</th><th>Funded</th></tr></thead><tbody>
                    ${AppStore.smes.filter(s => s.status === 'approved').sort((a,b) => b.credit_score - a.credit_score).slice(0,6).map(s => `
                        <tr>
                            <td><strong style="font-size:0.85rem">${s.name}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">${s.sector}</span></td>
                            <td><div style="display:flex;align-items:center;gap:6px"><div class="progress-bar" style="width:60px"><div class="fill ${s.credit_score>=70?'green':s.credit_score>=40?'gold':'red'}" style="width:${s.credit_score}%"></div></div><strong style="font-size:0.85rem">${s.credit_score}</strong></div></td>
                            <td>${getRiskBadge(s.risk_level)}</td>
                            <td style="font-weight:600">${formatPula(s.funded_amount)}</td>
                        </tr>`).join('')}
                </tbody></table></div>
            </div></div>
        </div>
    `;

    // Capital deployment chart
    chartInstances.capital = new Chart(document.getElementById('chart-capital'), {
        type: 'bar',
        data: { labels: ['Sep','Oct','Nov','Dec','Jan','Feb'], datasets: [
            { label: 'Disbursements', data: [0,0,0,2750000,650000,0], backgroundColor: '#0D6E4F', borderRadius: 6 },
            { label: 'Repayments', data: [0,0,0,0,234000,369000], backgroundColor: '#C4922A', borderRadius: 6 },
            { label: 'Investor Payouts', data: [0,0,0,0,5555,9325], backgroundColor: '#2563EB', borderRadius: 6 }
        ]},
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v >= 1000000 ? 'P' + (v/1000000).toFixed(1) + 'M' : 'P' + (v/1000) + 'k' } } } }
    });

    // Sector distribution chart
    const sectors = AppStore.getSectorDistribution();
    chartInstances.sectors = new Chart(document.getElementById('chart-sectors'), {
        type: 'doughnut',
        data: { labels: Object.keys(sectors), datasets: [{ data: Object.values(sectors), backgroundColor: ['#0D6E4F','#14A073','#C4922A','#E5B94E','#2563EB','#7C3AED','#EC4899','#F97316'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' } } }
    });

    // Risk overview chart
    const riskCounts = { 'Low Risk': AppStore.smes.filter(s=>s.risk_level==='low'&&s.status==='approved').length, 'Medium Risk': AppStore.smes.filter(s=>s.risk_level==='medium'&&s.status==='approved').length, 'High Risk': AppStore.smes.filter(s=>s.risk_level==='high'&&s.status==='approved').length };
    chartInstances.riskOverview = new Chart(document.getElementById('chart-risk-overview'), {
        type: 'doughnut',
        data: { labels: Object.keys(riskCounts), datasets: [{ data: Object.values(riskCounts), backgroundColor: ['#10B981','#F59E0B','#EF4444'], borderWidth: 3, borderColor: '#fff' }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'bottom' } } }
    });
}

// ============================================
// SME PROFILE (FR-5)
// ============================================
function renderSMEProfile(el) {
    const role = AppStore.currentUser.role;
    const smes = role === 'sme' ? AppStore.smes.filter(s => s.email === AppStore.currentUser.email) : AppStore.smes;
    
    el.innerHTML = `
        <div class="section-header"><h2>SME Profiles</h2>
            <div class="actions">${role === 'admin' || role === 'sme' ? '<button class="btn btn-primary" onclick="showAddSMEModal()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add SME</button>' : ''}</div>
        </div>
        <div class="filter-pills">
            <button class="pill active" onclick="filterSMEs('all',this)">All (${smes.length})</button>
            <button class="pill" onclick="filterSMEs('approved',this)">Approved</button>
            <button class="pill" onclick="filterSMEs('pending',this)">Pending</button>
            <button class="pill" onclick="filterSMEs('rejected',this)">Rejected</button>
        </div>
        <div class="table-wrap"><table>
            <thead><tr><th>Company</th><th>Sector</th><th>Credit Score</th><th>Risk</th><th>Revenue</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="sme-table-body">
                ${smes.map(s => `<tr data-status="${s.status}">
                    <td><strong>${s.name}</strong><br><span style="font-size:0.8rem;color:var(--text-muted)">${s.owner}</span></td>
                    <td>${s.sector}</td>
                    <td><div style="display:flex;align-items:center;gap:8px"><div class="progress-bar" style="width:80px"><div class="fill ${s.credit_score>=70?'green':s.credit_score>=40?'gold':'red'}" style="width:${s.credit_score}%"></div></div><span style="font-weight:600">${s.credit_score}</span></div></td>
                    <td>${getRiskBadge(s.risk_level)}</td>
                    <td>${formatPula(s.revenue)}</td>
                    <td><span class="badge-status ${s.status}">${s.status}</span></td>
                    <td><button class="btn btn-sm btn-ghost" onclick="viewSMEDetail('${s.id}')">View</button>
                    ${role === 'admin' && s.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="AppStore.approveSME('${s.id}');navigate('sme-profile')">Approve</button>` : ''}</td>
                </tr>`).join('')}
            </tbody>
        </table></div>
    `;
}

function filterSMEs(status, btn) {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#sme-table-body tr').forEach(row => {
        row.style.display = (status === 'all' || row.dataset.status === status) ? '' : 'none';
    });
}

function viewSMEDetail(id) {
    const s = AppStore.smes.find(x => x.id === id);
    if (!s) return;
    openModal(`
        <div class="modal-header"><h3>${s.name}</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
        <div class="modal-body">
            <div class="data-grid">
                <div class="data-item"><div class="label">Owner</div><div class="value">${s.owner}</div></div>
                <div class="data-item"><div class="label">Sector</div><div class="value">${s.sector}</div></div>
                <div class="data-item"><div class="label">Registration</div><div class="value">${s.registration_no}</div></div>
                <div class="data-item"><div class="label">Tax ID</div><div class="value">${s.tax_id}</div></div>
                <div class="data-item"><div class="label">Credit Score</div><div class="value" style="color:${getRiskColor(s.risk_level)}">${s.credit_score}/100</div></div>
                <div class="data-item"><div class="label">Risk Level</div><div class="value">${getRiskBadge(s.risk_level)}</div></div>
            </div>
            <h4 style="margin:20px 0 12px">Financial Overview (FR-6)</h4>
            <div class="data-grid">
                <div class="data-item"><div class="label">Revenue</div><div class="value">${formatPula(s.revenue)}</div></div>
                <div class="data-item"><div class="label">Expenses</div><div class="value">${formatPula(s.expenses)}</div></div>
                <div class="data-item"><div class="label">Net Income</div><div class="value">${formatPula(s.net_income)}</div></div>
                <div class="data-item"><div class="label">Total Assets</div><div class="value">${formatPula(s.total_assets)}</div></div>
                <div class="data-item"><div class="label">Total Liabilities</div><div class="value">${formatPula(s.total_liabilities)}</div></div>
                <div class="data-item"><div class="label">Funded Amount</div><div class="value">${formatPula(s.funded_amount)}</div></div>
            </div>
            <h4 style="margin:20px 0 12px">Key Ratios</h4>
            <div class="data-grid">
                <div class="data-item"><div class="label">Liquidity Ratio</div><div class="value">${s.liquidity_ratio?.toFixed(2)}</div></div>
                <div class="data-item"><div class="label">Leverage Ratio</div><div class="value">${(s.leverage_ratio*100)?.toFixed(1)}%</div></div>
                <div class="data-item"><div class="label">Profitability</div><div class="value">${(s.profitability_ratio*100)?.toFixed(1)}%</div></div>
            </div>
            <h4 style="margin:20px 0 12px">Compliance Status (FR-8)</h4>
            <div class="data-grid">
                <div class="data-item"><div class="label">Tax Compliant</div><div class="value">${s.tax_compliant ? '<span class="badge-status active">Yes</span>' : '<span class="badge-status high">No</span>'}</div></div>
                <div class="data-item"><div class="label">License Valid</div><div class="value">${s.license_valid ? '<span class="badge-status active">Valid</span>' : '<span class="badge-status high">Expired</span>'}</div></div>
                <div class="data-item"><div class="label">License Expiry</div><div class="value">${formatDate(s.license_expiry)}</div></div>
                <div class="data-item"><div class="label">Employees</div><div class="value">${s.employees || 'N/A'}</div></div>
            </div>
        </div>
    `);
}

function showAddSMEModal() {
    openModal(`
        <div class="modal-header"><h3>Register New SME</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
        <div class="modal-body">
            <form onsubmit="submitNewSME(event)">
                <div class="form-grid">
                    <div class="input-group"><label>Company Name</label><input type="text" id="new-sme-name" required></div>
                    <div class="input-group"><label>Owner Name</label><input type="text" id="new-sme-owner" required></div>
                </div>
                <div class="form-grid">
                    <div class="input-group"><label>Sector</label><select id="new-sme-sector"><option>Manufacturing</option><option>Agriculture</option><option>Tourism</option><option>Retail</option><option>Transport</option><option>Mining</option><option>Technology</option><option>Services</option></select></div>
                    <div class="input-group"><label>Email</label><input type="email" id="new-sme-email" required></div>
                </div>
                <div class="form-grid">
                    <div class="input-group"><label>Registration No.</label><input type="text" id="new-sme-reg"></div>
                    <div class="input-group"><label>Tax ID</label><input type="text" id="new-sme-tax"></div>
                </div>
                <div class="form-grid">
                    <div class="input-group"><label>Annual Revenue (P)</label><input type="number" id="new-sme-revenue" required></div>
                    <div class="input-group"><label>Annual Expenses (P)</label><input type="number" id="new-sme-expenses" required></div>
                </div>
                <div class="form-grid">
                    <div class="input-group"><label>Total Assets (P)</label><input type="number" id="new-sme-assets" required></div>
                    <div class="input-group"><label>Total Liabilities (P)</label><input type="number" id="new-sme-liabilities" required></div>
                </div>
                <div class="input-group"><label>Employees</label><input type="number" id="new-sme-employees"></div>
                <button type="submit" class="btn btn-primary btn-full" style="margin-top:12px">Submit SME Application</button>
            </form>
        </div>
    `);
}

function submitNewSME(e) {
    e.preventDefault();
    const rev = Number(document.getElementById('new-sme-revenue').value);
    const exp = Number(document.getElementById('new-sme-expenses').value);
    const assets = Number(document.getElementById('new-sme-assets').value);
    const liab = Number(document.getElementById('new-sme-liabilities').value);
    const net = rev - exp;
    const liquidity = liab > 0 ? (assets * 0.4 / (liab * 0.4)).toFixed(2) : 0;
    const leverage = assets > 0 ? (liab / assets).toFixed(3) : 0;
    const profit = rev > 0 ? (net / rev).toFixed(3) : 0;
    // Credit scoring (FR-7)
    let score = 50;
    if (liquidity > 1.5) score += 15; else if (liquidity > 1) score += 8;
    if (leverage < 0.4) score += 15; else if (leverage < 0.6) score += 8;
    if (profit > 0.2) score += 15; else if (profit > 0.1) score += 8;
    score = Math.min(100, Math.max(0, score + Math.floor(Math.random() * 10) - 5));
    const risk = score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high';
    
    AppStore.addSME({
        name: document.getElementById('new-sme-name').value,
        owner: document.getElementById('new-sme-owner').value,
        sector: document.getElementById('new-sme-sector').value,
        email: document.getElementById('new-sme-email').value,
        registration_no: document.getElementById('new-sme-reg').value,
        tax_id: document.getElementById('new-sme-tax').value,
        revenue: rev, expenses: exp, net_income: net,
        total_assets: assets, total_liabilities: liab,
        current_assets: assets * 0.4, current_liabilities: liab * 0.4,
        credit_score: score, risk_level: risk,
        liquidity_ratio: Number(liquidity), leverage_ratio: Number(leverage), profitability_ratio: Number(profit),
        tax_compliant: true, license_valid: true, license_expiry: '2027-12-31',
        eligible: score >= 40, funded_amount: 0, employees: Number(document.getElementById('new-sme-employees').value) || 0,
        cash_flow_projection: Array(6).fill(0).map(() => Math.floor(net / 12 * (0.8 + Math.random() * 0.4))),
        repayment_history: [100, 100, 100, 100, 100, 100]
    });
    
    closeModal();
    showToast('SME application submitted! Credit Score: ' + score + ' (' + risk + ' risk)', 'success');
    navigate('sme-profile', document.querySelector('[data-page="sme-profile"]'));
}

// ============================================
// CREDIT SCORING (FR-7)
// ============================================
function renderCreditScoring(el) {
    const smes = AppStore.smes;
    el.innerHTML = `
        <div class="section-header"><h2>Credit Scoring Engine</h2></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Avg Credit Score</div><div class="stat-value">${(smes.reduce((s,x) => s + x.credit_score, 0) / smes.length).toFixed(0)}</div></div>
            <div class="stat-card success"><div class="stat-label">Low Risk SMEs</div><div class="stat-value">${smes.filter(s => s.risk_level === 'low').length}</div></div>
            <div class="stat-card accent"><div class="stat-label">Medium Risk</div><div class="stat-value">${smes.filter(s => s.risk_level === 'medium').length}</div></div>
            <div class="stat-card danger"><div class="stat-label">High Risk</div><div class="stat-value">${smes.filter(s => s.risk_level === 'high').length}</div></div>
        </div>
        <div class="grid-2">
            <div class="card"><div class="card-header"><h4>Score Distribution</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-scores"></canvas></div></div></div>
            <div class="card"><div class="card-header"><h4>Risk Categories</h4></div><div class="card-body">
                <div class="chart-container"><canvas id="chart-risk-pie"></canvas></div>
            </div></div>
        </div>
        <div class="card" style="margin-top:20px"><div class="card-header"><h4>SME Credit Details</h4></div><div class="card-body">
            <div class="table-wrap"><table><thead><tr><th>SME</th><th>Score</th><th>Liquidity</th><th>Leverage</th><th>Profitability</th><th>Risk</th><th>Eligible</th></tr></thead><tbody>
                ${smes.map(s => `<tr>
                    <td><strong>${s.name}</strong></td>
                    <td><strong style="color:${getRiskColor(s.risk_level)}">${s.credit_score}</strong></td>
                    <td>${s.liquidity_ratio?.toFixed(2)}</td>
                    <td>${(s.leverage_ratio*100)?.toFixed(1)}%</td>
                    <td>${(s.profitability_ratio*100)?.toFixed(1)}%</td>
                    <td>${getRiskBadge(s.risk_level)}</td>
                    <td>${s.eligible ? '<span class="badge-status active">Eligible</span>' : '<span class="badge-status high">Ineligible</span>'}</td>
                </tr>`).join('')}
            </tbody></table></div>
        </div></div>
    `;
    
    chartInstances.scores = new Chart(document.getElementById('chart-scores'), {
        type: 'bar',
        data: { labels: smes.map(s => s.name.split(' ')[0]), datasets: [{ label: 'Credit Score', data: smes.map(s => s.credit_score), backgroundColor: smes.map(s => getRiskColor(s.risk_level)), borderRadius: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { max: 100, beginAtZero: true } }, plugins: { legend: { display: false } } }
    });
    
    const riskCounts = { Low: smes.filter(s=>s.risk_level==='low').length, Medium: smes.filter(s=>s.risk_level==='medium').length, High: smes.filter(s=>s.risk_level==='high').length };
    chartInstances.riskPie = new Chart(document.getElementById('chart-risk-pie'), {
        type: 'doughnut',
        data: { labels: Object.keys(riskCounts), datasets: [{ data: Object.values(riskCounts), backgroundColor: ['#10B981','#F59E0B','#EF4444'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom' } } }
    });
}

// ============================================
// COMPLIANCE (FR-8)
// ============================================
function renderCompliance(el) {
    const smes = AppStore.smes;
    const expiringSoon = smes.filter(s => { const d = new Date(s.license_expiry); const now = new Date(); return (d - now) / 86400000 < 90; });
    
    el.innerHTML = `
        <div class="section-header"><h2>Compliance Status Tracking</h2></div>
        <div class="stats-grid">
            <div class="stat-card success"><div class="stat-label">Tax Compliant</div><div class="stat-value">${smes.filter(s => s.tax_compliant).length}/${smes.length}</div></div>
            <div class="stat-card"><div class="stat-label">Valid Licenses</div><div class="stat-value">${smes.filter(s => s.license_valid).length}/${smes.length}</div></div>
            <div class="stat-card accent"><div class="stat-label">Expiring Soon (90d)</div><div class="stat-value">${expiringSoon.length}</div></div>
        </div>
        <div class="card"><div class="card-header"><h4>Compliance Matrix</h4></div><div class="card-body">
            <div class="table-wrap"><table><thead><tr><th>SME</th><th>Tax Compliance</th><th>License Status</th><th>License Expiry</th><th>Documents</th><th>Overall</th></tr></thead><tbody>
                ${smes.map(s => {
                    const daysLeft = Math.floor((new Date(s.license_expiry) - new Date()) / 86400000);
                    const overall = s.tax_compliant && s.license_valid;
                    return `<tr>
                        <td><strong>${s.name}</strong></td>
                        <td>${s.tax_compliant ? '<span class="badge-status active">Compliant</span>' : '<span class="badge-status high">Non-Compliant</span>'}</td>
                        <td>${s.license_valid ? '<span class="badge-status active">Valid</span>' : '<span class="badge-status high">Expired</span>'}</td>
                        <td>${formatDate(s.license_expiry)} <span style="font-size:0.75rem;color:${daysLeft<90?'var(--danger)':'var(--text-muted)'}">(${daysLeft}d left)</span></td>
                        <td><span class="badge-status ${s.docs_uploaded !== false ? 'active' : 'pending'}">${s.docs_uploaded !== false ? 'Uploaded' : 'Missing'}</span></td>
                        <td>${overall ? '<span class="badge-status active">Pass</span>' : '<span class="badge-status high">Fail</span>'}</td>
                    </tr>`;
                }).join('')}
            </tbody></table></div>
        </div></div>
    `;
}

// ============================================
// POOLS (FR-9)
// ============================================
function renderPools(el) {
    el.innerHTML = `
        <div class="section-header"><h2>SME Pools</h2>
            <button class="btn btn-primary" onclick="showCreatePoolModal()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Create Pool</button>
        </div>
        <div class="grid-2">
            ${AppStore.pools.map(pool => {
                const smes = AppStore.getPoolSMEs(pool.id);
                const tranches = AppStore.getPoolTranches(pool.id);
                return `<div class="card"><div class="card-header"><h4>${pool.name}</h4>${getRiskBadge(pool.risk_level)}</div><div class="card-body">
                    <div class="data-grid" style="grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
                        <div class="data-item"><div class="label">SMEs</div><div class="value">${smes.length}</div></div>
                        <div class="data-item"><div class="label">Exposure</div><div class="value">${formatPula(pool.total_exposure)}</div></div>
                        <div class="data-item"><div class="label">Avg Score</div><div class="value">${pool.avg_credit_score}</div></div>
                    </div>
                    <div class="tranche-visual">${tranches.map(t => `<div class="tranche-bar ${t.type}" style="width:${t.allocation_pct}%">${t.type.charAt(0).toUpperCase()} ${t.allocation_pct}%</div>`).join('')}</div>
                    <div style="margin-top:12px;font-size:0.85rem;color:var(--text-secondary)">
                        <strong>SMEs:</strong> ${smes.map(s => s.name.split(' ')[0]).join(', ')}
                    </div>
                    <div style="margin-top:8px;display:flex;gap:8px"><span class="badge-status info">Coupon: ${pool.coupon_rate}%</span><span class="badge-status info">Maturity: ${pool.maturity_months}mo</span></div>
                </div></div>`;
            }).join('')}
        </div>
    `;
}

function showCreatePoolModal() {
    const eligible = AppStore.smes.filter(s => s.eligible && !s.pool_id);
    openModal(`
        <div class="modal-header"><h3>Create SME Pool</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
        <div class="modal-body"><form onsubmit="submitNewPool(event)">
            <div class="input-group"><label>Pool Name</label><input type="text" id="pool-name" required placeholder="e.g. Growth Fund III"></div>
            <div class="form-grid">
                <div class="input-group"><label>Risk Level</label><select id="pool-risk"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                <div class="input-group"><label>Coupon Rate (%)</label><input type="number" step="0.1" id="pool-coupon" value="8.0" required></div>
            </div>
            <div class="input-group"><label>Select Eligible SMEs</label>
                ${eligible.length ? eligible.map(s => `<label class="checkbox-wrap"><input type="checkbox" name="pool-smes" value="${s.id}"> <span>${s.name} (Score: ${s.credit_score})</span></label>`).join('') : '<p style="color:var(--text-muted)">No eligible unassigned SMEs available</p>'}
            </div>
            <button type="submit" class="btn btn-primary btn-full">Create Pool</button>
        </form></div>
    `);
}

function submitNewPool(e) {
    e.preventDefault();
    const smeIds = Array.from(document.querySelectorAll('input[name="pool-smes"]:checked')).map(i => i.value);
    if (smeIds.length === 0) { showToast('Select at least one SME', 'error'); return; }
    const smes = smeIds.map(id => AppStore.smes.find(s => s.id === id));
    const totalExp = smes.reduce((s, x) => s + x.funded_amount, 0);
    const avgScore = smes.reduce((s, x) => s + x.credit_score, 0) / smes.length;
    
    AppStore.createPool({
        name: document.getElementById('pool-name').value,
        risk_level: document.getElementById('pool-risk').value,
        sme_ids: smeIds, total_exposure: totalExp, avg_credit_score: Math.round(avgScore),
        coupon_rate: Number(document.getElementById('pool-coupon').value), maturity_months: 24
    });
    smeIds.forEach(id => AppStore.updateSME(id, { pool_id: AppStore.pools[AppStore.pools.length-1].id }));
    closeModal();
    showToast('Pool created successfully!', 'success');
    navigate('pools', document.querySelector('[data-page="pools"]'));
}

// ============================================
// TRANCHES (FR-10)
// ============================================
function renderTranches(el) {
    el.innerHTML = `
        <div class="section-header"><h2>Bond Tranches</h2></div>
        <div class="card"><div class="card-body">
            <div class="table-wrap"><table><thead><tr><th>Tranche</th><th>Pool</th><th>Type</th><th>Allocation</th><th>Coupon</th><th>Expected Yield</th><th>Amount</th><th>Subscribed</th><th>Progress</th></tr></thead><tbody>
                ${AppStore.tranches.map(t => {
                    const pool = AppStore.pools.find(p => p.id === t.pool_id);
                    const pct = t.amount ? (t.subscribed/t.amount*100) : 0;
                    return `<tr>
                        <td><strong>${t.name}</strong></td>
                        <td>${pool?.name || 'N/A'}</td>
                        <td><span class="badge-status ${t.type==='senior'?'active':t.type==='mezzanine'?'pending':'high'}">${t.type}</span></td>
                        <td>${t.allocation_pct}%</td>
                        <td>${t.coupon_rate}%</td>
                        <td><strong>${t.expected_yield}%</strong></td>
                        <td>${formatPula(t.amount)}</td>
                        <td>${formatPula(t.subscribed)}</td>
                        <td><div class="progress-bar" style="width:100px"><div class="fill ${pct>=80?'green':pct>=50?'gold':'red'}" style="width:${Math.min(100,pct)}%"></div></div> <span style="font-size:0.8rem">${pct.toFixed(0)}%</span></td>
                    </tr>`;
                }).join('')}
            </tbody></table></div>
        </div></div>
        <div class="card" style="margin-top:20px"><div class="card-header"><h4>Bond Issuance Documents (FR-12)</h4></div><div class="card-body">
            <div style="display:flex;gap:12px;flex-wrap:wrap">
                <button class="btn btn-secondary" onclick="generateDoc('term_sheet')">📄 Generate Term Sheet</button>
                <button class="btn btn-secondary" onclick="generateDoc('offering')">📋 Offering Summary</button>
                <button class="btn btn-secondary" onclick="generateDoc('risk')">⚠️ Risk Disclosure</button>
            </div>
        </div></div>
    `;
}

function generateDoc(type) {
    showToast('Document generated: ' + type.replace('_', ' ').toUpperCase(), 'success');
    logAudit('document_generated', { type });
}

// ============================================
// RISK SIMULATION (FR-11)
// ============================================
function renderRiskSim(el) {
    el.innerHTML = `
        <div class="section-header"><h2>Risk Simulation Engine</h2></div>
        <div class="card"><div class="card-header"><h4>Monte Carlo Simulation Parameters</h4></div><div class="card-body">
            <div class="form-grid">
                <div class="input-group"><label>Default Probability (%)</label><input type="range" id="sim-default" min="1" max="30" value="5" oninput="document.getElementById('sim-def-val').textContent=this.value+'%'"> <span id="sim-def-val">5%</span></div>
                <div class="input-group"><label>Recovery Rate (%)</label><input type="range" id="sim-recovery" min="10" max="80" value="40" oninput="document.getElementById('sim-rec-val').textContent=this.value+'%'"> <span id="sim-rec-val">40%</span></div>
            </div>
            <div class="form-grid">
                <div class="input-group"><label>Stress Multiplier</label><select id="sim-stress"><option value="1">Normal</option><option value="1.5">Moderate Stress (1.5x)</option><option value="2">Severe Stress (2x)</option><option value="3">Extreme (3x)</option></select></div>
                <div class="input-group"><label>Simulations</label><input type="number" id="sim-runs" value="1000" min="100" max="10000"></div>
            </div>
            <button class="btn btn-primary" onclick="runSimulation()">Run Simulation</button>
        </div></div>
        <div id="sim-results" style="margin-top:20px"></div>
    `;
}

function runSimulation() {
    const defProb = Number(document.getElementById('sim-default').value) / 100;
    const recovery = Number(document.getElementById('sim-recovery').value) / 100;
    const stress = Number(document.getElementById('sim-stress').value);
    const runs = Number(document.getElementById('sim-runs').value);
    const totalExposure = AppStore.pools.reduce((s, p) => s + p.total_exposure, 0);
    
    let losses = [];
    for (let i = 0; i < runs; i++) {
        let totalLoss = 0;
        AppStore.smes.filter(s => s.pool_id).forEach(sme => {
            if (Math.random() < defProb * stress) {
                totalLoss += sme.funded_amount * (1 - recovery);
            }
        });
        losses.push(totalLoss);
    }
    losses.sort((a, b) => a - b);
    const avgLoss = losses.reduce((s, l) => s + l, 0) / runs;
    const var95 = losses[Math.floor(runs * 0.95)];
    const var99 = losses[Math.floor(runs * 0.99)];
    const maxLoss = losses[runs - 1];
    
    document.getElementById('sim-results').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Expected Loss</div><div class="stat-value">${formatPula(avgLoss)}</div><div class="stat-change">${formatPercent(avgLoss/totalExposure*100)} of exposure</div></div>
            <div class="stat-card accent"><div class="stat-label">VaR (95%)</div><div class="stat-value">${formatPula(var95)}</div></div>
            <div class="stat-card danger"><div class="stat-label">VaR (99%)</div><div class="stat-value">${formatPula(var99)}</div></div>
            <div class="stat-card"><div class="stat-label">Max Loss</div><div class="stat-value">${formatPula(maxLoss)}</div></div>
        </div>
        <div class="card"><div class="card-header"><h4>Loss Distribution</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-sim"></canvas></div></div></div>
    `;
    
    // Histogram
    const buckets = 20;
    const bucketSize = (maxLoss - losses[0]) / buckets || 1;
    const hist = Array(buckets).fill(0);
    losses.forEach(l => { const b = Math.min(buckets - 1, Math.floor((l - losses[0]) / bucketSize)); hist[b]++; });
    
    chartInstances.sim = new Chart(document.getElementById('chart-sim'), {
        type: 'bar',
        data: { labels: hist.map((_, i) => formatPula(losses[0] + i * bucketSize)), datasets: [{ label: 'Frequency', data: hist, backgroundColor: hist.map((_, i) => { const val = losses[0] + i * bucketSize; return val > var95 ? '#EF4444' : val > avgLoss ? '#F59E0B' : '#10B981'; }), borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { beginAtZero: true } } }
    });
    showToast('Simulation complete: ' + runs + ' scenarios analyzed', 'success');
}

// ============================================
// INVESTOR DASHBOARD (FR-14)
// ============================================
function renderInvestDashboard(el) {
    const totalInvested = AppStore.investors.reduce((s, i) => s + i.total_invested, 0);
    
    el.innerHTML = `
        <div class="section-header"><h2>Investment Hub</h2></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Invested</div><div class="stat-value">${formatPula(totalInvested)}</div></div>
            <div class="stat-card accent"><div class="stat-label">Active Investors</div><div class="stat-value">${AppStore.investors.length}</div></div>
            <div class="stat-card success"><div class="stat-label">Avg Expected Yield</div><div class="stat-value">${formatPercent(AppStore.getAvgYield())}</div></div>
        </div>
        <div class="card"><div class="card-header"><h4>Available Bond Pools</h4></div><div class="card-body">
            ${AppStore.pools.map(pool => {
                const tranches = AppStore.getPoolTranches(pool.id);
                return `<div style="border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h4 style="margin:0">${pool.name}</h4>${getRiskBadge(pool.risk_level)}</div>
                    <div class="tranche-visual">${tranches.map(t => `<div class="tranche-bar ${t.type}" style="width:${t.allocation_pct}%">${t.type.charAt(0).toUpperCase()} ${t.coupon_rate}%</div>`).join('')}</div>
                    <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Tranche</th><th>Coupon</th><th>Yield</th><th>Available</th><th></th></tr></thead><tbody>
                        ${tranches.map(t => `<tr>
                            <td><span class="badge-status ${t.type==='senior'?'active':t.type==='mezzanine'?'pending':'high'}">${t.type}</span></td>
                            <td>${t.coupon_rate}%</td><td><strong>${t.expected_yield}%</strong></td>
                            <td>${formatPula(t.amount - t.subscribed)}</td>
                            <td><button class="btn btn-sm btn-primary" onclick="subscribeToTranche('${t.id}')">Subscribe</button></td>
                        </tr>`).join('')}
                    </tbody></table></div>
                </div>`;
            }).join('')}
        </div></div>
        <div class="card" style="margin-top:20px"><div class="card-header"><h4>Performance Monitoring (FR-16)</h4></div><div class="card-body">
            <div class="chart-container"><canvas id="chart-performance"></canvas></div>
        </div></div>
    `;
    
    chartInstances.perf = new Chart(document.getElementById('chart-performance'), {
        type: 'line',
        data: { labels: ['Sep','Oct','Nov','Dec','Jan','Feb'], datasets: [
            { label: 'Portfolio Value', data: [0,0,680000,1050000,1250000,1250000], borderColor: '#0D6E4F', backgroundColor: 'rgba(13,110,79,0.1)', fill: true, tension: 0.4 },
            { label: 'Cumulative Returns', data: [0,0,0,0,3680,5555], borderColor: '#C4922A', borderDash: [5,5], tension: 0.4, yAxisID: 'y1' }
        ]},
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { callback: v => 'P' + (v/1000) + 'k' } }, y1: { position: 'right', beginAtZero: true, grid: { display: false } } }, plugins: { legend: { position: 'bottom' } } }
    });
}

function subscribeToTranche(trancheId) {
    const t = AppStore.tranches.find(tr => tr.id === trancheId);
    const available = t.amount - t.subscribed;
    openModal(`
        <div class="modal-header"><h3>Subscribe to ${t.name}</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
        <div class="modal-body"><form onsubmit="submitSubscription(event,'${trancheId}')">
            <div class="data-grid" style="margin-bottom:16px">
                <div class="data-item"><div class="label">Coupon Rate</div><div class="value">${t.coupon_rate}%</div></div>
                <div class="data-item"><div class="label">Expected Yield</div><div class="value">${t.expected_yield}%</div></div>
                <div class="data-item"><div class="label">Available</div><div class="value">${formatPula(available)}</div></div>
                <div class="data-item"><div class="label">Risk</div><div class="value">${getRiskBadge(t.risk)}</div></div>
            </div>
            <div class="input-group"><label>Investment Amount (P)</label><input type="number" id="sub-amount" max="${available}" required placeholder="Enter amount"></div>
            <button type="submit" class="btn btn-primary btn-full">Confirm Subscription</button>
        </form></div>
    `);
}

function submitSubscription(e, trancheId) {
    e.preventDefault();
    const amount = Number(document.getElementById('sub-amount').value);
    AppStore.createSubscription({ investor_id: 'inv_1', tranche_id: trancheId, amount });
    closeModal();
    showToast('Subscription confirmed: ' + formatPula(amount), 'success');
    navigate('invest-dashboard', document.querySelector('[data-page="invest-dashboard"]'));
}

// ============================================
// SUBSCRIPTIONS (FR-15)
// ============================================
function renderSubscriptions(el) {
    el.innerHTML = `
        <div class="section-header"><h2>Subscriptions</h2></div>
        <div class="card"><div class="card-body"><div class="table-wrap"><table>
            <thead><tr><th>ID</th><th>Investor</th><th>Tranche</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>
                ${AppStore.subscriptions.map(sub => {
                    const inv = AppStore.investors.find(i => i.id === sub.investor_id);
                    const tr = AppStore.tranches.find(t => t.id === sub.tranche_id);
                    return `<tr><td>${sub.id}</td><td>${inv?.name||'N/A'}</td><td>${tr?.name||'N/A'}</td><td>${formatPula(sub.amount)}</td><td>${formatDate(sub.date)}</td><td><span class="badge-status ${sub.status}">${sub.status}</span></td></tr>`;
                }).join('')}
            </tbody></table></div></div></div>
    `;
}

// ============================================
// PAYMENTS (FR-17, FR-18, FR-19)
// ============================================
function renderPayments(el) {
    const disbursements = AppStore.payments.filter(p => p.type === 'disbursement');
    const repayments = AppStore.payments.filter(p => p.type === 'repayment');
    const payouts = AppStore.payments.filter(p => p.type === 'investor_payout');
    
    el.innerHTML = `
        <div class="section-header"><h2>Payment & Settlement</h2></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Disbursed</div><div class="stat-value">${formatPula(disbursements.reduce((s,p) => s + p.amount, 0))}</div></div>
            <div class="stat-card accent"><div class="stat-label">Total Repaid</div><div class="stat-value">${formatPula(repayments.reduce((s,p) => s + p.amount, 0))}</div></div>
            <div class="stat-card success"><div class="stat-label">Investor Payouts</div><div class="stat-value">${formatPula(payouts.reduce((s,p) => s + p.amount, 0))}</div></div>
            <div class="stat-card danger"><div class="stat-label">Late Payments</div><div class="stat-value">${repayments.filter(r => r.status === 'late').length}</div></div>
        </div>
        <div class="tabs">
            <button class="tab-btn active" onclick="showPayTab('all',this)">All Transactions</button>
            <button class="tab-btn" onclick="showPayTab('disbursement',this)">Disbursements</button>
            <button class="tab-btn" onclick="showPayTab('repayment',this)">Repayments</button>
            <button class="tab-btn" onclick="showPayTab('investor_payout',this)">Payouts</button>
        </div>
        <div class="card"><div class="card-body"><div class="table-wrap"><table>
            <thead><tr><th>Reference</th><th>Type</th><th>Entity</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody id="pay-table">
                ${AppStore.payments.map(p => {
                    const entity = p.sme_id ? AppStore.smes.find(s=>s.id===p.sme_id)?.name : AppStore.investors.find(i=>i.id===p.investor_id)?.name;
                    return `<tr data-type="${p.type}"><td><strong>${p.reference}</strong></td><td><span class="badge-status ${p.type==='disbursement'?'info':p.type==='repayment'?'active':'pending'}">${p.type.replace('_',' ')}</span></td><td>${entity||'N/A'}</td><td>${formatPula(p.amount)}</td><td>${formatDate(p.date)}</td><td><span class="badge-status ${p.status==='completed'?'active':p.status==='late'?'high':'pending'}">${p.status}${p.days_late?' ('+p.days_late+'d)':''}</span></td></tr>`;
                }).join('')}
            </tbody>
        </table></div></div></div>
    `;
}

function showPayTab(type, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#pay-table tr').forEach(row => {
        row.style.display = (type === 'all' || row.dataset.type === type) ? '' : 'none';
    });
}

// ============================================
// REGULATORY DASHBOARD (FR-21, FR-22)
// ============================================
function renderRegDashboard(el) {
    const totalExposure = AppStore.pools.reduce((s,p) => s + p.total_exposure, 0);
    const totalBorrowing = AppStore.smes.filter(s=>s.funded_amount>0).reduce((s,x)=>s+x.funded_amount,0);
    
    el.innerHTML = `
        <div class="section-header"><h2>Regulatory Dashboard</h2><div class="actions">
            <button class="btn btn-secondary" onclick="exportReport('pdf')">📄 Export PDF</button>
            <button class="btn btn-secondary" onclick="exportReport('excel')">📊 Export Excel</button>
        </div></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Risk Exposure</div><div class="stat-value">${formatPula(totalExposure)}</div></div>
            <div class="stat-card accent"><div class="stat-label">Aggregate SME Borrowing</div><div class="stat-value">${formatPula(totalBorrowing)}</div></div>
            <div class="stat-card ${AppStore.getDefaultRate()>10?'danger':'success'}"><div class="stat-label">Systemic Risk Indicator</div><div class="stat-value">${AppStore.getDefaultRate() > 10 ? 'ELEVATED' : 'NORMAL'}</div></div>
        </div>
        <div class="grid-2">
            <div class="card"><div class="card-header"><h4>Risk Exposure by Pool</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-reg-exposure"></canvas></div></div></div>
            <div class="card"><div class="card-header"><h4>Compliance Summary (NBFIRA)</h4></div><div class="card-body">
                <div style="padding:16px">
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>Capital Adequacy</span><span class="badge-status active">Compliant</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>Risk Reporting</span><span class="badge-status active">Up to Date</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>KYC/AML Compliance</span><span class="badge-status active">Verified</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>Data Protection (BDPA)</span><span class="badge-status active">Compliant</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0"><span>Audit Status</span><span class="badge-status pending">Due Apr 2026</span></div>
                </div>
            </div></div>
        </div>
    `;
    
    chartInstances.regExp = new Chart(document.getElementById('chart-reg-exposure'), {
        type: 'bar',
        data: { labels: AppStore.pools.map(p => p.name), datasets: [{ label: 'Exposure (P)', data: AppStore.pools.map(p => p.total_exposure), backgroundColor: ['#0D6E4F','#C4922A'], borderRadius: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => 'P' + (v/1000000).toFixed(1) + 'M' } } } }
    });
}

function exportReport(format) {
    showToast('Report exported as ' + format.toUpperCase(), 'success');
    logAudit('report_exported', { format });
}

// ============================================
// USER MANAGEMENT (FR-24)
// ============================================
function renderUserMgmt(el) {
    const users = JSON.parse(localStorage.getItem('kc_users') || '[]');
    el.innerHTML = `
        <div class="section-header"><h2>User Management</h2></div>
        <div class="card"><div class="card-body"><div class="table-wrap"><table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>KYC</th><th>Created</th><th>Actions</th></tr></thead><tbody>
                ${users.map(u => `<tr>
                    <td><strong>${u.name}</strong><br><span style="font-size:0.8rem;color:var(--text-muted)">${u.org||''}</span></td>
                    <td>${u.email}</td>
                    <td><span class="badge-status info">${u.role}</span></td>
                    <td><span class="badge-status ${u.status}">${u.status}</span></td>
                    <td>${u.kyc_verified ? '<span class="badge-status active">Verified</span>' : '<span class="badge-status pending">Pending</span>'}</td>
                    <td>${formatDate(u.created_at)}</td>
                    <td>
                        ${u.status==='pending' ? `<button class="btn btn-sm btn-primary" onclick="approveUser('${u.email}')">Approve</button>` : ''}
                        ${u.status==='active' ? `<button class="btn btn-sm btn-danger" onclick="suspendUser('${u.email}')">Suspend</button>` : ''}
                        ${u.status==='suspended' ? `<button class="btn btn-sm btn-secondary" onclick="activateUser('${u.email}')">Activate</button>` : ''}
                    </td>
                </tr>`).join('')}
                ${users.length === 0 ? '<tr><td colspan="7" class="empty-state"><p>No registered users yet</p></td></tr>' : ''}
            </tbody>
        </table></div></div></div>
    `;
}

function approveUser(email) {
    const users = JSON.parse(localStorage.getItem('kc_users') || '[]');
    const u = users.find(x => x.email === email);
    if (u) { u.status = 'active'; localStorage.setItem('kc_users', JSON.stringify(users)); logAudit('user_approved', { email }); }
    showToast('User approved', 'success');
    navigate('user-mgmt', document.querySelector('[data-page="user-mgmt"]'));
}

function suspendUser(email) {
    const users = JSON.parse(localStorage.getItem('kc_users') || '[]');
    const u = users.find(x => x.email === email);
    if (u) { u.status = 'suspended'; localStorage.setItem('kc_users', JSON.stringify(users)); logAudit('user_suspended', { email }); }
    showToast('User suspended', 'warning');
    navigate('user-mgmt', document.querySelector('[data-page="user-mgmt"]'));
}

function activateUser(email) {
    const users = JSON.parse(localStorage.getItem('kc_users') || '[]');
    const u = users.find(x => x.email === email);
    if (u) { u.status = 'active'; localStorage.setItem('kc_users', JSON.stringify(users)); logAudit('user_reactivated', { email }); }
    showToast('User reactivated', 'success');
    navigate('user-mgmt', document.querySelector('[data-page="user-mgmt"]'));
}

// ============================================
// SYSTEM CONFIG (FR-25)
// ============================================
function renderSysConfig(el) {
    const c = AppStore.config;
    el.innerHTML = `
        <div class="section-header"><h2>System Configuration</h2></div>
        <div class="grid-2">
            <div class="card"><div class="card-header"><h4>Risk Thresholds</h4></div><div class="card-body">
                <form onsubmit="saveConfig(event)">
                    <div class="input-group"><label>Low Risk Threshold (score ≥)</label><input type="number" id="cfg-low" value="${c.risk_thresholds.low}"></div>
                    <div class="input-group"><label>Medium Risk Threshold (score ≥)</label><input type="number" id="cfg-med" value="${c.risk_thresholds.medium}"></div>
                    <div class="input-group"><label>Interest Rate Benchmark (%)</label><input type="number" step="0.1" id="cfg-rate" value="${c.interest_benchmark}"></div>
                    <div class="input-group"><label>Late Payment Penalty (%)</label><input type="number" step="0.1" id="cfg-penalty" value="${c.penalty_rate}"></div>
                    <div class="form-grid">
                        <div class="input-group"><label>Min Pool Size</label><input type="number" id="cfg-pool-min" value="${c.pool_size_min}"></div>
                        <div class="input-group"><label>Max Pool Size</label><input type="number" id="cfg-pool-max" value="${c.pool_size_max}"></div>
                    </div>
                    <div class="input-group"><label>Max Pool Exposure (P)</label><input type="number" id="cfg-max-exp" value="${c.max_pool_exposure}"></div>
                    <button type="submit" class="btn btn-primary">Save Configuration</button>
                </form>
            </div></div>
            <div class="card"><div class="card-header"><h4>System Status</h4></div><div class="card-body">
                <div style="padding:8px 0">
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>Platform Status</span><span class="badge-status active">Online</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>Uptime (30d)</span><span style="font-weight:600">99.7%</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>API Status</span><span class="badge-status active">Healthy</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>Database</span><span class="badge-status active">Connected</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>Last Backup</span><span style="font-size:0.85rem">${formatDateTime(new Date(Date.now()-86400000))}</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-light)"><span>Encryption</span><span class="badge-status active">TLS 1.3 + AES-256</span></div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0"><span>Version</span><span style="font-size:0.85rem">v1.0.0-beta</span></div>
                </div>
            </div></div>
        </div>
    `;
}

function saveConfig(e) {
    e.preventDefault();
    AppStore.config = {
        risk_thresholds: { low: Number(document.getElementById('cfg-low').value), medium: Number(document.getElementById('cfg-med').value) },
        interest_benchmark: Number(document.getElementById('cfg-rate').value),
        penalty_rate: Number(document.getElementById('cfg-penalty').value),
        pool_size_min: Number(document.getElementById('cfg-pool-min').value),
        pool_size_max: Number(document.getElementById('cfg-pool-max').value),
        max_pool_exposure: Number(document.getElementById('cfg-max-exp').value),
        currency: 'BWP'
    };
    AppStore.save('config');
    logAudit('config_updated', AppStore.config);
    showToast('Configuration saved', 'success');
}

// ============================================
// AUDIT LOG (FR-20)
// ============================================
function renderAuditLog(el) {
    const logs = JSON.parse(localStorage.getItem('kc_audit_logs') || '[]').slice(0, 100);
    el.innerHTML = `
        <div class="section-header"><h2>Audit Log</h2><span style="color:var(--text-muted);font-size:0.85rem">${logs.length} entries (7-year retention)</span></div>
        <div class="card"><div class="card-body"><div class="table-wrap"><table>
            <thead><tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Details</th></tr></thead><tbody>
                ${logs.map(l => `<tr>
                    <td style="font-size:0.8rem;white-space:nowrap">${formatDateTime(l.timestamp)}</td>
                    <td>${l.user_name}</td>
                    <td><span class="badge-status info">${l.user_role}</span></td>
                    <td><strong>${l.action}</strong></td>
                    <td style="font-size:0.8rem;max-width:300px;overflow:hidden;text-overflow:ellipsis">${l.details}</td>
                </tr>`).join('')}
                ${logs.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">No audit entries yet</td></tr>' : ''}
            </tbody>
        </table></div></div></div>
    `;
}

// ============================================
// PORTFOLIO ANALYTICS (FR-27)
// ============================================
function renderAnalytics(el) {
    const sectors = AppStore.getSectorDistribution();
    el.innerHTML = `
        <div class="section-header"><h2>Portfolio Analytics</h2></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Capital Mobilized</div><div class="stat-value">${formatPula(AppStore.getTotalCapital())}</div></div>
            <div class="stat-card danger"><div class="stat-label">Default Rate</div><div class="stat-value">${formatPercent(AppStore.getDefaultRate())}</div></div>
            <div class="stat-card accent"><div class="stat-label">Average Yield</div><div class="stat-value">${formatPercent(AppStore.getAvgYield())}</div></div>
            <div class="stat-card success"><div class="stat-label">Active Pools</div><div class="stat-value">${AppStore.pools.length}</div></div>
        </div>
        <div class="grid-2">
            <div class="card"><div class="card-header"><h4>Sector Distribution</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-an-sector"></canvas></div></div></div>
            <div class="card"><div class="card-header"><h4>Monthly Transaction Volume</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-an-vol"></canvas></div></div></div>
        </div>
        <div class="card" style="margin-top:20px"><div class="card-header"><h4>Yield by Tranche Type</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-an-yield"></canvas></div></div></div>
    `;
    
    chartInstances.anSector = new Chart(document.getElementById('chart-an-sector'), {
        type: 'polarArea',
        data: { labels: Object.keys(sectors), datasets: [{ data: Object.values(sectors), backgroundColor: ['#0D6E4F80','#14A07380','#C4922A80','#E5B94E80','#2563EB80'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    
    chartInstances.anVol = new Chart(document.getElementById('chart-an-vol'), {
        type: 'line',
        data: { labels: ['Sep','Oct','Nov','Dec','Jan','Feb'], datasets: [{ label: 'Volume (P)', data: [0,0,1250000,1250000,1657000,1764000], borderColor: '#0D6E4F', backgroundColor: 'rgba(13,110,79,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#0D6E4F' }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => 'P' + (v/1000000).toFixed(1) + 'M' } } } }
    });
    
    const types = ['senior', 'mezzanine', 'junior'];
    const avgYields = types.map(t => { const ts = AppStore.tranches.filter(tr => tr.type === t); return ts.length ? ts.reduce((s,tr) => s + tr.expected_yield, 0) / ts.length : 0; });
    chartInstances.anYield = new Chart(document.getElementById('chart-an-yield'), {
        type: 'bar',
        data: { labels: ['Senior', 'Mezzanine', 'Junior'], datasets: [{ label: 'Avg Expected Yield (%)', data: avgYields, backgroundColor: ['#0D6E4F','#C4922A','#EF4444'], borderRadius: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v + '%' } } } }
    });
}

// ============================================
// ECONOMIC IMPACT (FR-28)
// ============================================
function renderImpact(el) {
    const jobs = AppStore.getTotalJobs();
    const funded = AppStore.smes.filter(s => s.funded_amount > 0).length;
    const totalFunded = AppStore.smes.reduce((s,x) => s + x.funded_amount, 0);
    
    el.innerHTML = `
        <div class="section-header"><h2>Economic Impact Tracking</h2></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Jobs Supported</div><div class="stat-value">${jobs}</div><div class="stat-change up">Across ${funded} funded SMEs</div></div>
            <div class="stat-card accent"><div class="stat-label">Total Funding Deployed</div><div class="stat-value">${formatPula(totalFunded)}</div></div>
            <div class="stat-card success"><div class="stat-label">Sectors Impacted</div><div class="stat-value">${Object.keys(AppStore.getSectorDistribution()).length}</div></div>
            <div class="stat-card"><div class="stat-label">Avg Revenue Growth</div><div class="stat-value">18.5%</div><div class="stat-change up">Post-funding estimate</div></div>
        </div>
        <div class="grid-2">
            <div class="card"><div class="card-header"><h4>Jobs by Sector</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-impact-jobs"></canvas></div></div></div>
            <div class="card"><div class="card-header"><h4>Funding Impact Timeline</h4></div><div class="card-body"><div class="chart-container"><canvas id="chart-impact-time"></canvas></div></div></div>
        </div>
    `;
    
    const sectorJobs = {};
    AppStore.smes.filter(s => s.status === 'approved').forEach(s => { sectorJobs[s.sector] = (sectorJobs[s.sector] || 0) + (s.employees || 0); });
    
    chartInstances.impJobs = new Chart(document.getElementById('chart-impact-jobs'), {
        type: 'bar',
        data: { labels: Object.keys(sectorJobs), datasets: [{ label: 'Jobs', data: Object.values(sectorJobs), backgroundColor: '#0D6E4F', borderRadius: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
    });
    
    chartInstances.impTime = new Chart(document.getElementById('chart-impact-time'), {
        type: 'line',
        data: { labels: ['Q3 2024','Q4 2024','Q1 2025','Q2 2025'], datasets: [
            { label: 'SMEs Funded', data: [0, 2, 4, 5], borderColor: '#0D6E4F', tension: 0.4, yAxisID: 'y' },
            { label: 'Capital Deployed (P)', data: [0, 1250000, 1550000, 1800000], borderColor: '#C4922A', tension: 0.4, yAxisID: 'y1' }
        ]},
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'SMEs' } }, y1: { position: 'right', beginAtZero: true, grid: { display: false }, ticks: { callback: v => 'P' + (v/1000000).toFixed(1) + 'M' } } }, plugins: { legend: { position: 'bottom' } } }
    });
}
