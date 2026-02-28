// ============================================
// APPLICATION DATA STORE
// ============================================
const AppStore = {
    currentUser: JSON.parse(localStorage.getItem('kc_user') || 'null'),
    config: JSON.parse(localStorage.getItem('kc_config') || 'null') || {
        risk_thresholds: { low: 70, medium: 40 },
        interest_benchmark: 7.5,
        pool_size_min: 5, pool_size_max: 50,
        max_pool_exposure: 50000000,
        penalty_rate: 2.5, currency: 'BWP'
    },

    smes: JSON.parse(localStorage.getItem('kc_smes') || 'null') || [
        { id:'sme_1', name:'Mosweu Engineering (Pty) Ltd', sector:'Manufacturing', owner:'Kago Mosweu', email:'sme@kgotla.co.bw', registration_no:'BW-2019-00234', tax_id:'TIN-78901', status:'approved', risk_level:'low', credit_score:78, revenue:4500000, expenses:3200000, net_income:1300000, total_assets:8200000, total_liabilities:3100000, current_assets:2800000, current_liabilities:1200000, tax_compliant:true, license_valid:true, license_expiry:'2026-12-31', liquidity_ratio:2.33, leverage_ratio:0.38, profitability_ratio:0.29, cash_flow_projection:[380000,410000,395000,425000,440000,460000], repayment_history:[100,100,100,95,100,100], created_at:'2024-06-15', eligible:true, pool_id:'pool_1', funded_amount:500000, employees:24 },
        { id:'sme_2', name:'Gaborone Fresh Foods', sector:'Agriculture', owner:'Mpho Banda', email:'mpho@fresh.co.bw', registration_no:'BW-2020-00567', tax_id:'TIN-56789', status:'approved', risk_level:'low', credit_score:82, revenue:6200000, expenses:4800000, net_income:1400000, total_assets:12000000, total_liabilities:4500000, current_assets:3500000, current_liabilities:1800000, tax_compliant:true, license_valid:true, license_expiry:'2027-03-15', liquidity_ratio:1.94, leverage_ratio:0.375, profitability_ratio:0.226, cash_flow_projection:[420000,450000,430000,470000,490000,510000], repayment_history:[100,100,100,100,100,100], created_at:'2024-08-22', eligible:true, pool_id:'pool_1', funded_amount:750000, employees:45 },
        { id:'sme_3', name:'Maun Safari Tech', sector:'Tourism', owner:'Lesego Tau', email:'lesego@safaritech.co.bw', registration_no:'BW-2021-00890', tax_id:'TIN-34567', status:'approved', risk_level:'medium', credit_score:55, revenue:3100000, expenses:2600000, net_income:500000, total_assets:5500000, total_liabilities:2800000, current_assets:1500000, current_liabilities:1100000, tax_compliant:true, license_valid:true, license_expiry:'2026-06-30', liquidity_ratio:1.36, leverage_ratio:0.51, profitability_ratio:0.161, cash_flow_projection:[180000,160000,200000,220000,190000,210000], repayment_history:[100,95,90,100,85,100], created_at:'2024-10-05', eligible:true, pool_id:'pool_2', funded_amount:300000, employees:18 },
        { id:'sme_4', name:'Francistown Auto Parts', sector:'Retail', owner:'Tiro Nkwe', email:'tiro@autoparts.co.bw', registration_no:'BW-2018-00123', tax_id:'TIN-12345', status:'approved', risk_level:'medium', credit_score:48, revenue:2800000, expenses:2400000, net_income:400000, total_assets:4200000, total_liabilities:2500000, current_assets:1300000, current_liabilities:1000000, tax_compliant:true, license_valid:true, license_expiry:'2026-09-30', liquidity_ratio:1.3, leverage_ratio:0.595, profitability_ratio:0.143, cash_flow_projection:[120000,140000,110000,130000,150000,140000], repayment_history:[100,90,85,90,95,80], created_at:'2024-04-12', eligible:true, pool_id:'pool_2', funded_amount:250000, employees:12 },
        { id:'sme_5', name:'Kasane Logistics', sector:'Transport', owner:'Boitumelo Segwe', email:'boi@kaslog.co.bw', registration_no:'BW-2022-01234', tax_id:'TIN-99887', status:'approved', risk_level:'high', credit_score:32, revenue:1800000, expenses:1700000, net_income:100000, total_assets:3000000, total_liabilities:2200000, current_assets:800000, current_liabilities:900000, tax_compliant:false, license_valid:true, license_expiry:'2026-03-31', liquidity_ratio:0.89, leverage_ratio:0.73, profitability_ratio:0.056, cash_flow_projection:[60000,40000,80000,50000,70000,45000], repayment_history:[90,80,70,85,75,80], created_at:'2025-01-08', eligible:false, pool_id:null, funded_amount:0, employees:8 },
        { id:'sme_6', name:'Selibe Phikwe Mining Supplies', sector:'Mining', owner:'Keabetswe Rathipa', email:'kea@minsup.co.bw', registration_no:'BW-2020-00789', tax_id:'TIN-44556', status:'pending', risk_level:'medium', credit_score:52, revenue:3800000, expenses:3100000, net_income:700000, total_assets:6800000, total_liabilities:3600000, current_assets:2000000, current_liabilities:1500000, tax_compliant:true, license_valid:true, license_expiry:'2026-11-30', liquidity_ratio:1.33, leverage_ratio:0.529, profitability_ratio:0.184, cash_flow_projection:[200000,220000,190000,230000,210000,240000], repayment_history:[100,100,95,90,100,95], created_at:'2025-02-01', eligible:true, pool_id:null, funded_amount:0, employees:22 },
    ],

    // ---- POOLS (FR-9) ----
    pools: JSON.parse(localStorage.getItem('kc_pools') || 'null') || [
        { id:'pool_1', name:'Green Growth Fund I', risk_level:'low', sme_ids:['sme_1','sme_2'], total_exposure:1250000, avg_credit_score:80, status:'active', created_at:'2024-11-01', coupon_rate:7.5, maturity_months:36 },
        { id:'pool_2', name:'Diversified SME Fund II', risk_level:'medium', sme_ids:['sme_3','sme_4'], total_exposure:550000, avg_credit_score:51.5, status:'active', created_at:'2025-01-15', coupon_rate:10.2, maturity_months:24 },
    ],

    // ---- TRANCHES (FR-10) ----
    tranches: JSON.parse(localStorage.getItem('kc_tranches') || 'null') || [
        { id:'tr_1', pool_id:'pool_1', name:'Senior Tranche', type:'senior', allocation_pct:60, coupon_rate:6.5, expected_yield:6.8, amount:750000, subscribed:680000, risk:'low' },
        { id:'tr_2', pool_id:'pool_1', name:'Mezzanine Tranche', type:'mezzanine', allocation_pct:25, coupon_rate:9.0, expected_yield:9.5, amount:312500, subscribed:250000, risk:'medium' },
        { id:'tr_3', pool_id:'pool_1', name:'Junior Tranche', type:'junior', allocation_pct:15, coupon_rate:13.0, expected_yield:14.2, amount:187500, subscribed:120000, risk:'high' },
        { id:'tr_4', pool_id:'pool_2', name:'Senior Tranche', type:'senior', allocation_pct:55, coupon_rate:8.0, expected_yield:8.4, amount:302500, subscribed:200000, risk:'low' },
        { id:'tr_5', pool_id:'pool_2', name:'Mezzanine Tranche', type:'mezzanine', allocation_pct:30, coupon_rate:11.5, expected_yield:12.1, amount:165000, subscribed:100000, risk:'medium' },
        { id:'tr_6', pool_id:'pool_2', name:'Junior Tranche', type:'junior', allocation_pct:15, coupon_rate:16.0, expected_yield:17.5, amount:82500, subscribed:40000, risk:'high' },
    ],

    // ---- INVESTORS (FR-13) ----
    investors: JSON.parse(localStorage.getItem('kc_investors') || 'null') || [
        { id:'inv_1', name:'Botswana Pension Fund', email:'investor@kgotla.co.bw', type:'pension_fund', mandate:'Conservative', risk_appetite:'low', total_invested:680000, created_at:'2024-09-01' },
        { id:'inv_2', name:'African Alliance Capital', email:'aa@alliance.co.bw', type:'asset_manager', mandate:'Balanced', risk_appetite:'medium', total_invested:350000, created_at:'2024-10-15' },
        { id:'inv_3', name:'Stanbic Bank Botswana', email:'corp@stanbic.co.bw', type:'bank', mandate:'Growth', risk_appetite:'medium', total_invested:220000, created_at:'2025-01-05' },
    ],

    // ---- SUBSCRIPTIONS (FR-15) ----
    subscriptions: JSON.parse(localStorage.getItem('kc_subscriptions') || 'null') || [
        { id:'sub_1', investor_id:'inv_1', tranche_id:'tr_1', amount:680000, status:'confirmed', date:'2024-11-15' },
        { id:'sub_2', investor_id:'inv_2', tranche_id:'tr_2', amount:250000, status:'confirmed', date:'2024-11-20' },
        { id:'sub_3', investor_id:'inv_2', tranche_id:'tr_4', amount:100000, status:'confirmed', date:'2025-01-20' },
        { id:'sub_4', investor_id:'inv_3', tranche_id:'tr_3', amount:120000, status:'pending', date:'2025-02-10' },
    ],

    // ---- PAYMENTS (FR-17, FR-18, FR-19) ----
    payments: JSON.parse(localStorage.getItem('kc_payments') || 'null') || [
        { id:'pay_1', type:'disbursement', sme_id:'sme_1', amount:500000, date:'2024-12-01', status:'completed', reference:'DISB-2024-001' },
        { id:'pay_2', type:'disbursement', sme_id:'sme_2', amount:750000, date:'2024-12-01', status:'completed', reference:'DISB-2024-002' },
        { id:'pay_3', type:'repayment', sme_id:'sme_1', amount:45000, date:'2025-01-15', status:'completed', reference:'REP-2025-001', scheduled:45000 },
        { id:'pay_4', type:'repayment', sme_id:'sme_1', amount:45000, date:'2025-02-15', status:'completed', reference:'REP-2025-002', scheduled:45000 },
        { id:'pay_5', type:'repayment', sme_id:'sme_2', amount:62000, date:'2025-01-15', status:'completed', reference:'REP-2025-003', scheduled:62000 },
        { id:'pay_6', type:'repayment', sme_id:'sme_2', amount:62000, date:'2025-02-15', status:'late', reference:'REP-2025-004', scheduled:62000, days_late:5 },
        { id:'pay_7', type:'investor_payout', investor_id:'inv_1', amount:3680, date:'2025-01-31', status:'completed', reference:'PAY-2025-001', tranche_id:'tr_1' },
        { id:'pay_8', type:'investor_payout', investor_id:'inv_2', amount:1875, date:'2025-01-31', status:'completed', reference:'PAY-2025-002', tranche_id:'tr_2' },
        { id:'pay_9', type:'disbursement', sme_id:'sme_3', amount:300000, date:'2025-02-01', status:'completed', reference:'DISB-2025-001' },
    ],

    // ---- NOTIFICATIONS (FR-26) ----
    notifications: [
        { id:'n1', title:'SME Application Pending', desc:'Selibe Phikwe Mining Supplies awaits approval', type:'info', read:false, time:'2025-02-28T08:00:00Z' },
        { id:'n2', title:'Late Payment Alert', desc:'Gaborone Fresh Foods - 5 days overdue', type:'warning', read:false, time:'2025-02-20T14:30:00Z' },
        { id:'n3', title:'New Subscription', desc:'Stanbic Bank subscribed P120,000 to Junior Tranche', type:'success', read:false, time:'2025-02-10T10:00:00Z' },
        { id:'n4', title:'License Expiry Warning', desc:'Kasane Logistics license expires in 30 days', type:'warning', read:true, time:'2025-02-01T09:00:00Z' },
        { id:'n5', title:'Monthly Risk Report Ready', desc:'January 2025 portfolio risk report generated', type:'info', read:true, time:'2025-02-01T00:00:00Z' },
    ],

    // ---- METHODS ----
    save(key) {
        localStorage.setItem('kc_' + key, JSON.stringify(this[key]));
    },

    addSME(sme) {
        sme.id = generateId();
        sme.created_at = new Date().toISOString();
        sme.status = 'pending';
        this.smes.push(sme);
        this.save('smes');
        logAudit('sme_created', { sme_id: sme.id, name: sme.name });
        return sme;
    },

    updateSME(id, data) {
        const idx = this.smes.findIndex(s => s.id === id);
        if (idx > -1) { Object.assign(this.smes[idx], data); this.save('smes'); logAudit('sme_updated', { sme_id: id, changes: Object.keys(data) }); }
    },

    approveSME(id) {
        this.updateSME(id, { status: 'approved' });
        logAudit('sme_approved', { sme_id: id });
    },

    rejectSME(id) {
        this.updateSME(id, { status: 'rejected' });
        logAudit('sme_rejected', { sme_id: id });
    },

    createPool(pool) {
        pool.id = generateId();
        pool.created_at = new Date().toISOString();
        pool.status = 'active';
        this.pools.push(pool);
        this.save('pools');
        logAudit('pool_created', { pool_id: pool.id, name: pool.name });
        return pool;
    },

    createSubscription(sub) {
        sub.id = generateId();
        sub.date = new Date().toISOString();
        sub.status = 'confirmed';
        this.subscriptions.push(sub);
        // Update tranche subscribed amount
        const tr = this.tranches.find(t => t.id === sub.tranche_id);
        if (tr) tr.subscribed += sub.amount;
        this.save('subscriptions');
        this.save('tranches');
        logAudit('subscription_created', { sub_id: sub.id, amount: sub.amount });
        return sub;
    },

    addPayment(payment) {
        payment.id = generateId();
        payment.date = new Date().toISOString();
        this.payments.push(payment);
        this.save('payments');
        logAudit('payment_recorded', { payment_id: payment.id, type: payment.type, amount: payment.amount });
        return payment;
    },

    getPoolSMEs(poolId) { return this.smes.filter(s => s.pool_id === poolId); },
    getPoolTranches(poolId) { return this.tranches.filter(t => t.pool_id === poolId); },
    
    // Analytics helpers (FR-27, FR-28)
    getTotalCapital() { return this.payments.filter(p => p.type === 'disbursement' && p.status === 'completed').reduce((s, p) => s + p.amount, 0); },
    getDefaultRate() { const late = this.payments.filter(p => p.type === 'repayment' && p.status === 'late').length; const total = this.payments.filter(p => p.type === 'repayment').length; return total ? (late / total * 100) : 0; },
    getAvgYield() { const t = this.tranches; return t.length ? t.reduce((s, tr) => s + tr.expected_yield, 0) / t.length : 0; },
    getTotalJobs() { return this.smes.filter(s => s.status === 'approved').reduce((s, sme) => s + (sme.employees || 0), 0); },
    getSectorDistribution() {
        const sectors = {};
        this.smes.filter(s => s.status === 'approved').forEach(s => { sectors[s.sector] = (sectors[s.sector] || 0) + (s.funded_amount || 0); });
        return sectors;
    }
};
