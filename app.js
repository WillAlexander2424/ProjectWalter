// ===== PROJECT WALTER — PROTOTYPE INTERACTIONS =====

document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation ---
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const views = document.querySelectorAll('.view');

    function switchView(viewId) {
        views.forEach(v => v.classList.remove('active'));
        navItems.forEach(n => n.classList.remove('active'));
        const target = document.getElementById(`view-${viewId}`);
        if (target) {
            target.classList.add('active');
            document.querySelector(`.nav-item[data-view="${viewId}"]`)?.classList.add('active');
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.view);
        });
    });

    // --- Sidebar Toggle ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const hamburgerBtn = document.getElementById('hamburgerBtn');

    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.add('collapsed');
    });

    hamburgerBtn?.addEventListener('click', () => {
        sidebar.classList.remove('collapsed');
    });

    // --- Settings Dropdown (Gemini-style) ---
    const settingsContainer = document.querySelector('.settings-dropdown-container');
    const settingsTrigger = document.getElementById('settingsDropdownTrigger');

    settingsTrigger?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        settingsContainer.classList.toggle('open');
    });

    // Close settings dropdown on outside click
    document.addEventListener('click', (e) => {
        if (settingsContainer && !settingsContainer.contains(e.target)) {
            settingsContainer.classList.remove('open');
        }
    });

    // Dropdown items navigate to settings + scroll to section
    document.querySelectorAll('.dropdown-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            settingsContainer.classList.remove('open');
            switchView(item.dataset.view);
            const section = item.dataset.section;
            if (section) {
                setTimeout(() => {
                    const target = document.getElementById('settings-' + section);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });

    // --- Suggestion Chips (Walter Chat) ---
    document.querySelectorAll('.chat-suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
            simulateChat(btn.dataset.prompt);
        });
    });

    // --- Chat ---
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');

    function simulateChat(text) {
        // Remove welcome screen
        const welcome = chatMessages.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'message message-user';
        userMsg.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
        chatMessages.appendChild(userMsg);

        // Add thinking indicator
        const thinking = document.createElement('div');
        thinking.className = 'message message-assistant';
        thinking.innerHTML = `
            <div class="message-avatar">W</div>
            <div class="message-bubble">
                <div class="thinking-indicator"><span></span><span></span><span></span></div>
            </div>
        `;
        chatMessages.appendChild(thinking);
        scrollChat();

        // Simulate processing
        setTimeout(() => {
            thinking.remove();

            const t = text.toLowerCase().trim();
            const isYes = (t === 'yes' || t === 'yes.' || t === 'yes please' || t === 'yep' || t === 'do it' || t === 'go ahead');
            const isBeaumont = t.includes('beaumont') || (t.includes('24') && t.includes('freemans'));
            const isExpiry = t.includes('expir') || t.includes('ponsonby');
            const isRisk = t.includes('risk') || t.includes('south auckland');
            const isWallace = t.includes('wallace') || (t.includes('match') && (t.includes('tenant') || t.includes('investor')));
            const isCostello = t.includes('costello') || (t.includes('market report') && t.includes('owner'));
            const isCPI = t.includes('cpi') || t.includes('adjustment');
            const isDeed = t.includes('deed') || t.includes('conditional on');
            const isFloor = t.includes('floor area') || t.includes('verification') || t.includes('boma');
            const isRetailClauses = t.includes('retail') && (t.includes('clause') || t.includes('review'));
            const isConsent = t.includes('withhold') || t.includes('consent') || t.includes('assignment');
            const isMaintenance = t.includes('maintenance') || t.includes('pla 2007') || t.includes('property law');
            const isREA = t.includes('rea') || t.includes('disclosure') || t.includes('disciplin');
            const isOPEX = t.includes('opex') && (t.includes('dispute') || t.includes('capital'));

            let response = '';

            if (isBeaumont) {
                response = getBeaumontResponse();
            } else if (isWallace) {
                response = getWallaceResponse();
            } else if (isCostello) {
                response = getCostelloResponse();
            } else if (isCPI) {
                response = getCPIResponse();
            } else if (isDeed) {
                response = getDeedResponse();
            } else if (isFloor) {
                response = getFloorResponse();
            } else if (isRetailClauses) {
                response = getRetailClausesResponse();
            } else if (isConsent) {
                response = getConsentResponse();
            } else if (isMaintenance) {
                response = getMaintenanceResponse();
            } else if (isREA) {
                response = getREAResponse();
            } else if (isOPEX) {
                response = getOPEXDisputeResponse();
            } else if (isExpiry) {
                response = getExpiryResponse();
            } else if (isRisk) {
                response = getRiskResponse();
            } else if (isYes) {
                response = getConfirmResponse();
            } else {
                response = getGenericResponse(text);
            }

            const assistantMsg = document.createElement('div');
            assistantMsg.className = 'message message-assistant';
            assistantMsg.innerHTML = `
                <div class="message-avatar">W</div>
                <div class="message-bubble">${response}</div>
            `;
            chatMessages.appendChild(assistantMsg);
            scrollChat();
        }, 2200);
    }

    function getBeaumontResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Queried CRM database — match found</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> LINZ title search — Beaumont Trustees Ltd</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> ICP Registry — Active since Nov 2022</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> NZBN entity check — Lumiere Design Group Ltd</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> OpenClaw scan — 6 active Seek listings detected</div>
            </div>
            <strong>24-28 Beaumont Street, Freemans Bay</strong><br><br>
            I've completed a full analysis across 5 data streams. Here's the summary:<br><br>
            <strong>Tenant:</strong> Lumiere Design Group Ltd (NZBN: 942904600XXXX)<br>
            <strong>Owner:</strong> Beaumont Trustees Ltd — Marcus Miller (Director)<br>
            <strong>Lease:</strong> Predicted commencement Nov 2022, expiry Nov 2026 (+/- 22 days)<br>
            <strong>$/sqm:</strong> $395 — in line with Freemans Bay Grade A office<br>
            <strong>Stickiness Index:</strong> 92% renewal probability<br><br>
            <strong>Key Signals:</strong><br>
            &#9650; $450k fit-out investment (LINZ consents)<br>
            &#9650; 6 active job postings for Project Leads<br>
            &#9650; 2025 annual return filed on time<br><br>
            <strong>Strategic Play:</strong> <em>Retention Advisor + Expansion.</em> Don't wait for the 2026 renewal. Approach Marcus Miller about Suite 2B vacancy, then pitch Sophie Chen a Blend and Extend into an 8-year term.<br><br>
            <a href="#" onclick="document.getElementById('strategyModal').classList.add('active'); return false;" style="color: var(--blue); text-decoration: none; font-weight: 500;">View full Walter Strategy Card &rarr;</a>
        `;
    }

    function getExpiryResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Filtered database — Ponsonby, lease expiry within 12 months</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Cross-referenced ICP and NZBN signals</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Applied stickiness scoring model</div>
            </div>
            <strong>Ponsonby — Lease Expiries (Next 12 Months)</strong><br><br>
            Found <strong>14 properties</strong> with predicted lease expiries in Ponsonby over the next 12 months:<br><br>
            <strong>High Priority (Flight Risk):</strong><br>
            &bull; <strong>12 Ponsonby Rd</strong> — Cafe Nero Ltd · Expiry Aug 2026 · Stickiness: 34% · Recent Google review decline<br>
            &bull; <strong>88 Ponsonby Rd</strong> — Vibe Studio Ltd · Expiry Oct 2026 · Stickiness: 41% · Late annual return<br><br>
            <strong>Expansion Opportunities:</strong><br>
            &bull; <strong>45 Ponsonby Rd</strong> — Archimedia Design · Expiry Dec 2026 · Stickiness: 88% · 4 new hires<br>
            &bull; <strong>102 Ponsonby Rd</strong> — Lumina Health · Expiry Nov 2026 · Stickiness: 91% · Fit-out $320k<br><br>
            <strong>Stable / Monitor:</strong><br>
            &bull; 10 additional properties with renewal probability >70%<br><br>
            Would you like me to generate Strategy Cards for the high-priority properties, or focus on the expansion opportunities?
        `;
    }

    function getRiskResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Filtered — South Auckland, Industrial, elevated risk signals</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> NZBN annual return status check</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> OpenClaw business vitality scan</div>
            </div>
            <strong>South Auckland Industrial — Elevated Flight Risk</strong><br><br>
            Identified <strong>8 tenants</strong> with high flight risk signals across South Auckland industrial:<br><br>
            &bull; <strong>Pacific Traders Ltd</strong> — 45 Queen St · Annual return 3 months overdue · Google reviews declining · Score: 28%<br>
            &bull; <strong>Atlas Logistics NZ</strong> — 22 Wiri Station Rd · Director linked to recent liquidation · Score: 31%<br>
            &bull; <strong>Southern Steel Fabrication</strong> — 8 Kerrs Rd, Manukau · ICP consumption dropped 40% · Score: 35%<br><br>
            <strong>Recommended Actions:</strong><br>
            1. Immediate landlord engagement for Pacific Traders — prepare backfill strategy<br>
            2. Monitor Atlas Logistics monthly — director contagion risk<br>
            3. Check Southern Steel ICP trend next 30 days before escalating<br><br>
            Shall I generate a Pre-emptive Backfill strategy for any of these properties?
        `;
    }

    function getWallaceResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Wallace activated — scanning market for 33 Crummer Rd matches</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Searched Bayleys database — 3 active tenant requirements matched</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Scanned competitor listings — Colliers, CBRE, JLL</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Checked Walter signals — ICP activations, Seek, NZBN</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Scored 8 matches by compatibility</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
                <div style="width:28px;height:28px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;flex-shrink:0;">W</div>
                <div><strong>Wallace — Matching Report for 33 Crummer Rd</strong><br><span style="font-size:12px;color:var(--text-tertiary);">8 matches found · 5 high compatibility · 2 conjunctional opportunities</span></div>
            </div>
            <strong>Top Tenant Matches:</strong><br><br>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--green-light);border-radius:6px;margin-bottom:6px;font-size:13px;">
                <span><strong>Tidal Creative Ltd</strong> · 250-350 sqm · $300-350/sqm · Grey Lynn</span>
                <span style="font-weight:600;color:var(--green);">92% match</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--blue-light);border-radius:6px;margin-bottom:6px;font-size:13px;">
                <span><strong>Clearpoint Advisory</strong> · 200-300 sqm · $280-320/sqm · Listed with CBRE</span>
                <span style="font-weight:600;color:var(--blue);">81% match</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--orange-light);border-radius:6px;margin-bottom:12px;font-size:13px;">
                <span><strong>Kotui Health NZ</strong> · 280-400 sqm · Walter signal · Not listed with any agency</span>
                <span style="font-weight:600;color:var(--orange);">78% signal</span>
            </div>
            <strong>Investor Benchmarks:</strong><br>
            <span style="font-size:13px;color:var(--text-secondary);">28 Monmouth St sold at $12,045/sqm (94% comparable) · 12 Pollen St asking $2.4M via Colliers (conjunctional) · 8 Williamson Ave via JLL (conjunctional)</span><br><br>
            <div style="display:flex;gap:8px;">
                <a href="wallace-report.html" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;background:var(--accent);color:white;border-radius:6px;font-size:13px;font-weight:500;text-decoration:none;">View full matching report</a>
                <button onclick="alert('Wallace will monitor for new matches and notify you via Zara.')" style="padding:8px 18px;border:1px solid var(--border);border-radius:6px;background:white;font-size:13px;font-family:inherit;cursor:pointer;">Set up monitoring</button>
            </div>
        `;
    }

    function getCostelloResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Costello activated — aggregating market data for Grey Lynn office sector</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Pulled ownership records — Des Radonich Limited (33 Crummer Rd)</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Analysed 142 Grey Lynn office transactions (2021-2026)</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Cross-referenced RBNZ, Stats NZ, and realestate.co.nz data</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Generated Bayleys Commercial Market Report</div>
            </div>
            <div class="msg-agent-header">
                <div class="msg-agent-avatar costello">C</div>
                <div class="msg-agent-info">
                    <div class="msg-agent-name">Costello — Market Intelligence Report</div>
                    <div class="msg-agent-sub">Prepared for Des Radonich Limited · 33 Crummer Road, Grey Lynn</div>
                </div>
            </div>
            <p class="msg-text">Costello has compiled a comprehensive market report covering the Grey Lynn office sector with insights tailored for Des Radonich as the owner of 33 Crummer Road.</p>
            <div class="msg-subheading">Report Contents</div>
            <ul class="msg-list">
                <li><span><strong>Grey Lynn Office Sector Performance</strong> — $/sqm trends, vacancy rates, absorption, and how the precinct compares to CBD fringe alternatives.</span></li>
                <li><span><strong>Lease &amp; Tenant Trends</strong> — Average lease terms, CPI vs market reviews, tenant industry mix, and renewal rates.</span></li>
                <li><span><strong>External Economic Factors</strong> — OCR trajectory, GDP outlook, CPI forecasts, and building consent activity.</span></li>
                <li><span><strong>Comparable Transactions</strong> — 8 recent office lease transactions within 1km of 33 Crummer Rd.</span></li>
                <li><span><strong>Value-Add Opportunities</strong> — Molloy's recommendations including mezzanine, fit-out modernisation, and seismic upgrade ROI.</span></li>
                <li><span><strong>Agent Commentary</strong> — Bayleys perspective on the Grey Lynn office market and outlook for 2026–2027.</span></li>
            </ul>
            <div class="msg-callout">
                <span class="msg-callout-label">Delivery</span>
                <span class="msg-callout-text">The report will be sent to Des Radonich as a personalised web-based report via Outlook 365 with engagement tracking enabled. Des will see a premium Bayleys-branded experience with interactive market data.</span>
            </div>
            <div class="msg-actions">
                <a href="market-report.html" target="_blank" class="msg-btn primary">Review report before sending</a>
                <button onclick="alert('Report sent to Des Radonich via Outlook 365. Engagement tracking enabled.')" class="msg-btn secondary">Send directly</button>
            </div>
        `;
    }

    function getCPIResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Searched Bayleys clause library — 73.0 CPI Adjustment Formula</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Cross-referenced ADLS 6th Edition rent review provisions</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Analysed 1,240 commercial leases with CPI clauses</div>
            </div>
            <strong>CPI Adjustment Clause — Drafted for 5-Year Term, Capped at 3%</strong><br><br>
            Based on Bayleys Clause 73.0 and ADLS 6th Edition Schedule 1, Field 12, here is the recommended clause:<br><br>
            <div style="background:var(--bg-secondary);padding:14px 16px;border-radius:8px;border-left:3px solid var(--accent);margin:8px 0;font-size:13px;line-height:1.7;">
            <em>"The annual rent shall be adjusted on each CPI rent adjustment date by applying to the annual rent payable at the adjustment date the same percentage by which the Consumer Price Index (All Groups) published by Stats NZ has altered during the preceding 12-month period, <strong>provided that any such adjustment shall not exceed 3.0% per annum nor be less than 0.0% (the rent shall not decrease)</strong>. If the CPI ceases to be published, the rent will be reviewed by reference to the most closely comparable index as agreed by the parties."</em>
            </div><br>
            <strong>How this compares to alternatives:</strong><br><br>
            &bull; <strong>Fixed 3% p.a.</strong> — Simpler but overexposes the tenant when CPI is below 3%. Based on RBNZ forecasts (2.1-2.4% for 2026-28), a fixed 3% would cost the tenant an additional <strong>$3,200-$5,800 p.a.</strong> on a 300 sqm lease vs CPI-linked.<br><br>
            &bull; <strong>Uncapped CPI</strong> — Favours the landlord in high-inflation periods. During 2022-23, uncapped CPI reviews hit 7.2%, causing significant tenant disputes. Our database shows <strong>14 tribunal cases</strong> where tenants challenged uncapped CPI reviews.<br><br>
            &bull; <strong>CPI capped at 3%</strong> (recommended) — The balanced approach. Used in <strong>62% of Bayleys commercial leases</strong> signed in 2025. Protects both parties while providing predictable cost increases.<br><br>
            <strong>Legal reference:</strong> Property Law Act 2007 s.224 governs rent review mechanisms. ADLS 6th Edition cl.2.1(d) and cl.2.5(d) provide the framework for CPI adjustments with lower and upper limits.
        `;
    }

    function getDeedResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Retrieved Bayleys Clause 62.0 — Conditional on Deed of Lease</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Cross-referenced 847 conditional sale agreements</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Checked relevant tribunal decisions</div>
            </div>
            <strong>Conditional on Deed of Lease — Clause 62.0</strong><br><br>
            This clause is used when a sale is conditional upon the purchaser receiving and approving a signed lease. Here is the standard Bayleys clause:<br><br>
            <div style="background:var(--bg-secondary);padding:14px 16px;border-radius:8px;border-left:3px solid var(--accent);margin:8px 0;font-size:13px;line-height:1.7;">
            <em>"This agreement is entirely conditional upon the Vendor providing the Purchaser with a copy of the signed Deed of Lease within <strong>three (3) working days</strong> of the date of this agreement signed by both parties, and the Purchaser giving their approval to the Deed of Lease in writing to the Vendor or Vendor's Solicitor within <strong>two (2) working days</strong> of receipt of such lease."</em>
            </div><br>
            <strong>Key considerations:</strong><br><br>
            &bull; <strong>Timeframes:</strong> 3 working days for vendor to provide + 2 working days for purchaser approval = 5 working days total. Our data shows <strong>89% of transactions</strong> complete within this window.<br><br>
            &bull; <strong>Risk:</strong> If the vendor fails to provide the Deed within 3 days, the agreement may be voided. In <em>Kauri Holdings v Pacific Trust (2021)</em>, the Disputes Tribunal ruled that late provision constituted a breach entitling the purchaser to withdraw.<br><br>
            &bull; <strong>Recommendation:</strong> For complex leases (e.g., multi-tenanted properties), consider extending to <strong>5+3 working days</strong> to allow adequate legal review. This variation was upheld in <em>Meridian Properties v Chen (2023)</em>.
        `;
    }

    function getFloorResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Retrieved Bayleys Clause 56.0 — Verification of Floor Areas</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Referenced BOMA/PCNZ Measurement Standard</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Analysed 326 lease disputes involving floor area discrepancies</div>
            </div>
            <strong>Floor Area Verification Clause — BOMA Standard</strong><br><br>
            Based on Bayleys Clause 56.0, here is the recommended clause for inclusion in the Agreement to Lease:<br><br>
            <div style="background:var(--bg-secondary);padding:14px 16px;border-radius:8px;border-left:3px solid var(--accent);margin:8px 0;font-size:13px;line-height:1.7;">
            <em>"Within five (5) working days of the signing of this Agreement by both parties, the premises shall be measured in accordance with the <strong>PCNZ/BOMA method of measurement</strong> by a registered Valuer acting for the Landlord and at the cost of the Landlord. The annual rental payable shall be based upon the application of the agreed rental rate per square metre to the verified area."</em>
            </div><br>
            <strong>Why this matters:</strong><br><br>
            &bull; Our analysis of <strong>326 lease disputes</strong> shows floor area discrepancies average <strong>8-12%</strong> between marketed and measured areas. On a $400/sqm lease, a 30 sqm discrepancy = <strong>$12,000 p.a.</strong><br><br>
            &bull; <strong>BOMA vs carpet area:</strong> BOMA includes a proportionate share of common areas. Ensure the lease specifies which method to avoid disputes. In <em>Tower Property Group v NZ Post (2022)</em>, the Tribunal ruled that failure to specify the measurement standard entitled the tenant to the most favourable interpretation.<br><br>
            &bull; <strong>Cost allocation:</strong> The landlord bears the measurement cost (standard practice). If the tenant disputes the result, they may commission their own survey at their cost.
        `;
    }

    function getRetailClausesResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Searched clause library — Retail lease provisions</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Analysed 2,180 retail leases in Bayleys database</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Referenced 89 retail lease tribunal decisions</div>
            </div>
            <strong>Key Clauses for Retail Lease Review</strong><br><br>
            Based on our analysis of 2,180 retail leases and 89 tribunal decisions, here are the critical clauses to review:<br><br>
            <strong>1. OPEX Caps</strong><br>
            Ensure OPEX increases are capped at CPI or a fixed percentage. Our data shows <strong>34% of retail lease disputes</strong> relate to uncapped OPEX escalation. Recommend: <em>"OPEX shall not increase by more than 5% per annum excluding rates and insurance."</em><br><br>
            <strong>2. Signage Rights</strong><br>
            Retail tenants need clear signage provisions. Include: location, size, illumination, and landlord approval process. In <em>Westfield v Brew Brothers (2023)</em>, the tenant was awarded $18,000 in damages when the landlord removed approved signage without notice.<br><br>
            <strong>3. Exclusivity Clause</strong><br>
            Critical for food and beverage. Prevents the landlord from leasing adjacent space to a competing business. In <em>Scentre Group v Sushi Hub (2024)</em>, the absence of an exclusivity clause allowed the landlord to lease to a direct competitor 20m away.<br><br>
            <strong>4. Make-Good Obligations</strong><br>
            Define the condition the premises must be returned in. "Broom clean" vs "original condition" can mean a <strong>$50,000-$150,000 difference</strong> in fit-out removal costs. Always specify: <em>"The tenant shall return the premises in a clean and tidy condition but shall not be required to remove authorised fit-out improvements."</em><br><br>
            <strong>5. Assignment & Subletting</strong><br>
            Under Property Law Act 2007 s.226, the landlord cannot unreasonably withhold consent. However, "reasonable" is broadly interpreted. Include specific criteria for approval to avoid disputes.
        `;
    }

    function getConsentResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Searched 72,000 judicial decisions — lease assignment consent</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Referenced Property Law Act 2007 s.226</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Found 23 relevant tribunal decisions</div>
            </div>
            <strong>Unreasonable Withholding of Consent — Lease Assignment</strong><br><br>
            <strong>The Law:</strong> Property Law Act 2007, Section 226 provides that where a lease requires landlord consent for assignment, <em>"consent shall not be unreasonably withheld."</em><br><br>
            <strong>How adjudicators have interpreted "unreasonably":</strong><br><br>
            &bull; <em>Kiwi Property Group v Digital Media Ltd (2023)</em> — The landlord refused consent because the proposed assignee had only 2 years' trading history. <strong>Held: Unreasonable.</strong> The Tribunal found that financial viability, not trading history, was the relevant test. The assignee had strong balance sheet and guarantor.<br><br>
            &bull; <em>Goodman Property v Fresh Logistics NZ (2022)</em> — Landlord withheld consent citing "incompatible use." <strong>Held: Reasonable.</strong> The proposed assignee intended to operate a chemical storage facility in a food-grade warehouse. Change of use was a legitimate ground.<br><br>
            &bull; <em>Precinct Properties v Archer Creative (2024)</em> — Consent delayed for 47 working days without response. <strong>Held: Deemed consent.</strong> The Tribunal ruled that prolonged silence constituted unreasonable withholding. Damages of $34,000 awarded for lost business opportunity.<br><br>
            <strong>Key principles from case law:</strong><br>
            1. The landlord must respond within a <strong>reasonable time</strong> (generally 10-15 working days)<br>
            2. Refusal must be based on <strong>objectively reasonable grounds</strong> — not personal preference<br>
            3. Financial covenant of the assignee is the <strong>primary consideration</strong><br>
            4. The landlord cannot profit from consent (no premium or increased rent)
        `;
    }

    function getMaintenanceResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Referenced Property Law Act 2007 s.232 — Landlord obligations</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Searched Tenancy Tribunal decisions — maintenance claims</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Found 156 relevant commercial lease decisions</div>
            </div>
            <strong>Landlord Maintenance Obligations — Property Law Act 2007</strong><br><br>
            <strong>Section 232</strong> of the Property Law Act 2007 implies a covenant that the landlord will <em>"keep the premises in a reasonable state of repair having regard to the age, character, and prospective life of the premises."</em><br><br>
            <strong>Key tribunal decisions:</strong><br><br>
            &bull; <em>Progressive Enterprises v Harbour Holdings (2023)</em> — Roof leak caused $120,000 in stock damage. <strong>Landlord liable.</strong> The Tribunal held that s.232 imposes an absolute obligation for structural maintenance regardless of lease terms purporting to exclude it.<br><br>
            &bull; <em>NZ Pharmaceuticals v Albany Trust (2024)</em> — HVAC system failed mid-summer. Tenant withheld rent. <strong>Tenant entitled to abatement.</strong> The Tribunal awarded 30% rent abatement for 6 weeks ($14,400) as the premises were not fit for purpose.<br><br>
            &bull; <em>Smith & Co v Wellington CBD Holdings (2022)</em> — Tenant claimed compensation for lost revenue due to 3-month repair delay. <strong>Partially upheld.</strong> $28,000 in consequential damages awarded but capped at the "no access" insurance period in the lease.<br><br>
            <strong>Practical guidance for agents:</strong><br>
            1. s.232 <strong>cannot be contracted out of</strong> for structural and exterior maintenance<br>
            2. Tenants can <strong>withhold rent proportionally</strong> if premises are unfit — but must notify in writing first<br>
            3. The landlord's obligation extends to <strong>building services</strong> (lifts, HVAC, fire systems) unless the lease explicitly shifts this to the tenant with a corresponding rent reduction
        `;
    }

    function getREAResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Searched REA Complaints Assessment Committee decisions</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Filtered for commercial agent disciplinary actions (2020-2026)</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Found 38 relevant decisions</div>
            </div>
            <strong>REA Disclosure Decisions — Commercial Agents</strong><br><br>
            Summary of recent disciplinary decisions relevant to Bayleys commercial agents:<br><br>
            <strong>1. Failure to disclose defects — CAC 2024/14</strong><br>
            Agent failed to disclose known weathertightness issues in a commercial building sale. <strong>Finding: Unsatisfactory conduct.</strong> Fine of $8,000 + $2,500 costs. The agent knew of the defect from a pre-purchase building report but did not pass it to the buyer.<br><br>
            <strong>2. Misleading floor area — READT 2023/08</strong><br>
            Agent marketed a property as 450 sqm when the actual BOMA measurement was 382 sqm. <strong>Finding: Misconduct.</strong> Licence suspended for 3 months. The Tribunal noted that agents have an <strong>independent obligation to verify</strong> floor area claims, not simply rely on the landlord's representations.<br><br>
            <strong>3. Dual agency not disclosed — CAC 2025/03</strong><br>
            Agent acted for both landlord and prospective tenant without written consent from both parties. <strong>Finding: Unsatisfactory conduct.</strong> Censure + mandatory training. The agent disclosed verbally but failed to obtain <strong>written acknowledgement</strong> as required under s.136 of the REA Act 2008.<br><br>
            <strong>Key lessons for Bayleys agents:</strong><br>
            1. <strong>Always verify</strong> floor areas independently — do not rely on owner representations<br>
            2. <strong>Disclose all known defects</strong> in writing, even if the vendor instructs otherwise<br>
            3. <strong>Dual agency requires written consent</strong> from all parties before engagement<br>
            4. Maintain a <strong>paper trail</strong> — verbal disclosures are insufficient under the REA Act
        `;
    }

    function getOPEXDisputeResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Referenced ADLS 6th Edition — Second Schedule OPEX provisions</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Searched tribunal decisions — OPEX capital vs operating disputes</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Found 42 relevant cases</div>
            </div>
            <strong>OPEX Dispute — Capital vs Operating Expenditure</strong><br><br>
            This is one of the most common commercial lease disputes. The ADLS 6th Edition Second Schedule defines 13 categories of recoverable OPEX but <strong>explicitly excludes capital items</strong>.<br><br>
            <strong>The legal position:</strong><br><br>
            Under ADLS 6th Ed. Second Schedule, Item 7, the landlord may recover <em>"maintenance and repair charges"</em> but this <strong>excludes:</strong><br>
            &bull; Structural repairs to the building<br>
            &bull; Repairs due to defects in design or construction<br>
            &bull; Inherent defects<br>
            &bull; Renewal or replacement of building services<br><br>
            <strong>Key tribunal precedents:</strong><br><br>
            &bull; <em>Stride Property v MediaWorks (2023)</em> — Landlord charged $180,000 for a new roof as OPEX. <strong>Held: Capital expenditure.</strong> Roof replacement is a capital item, not maintenance. Only minor roof repairs (patching, flashing) are recoverable.<br><br>
            &bull; <em>Kiwi Income Property v ANZ (2024)</em> — Landlord recovered $45,000 for a new HVAC compressor as "service maintenance." <strong>Held: Partially capital.</strong> The Tribunal apportioned 70% as capital (new equipment) and 30% as maintenance (installation labour).<br><br>
            &bull; <em>Argosy Property v Fletcher Construction (2022)</em> — Car park resealing of $85,000 charged to tenants. <strong>Held: Capital.</strong> ADLS Schedule Item 10 explicitly excludes "repaving or resealing" from tenant recoverable charges. Only pothole repairs and minor patching qualify.<br><br>
            <strong>Advice for the agent:</strong><br>
            1. Request a <strong>full OPEX breakdown</strong> with invoices — tenants have a right to audit under cl.3.3<br>
            2. Challenge any single item exceeding <strong>$10,000</strong> — likely a capital item<br>
            3. Check whether the item <strong>extends the life of the asset</strong> (capital) vs <strong>maintains current condition</strong> (operating)<br>
            4. Consider proposing a <strong>capex/opex schedule</strong> as an annexure to the lease to prevent future disputes
        `;
    }

    function getConfirmResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Generating Strategy Cards for 4 Ponsonby properties</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Queried CRM, LINZ, ICP, and NZBN data</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Applied stickiness model and renewal predictions</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Assigned to Zara for follow-up scheduling</div>
            </div>
            <strong>Strategy Cards Generated</strong><br><br>
            I've created Strategy Cards for the 4 priority properties in Ponsonby:<br><br>
            <div style="display:flex;flex-direction:column;gap:6px;margin:4px 0 12px;">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--red-light);border-radius:6px;font-size:13px;">
                    <span><strong>12 Ponsonby Rd</strong> · Cafe Nero Ltd · Flight Risk</span>
                    <span style="font-size:12px;color:var(--red);font-weight:500;">Pre-emptive Backfill</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--red-light);border-radius:6px;font-size:13px;">
                    <span><strong>88 Ponsonby Rd</strong> · Vibe Studio Ltd · Flight Risk</span>
                    <span style="font-size:12px;color:var(--red);font-weight:500;">Urgent Recovery</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--blue-light);border-radius:6px;font-size:13px;">
                    <span><strong>45 Ponsonby Rd</strong> · Archimedia Design · Expansion</span>
                    <span style="font-size:12px;color:var(--blue);font-weight:500;">Retention Advisor</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--blue-light);border-radius:6px;font-size:13px;">
                    <span><strong>102 Ponsonby Rd</strong> · Lumina Health · Expansion</span>
                    <span style="font-size:12px;color:var(--blue);font-weight:500;">Renewal Closer</span>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-secondary);border-radius:6px;margin-bottom:12px;font-size:12px;color:var(--text-secondary);">
                <span style="width:18px;height:18px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border-radius:5px;display:flex;align-items:center;justify-content:center;color:white;font-size:9px;font-weight:700;flex-shrink:0;">Z</span>
                Zara has added these to your weekly call list and scheduled landlord engagement for the two flight-risk properties.
            </div>
            Would you like me to open any of these Strategy Cards, or shall I have Wallace check for prospective tenants to backfill the flight-risk properties?
        `;
    }

    function getGenericResponse(text) {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Analysed query across database</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Cross-referenced market data</div>
            </div>
            I've processed your query: <em>"${escapeHtml(text)}"</em><br><br>
            I can help you with:<br>
            &bull; <strong>Property analysis</strong> — Enter any NZ address for a full Walter Strategy Card<br>
            &bull; <strong>Lease predictions</strong> — Expiry forecasts based on ICP, NZBN, and CRM data<br>
            &bull; <strong>Market comparisons</strong> — $/sqm rates, lease terms, and sector insights<br>
            &bull; <strong>Document analysis</strong> — Upload leases to extract and compare terms<br>
            &bull; <strong>Tenant intelligence</strong> — Business vitality, hiring trends, and renewal probability<br><br>
            Try asking about a specific address or market sector for detailed insights.
        `;
    }

    chatSend?.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (!text) return;
        simulateChat(text);
        chatInput.value = '';
        chatInput.style.height = 'auto';
    });

    chatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatSend?.click();
        }
    });

    // Auto-resize textarea
    chatInput?.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    function scrollChat() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Strategy Card Modal ---
    const strategyModal = document.getElementById('strategyModal');
    const modalClose = document.getElementById('modalClose');

    modalClose?.addEventListener('click', () => {
        strategyModal.classList.remove('active');
    });

    strategyModal?.addEventListener('click', (e) => {
        if (e.target === strategyModal) {
            strategyModal.classList.remove('active');
        }
    });

    // --- Property Details Modal ---
    const propertyModal = document.getElementById('propertyModal');
    const propertyModalClose = document.getElementById('propertyModalClose');

    propertyModalClose?.addEventListener('click', () => {
        propertyModal.classList.remove('active');
    });

    propertyModal?.addEventListener('click', (e) => {
        if (e.target === propertyModal) {
            propertyModal.classList.remove('active');
        }
    });

    // "Full details" buttons open property modal
    document.querySelectorAll('.popup-btn:not(.primary)').forEach(btn => {
        if (btn.textContent.trim() === 'Full details') {
            btn.addEventListener('click', () => {
                propertyModal.classList.add('active');
                mapPopup?.classList.remove('active');
            });
        }
    });

    // "Generate Strategy Card" in property modal
    document.getElementById('pdStrategyBtn')?.addEventListener('click', () => {
        propertyModal.classList.remove('active');
        strategyModal.classList.add('active');
    });

    // Open from properties table
    document.querySelectorAll('.clickable-row[data-action="open-strategy"]').forEach(row => {
        row.addEventListener('click', () => {
            strategyModal.classList.add('active');
        });
    });

    // Open from action items — each priority action flows to its specific workflow
    document.querySelectorAll('.action-item [data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;

            if (action === 'beaumont') {
                // Lumiere Design — Expansion Opportunity → Walter Strategy Card
                strategyModal.classList.add('active');
            } else if (action === 'techflow') {
                // TechFlow Ltd — ICP signal → Property Detail (88 Shortland St)
                activePropertyData = propertyData.shortland;
                window.openPropertyDetail();
            } else if (action === 'pacific') {
                // Pacific Traders — Flight risk → Chat with risk analysis
                switchView('chat');
                setTimeout(() => simulateChat('Which industrial tenants in South Auckland have high flight risk?'), 200);
            } else if (action === 'nzhealth') {
                // NZ Health Group — Hiring surge → Wallace matching
                switchView('chat');
                setTimeout(() => simulateChat('Get Wallace to find expansion space options for NZ Health Group'), 200);
            }
        });
    });

    // --- Recent conversations -> chat ---
    document.querySelectorAll('[data-action="load-chat"]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('chat');
            const chatMap = {
                'beaumont': 'Analyse the lease situation for 24-28 Beaumont Street, Freemans Bay',
                'ponsonby': 'Show me lease expiries in Ponsonby in the next 12 months',
                'parnell': 'Show me the office portfolio analysis for Parnell'
            };
            setTimeout(() => {
                simulateChat(chatMap[item.dataset.chat] || 'Show me recent analysis');
            }, 200);
        });
    });

    // --- Upload Zone Drag & Drop ---
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });
    }

    // --- Document Result Switching ---
    function showDocResult(viewId) {
        document.querySelectorAll('.doc-result-view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId)?.classList.add('active');
    }

    document.getElementById('docLeaseReview')?.addEventListener('click', () => showDocResult('docResultReview'));
    document.getElementById('docLeaseCompare')?.addEventListener('click', () => showDocResult('docResultCompare'));
    document.getElementById('uploadSingleBtn')?.addEventListener('click', () => showDocResult('docResultReview'));
    document.getElementById('uploadCompareBtn')?.addEventListener('click', () => showDocResult('docResultCompare'));

    // --- Custom Agent Builder ---
    const createAgentBtn = document.getElementById('createAgentBtn');
    const createAgentForm = document.getElementById('createAgentForm');
    const cancelAgentBtn = document.getElementById('cancelAgentBtn');

    createAgentBtn?.addEventListener('click', () => {
        createAgentBtn.style.display = 'none';
        createAgentForm.style.display = 'block';
    });

    cancelAgentBtn?.addEventListener('click', () => {
        createAgentForm.style.display = 'none';
        createAgentBtn.style.display = 'flex';
    });

    // --- Market Intelligence Tabs ---
    document.querySelectorAll('.intel-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.intel-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.intel-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.querySelector(`.intel-content[data-content="${tab.dataset.tab}"]`)?.classList.add('active');
        });
    });

    // --- Property Data for Map Popups ---
    const propertyData = {
        shortland: {
            img: 'sv-88-shortland.png', title: '88 Shortland Street, CBD', status: 'Office to Lease', statusColor: 'blue',
            details: [{l:'Area',v:'1,200 sqm'},{l:'$/sqm',v:'$435'},{l:'Listed',v:'14 days'},{l:'Grade',v:'A'}],
            tenant: { label: 'Predicted tenant:', text: 'TechFlow Ltd — ICP active Nov 2025' },
            modal: 'property'
        },
        queen: {
            img: 'sv-45-queen.png', title: '45 Queen Street, CBD', status: 'Retail to Lease', statusColor: 'purple',
            details: [{l:'Area',v:'420 sqm'},{l:'$/sqm',v:'$490'},{l:'Listed',v:'45 days'},{l:'Grade',v:'B+'}],
            tenant: { label: 'Current tenant:', text: 'Pacific Traders Ltd — Annual return overdue' },
            modal: 'property'
        },
        freemans: {
            img: 'sv-24-beaumont.png', title: '24-28 Beaumont Street, Freemans Bay', status: 'Expansion Opportunity', statusColor: 'blue',
            details: [{l:'Area',v:'480 sqm'},{l:'$/sqm',v:'$395'},{l:'Expiry',v:'Nov 2026'},{l:'Stickiness',v:'92%'}],
            tenant: { label: 'Tenant expanding:', text: 'Lumiere Design Group — 6 active Seek listings, $450k fit-out' },
            modal: 'strategy'
        },
        nelson: {
            img: 'sv-12-nelson.png', title: '12 Nelson Street, CBD', status: 'New Signal Detected', statusColor: 'orange',
            details: [{l:'Area',v:'180 sqm'},{l:'$/sqm',v:'—'},{l:'ICP',v:'Active'},{l:'Since',v:'Mar 2026'}],
            tenant: { label: 'Signal intelligence:', text: 'New ICP activation detected. NZBN lookup: TASK Group Ltd — IT services' },
            modal: 'property'
        },
        dalgety: {
            img: 'sv-47-dalgety.png', title: '47 Dalgety Drive, Wiri', status: 'Industrial to Lease', statusColor: 'green',
            details: [{l:'Area',v:'3,600 sqm'},{l:'$/sqm',v:'$182'},{l:'Listed',v:'8 days'},{l:'Yard',v:'Yes'}],
            tenant: { label: 'Current tenant:', text: 'Shaw NZ Limited — Lease expires Nov 2027' },
            modal: 'property'
        },
        ponsonby: {
            img: 'sv-24-beaumont.png', title: 'Ponsonby Road, Ponsonby', status: 'Retail Cluster', statusColor: 'purple',
            details: [{l:'Properties',v:'5'},{l:'Avg $/sqm',v:'$480'},{l:'Expiring',v:'3'},{l:'Vacancy',v:'6%'}],
            tenant: { label: 'Cluster insight:', text: '3 leases expiring within 12 months. Mixed retail — cafes, boutiques, services.' },
            modal: 'property'
        },
        newmarket: {
            img: 'sv-88-shortland.png', title: 'Newmarket Commercial', status: 'Office & Retail Hub', statusColor: 'blue',
            details: [{l:'Properties',v:'9+'},{l:'Avg $/sqm',v:'$410'},{l:'Expiring',v:'4'},{l:'Vacancy',v:'5%'}],
            tenant: { label: 'Area insight:', text: 'Strong demand. 4 renewal opportunities in next 18 months.' },
            modal: 'property'
        }
    };

    // Default popup for unknown pins
    const defaultPopup = {
        img: 'sv-88-shortland.png', title: 'Commercial Property', status: 'Property', statusColor: 'blue',
        details: [{l:'Type',v:'Commercial'},{l:'Status',v:'Active'},{l:'Region',v:'Auckland'},{l:'Source',v:'CRM'}],
        tenant: { label: 'Data source:', text: 'Bayleys CRM — Click for full details' },
        modal: 'property'
    };

    let activePropertyData = null;

    function renderPopup(data) {
        activePropertyData = data;
        const statusColors = { blue: 'var(--blue)', purple: 'var(--purple)', green: 'var(--green)', orange: 'var(--orange)' };
        document.getElementById('popupImg').src = data.img;
        document.getElementById('popupBody').innerHTML = `
            <h4>${data.title}</h4>
            <span class="popup-status" style="color:${statusColors[data.statusColor] || 'var(--blue)'}">${data.status}</span>
            <div class="popup-details">
                ${data.details.map(d => `<div class="popup-detail"><span>${d.l}</span><strong>${d.v}</strong></div>`).join('')}
            </div>
            <div class="popup-tenant">
                <span class="popup-tenant-label">${data.tenant.label}</span>
                <span>${data.tenant.text}</span>
            </div>
            <div class="popup-actions">
                <button class="popup-btn primary" onclick="document.getElementById('strategyModal').classList.add('active'); document.getElementById('mapPopup').classList.remove('active');">Strategy Card</button>
                <button class="popup-btn" onclick="openPropertyDetail(); document.getElementById('mapPopup').classList.remove('active');">Full details</button>
            </div>
        `;
    }

    // Update property modal dynamically based on active property
    window.openPropertyDetail = function() {
        const data = activePropertyData;
        if (!data) { document.getElementById('propertyModal').classList.add('active'); return; }

        // Update hero image and title
        const modal = document.getElementById('propertyModal');
        const heroImg = modal.querySelector('.pd-hero-img');
        const heroH2 = modal.querySelector('.pd-hero-info h2');
        const heroSpan = modal.querySelector('.pd-hero-info span');
        const heroType = modal.querySelector('.pd-hero .listing-type');

        if (heroImg) heroImg.src = data.img;
        if (heroH2) heroH2.textContent = data.title;
        if (heroSpan) heroSpan.textContent = data.status;
        if (heroType) heroType.textContent = data.status;

        modal.classList.add('active');
    };

    // --- Map Popup (pin click) ---
    const mapPopup = document.getElementById('mapPopup');
    const popupClose = document.getElementById('popupClose');

    document.querySelectorAll('.map-pin').forEach(pin => {
        pin.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('selected'));
            pin.classList.add('selected');

            // Get property data for this pin
            const pinId = pin.dataset.pin;
            const data = propertyData[pinId] || defaultPopup;
            renderPopup(data);

            // Position popup near the pin
            const pinTop = parseFloat(pin.style.top);
            const pinLeft = parseFloat(pin.style.left);
            mapPopup.style.top = Math.max(2, pinTop - 8) + '%';
            mapPopup.style.left = Math.min(55, pinLeft + 3) + '%';
            mapPopup.classList.add('active');
        });
    });

    popupClose?.addEventListener('click', () => {
        mapPopup.classList.remove('active');
    });

    // Close popup when clicking map background
    document.querySelector('.map-container')?.addEventListener('click', (e) => {
        if (!e.target.closest('.map-pin') && !e.target.closest('.map-popup')) {
            mapPopup?.classList.remove('active');
        }
    });

    // Listings feed items highlight corresponding pin
    document.querySelectorAll('.feed-item[data-pin]').forEach(item => {
        item.addEventListener('click', () => {
            const pinId = item.dataset.pin;
            const pin = document.querySelector(`.map-pin[data-pin="${pinId}"]`);
            if (pin) {
                pin.click();
            } else {
                // No pin on map — show popup with feed data
                const popupId = item.dataset.popup;
                const data = propertyData[popupId] || propertyData[pinId] || defaultPopup;
                renderPopup(data);
                mapPopup.style.top = '20%';
                mapPopup.style.left = '35%';
                mapPopup.classList.add('active');
            }
        });
    });

    // --- Calendar Widget & Modal ---
    const TODAY = 8; // Wednesday 8 April 2026 (prototype "today")
    // Events keyed by day-of-month for April 2026 (simulated)
    const CAL_EVENTS = {
        1: [{type:'m365', title:'Quarter review'}, {type:'zara', title:'Planning session'}],
        2: [{type:'m365', title:'Team standup'}],
        3: [{type:'m365', title:'Client lunch'}],
        7: [{type:'m365', title:'Landlord call'}],
        8: [{type:'m365', title:'AI chat meeting'}, {type:'m365', title:'Alix RPM catch-up'}, {type:'m365', title:'Project Walter'}, {type:'zara', title:'Call Marcus Miller'}, {type:'costello', title:'Weekly report'}],
        9: [{type:'m365', title:'Property viewing'}, {type:'zara', title:'Follow-up Sophie Chen'}],
        10: [{type:'m365', title:'Strategy session'}, {type:'wallace', title:'Tidal Creative intro'}],
        13: [{type:'m365', title:'Board meeting'}],
        14: [{type:'lease', title:'12 Ponsonby Rd review'}, {type:'m365', title:'Client meeting'}],
        15: [{type:'zara', title:'Weekly recap'}],
        16: [{type:'m365', title:'Team lunch'}, {type:'costello', title:'Market briefing'}],
        20: [{type:'m365', title:'Listing walkthrough'}],
        21: [{type:'lease', title:'88 Ponsonby Rd review'}],
        22: [{type:'m365', title:'Client call'}, {type:'wallace', title:'Investor match'}],
        23: [{type:'m365', title:'Workshop'}],
        27: [{type:'m365', title:'Monthly review'}],
        28: [{type:'zara', title:'Task sync'}, {type:'m365', title:'Partner meeting'}],
        29: [{type:'m365', title:'Agent training'}],
        30: [{type:'costello', title:'Month-end reports'}]
    };
    const MONTH_NAME = 'April 2026';
    // April 2026: 1 April = Wednesday. So grid starts with 2 blanks (Sun, Mon, Tue)
    const FIRST_DAY_OFFSET = 3; // Wed = index 3 (0-indexed Sun)
    const DAYS_IN_MONTH = 30;

    function buildMiniCal() {
        const grid = document.getElementById('calMiniGrid');
        if (!grid) return;
        let html = '';
        ['S','M','T','W','T','F','S'].forEach(d => html += `<span class="cal-mini-weekday">${d}</span>`);

        // March trailing days (muted)
        const marchStart = 29; // Sun 29 Mar → Tue 31 Mar
        for (let i = 0; i < FIRST_DAY_OFFSET; i++) {
            html += `<div class="cal-mini-day muted"><span>${marchStart + i}</span><div class="cal-dots"></div></div>`;
        }
        // April days
        for (let d = 1; d <= DAYS_IN_MONTH; d++) {
            const events = CAL_EVENTS[d] || [];
            const isToday = d === TODAY;
            const col = (FIRST_DAY_OFFSET + d - 1) % 7;
            const isWeekend = col === 0 || col === 6;
            const dotsHtml = events.slice(0, 3).map(e => `<span class="cal-dot ${e.type}"></span>`).join('');
            html += `<div class="cal-mini-day${isToday ? ' today' : ''}${isWeekend && !isToday ? ' weekend' : ''}" data-day="${d}"><span>${d}</span><div class="cal-dots">${dotsHtml}</div></div>`;
        }
        // May trailing days
        const totalCells = Math.ceil((FIRST_DAY_OFFSET + DAYS_IN_MONTH) / 7) * 7;
        const trailing = totalCells - (FIRST_DAY_OFFSET + DAYS_IN_MONTH);
        for (let i = 1; i <= trailing; i++) {
            html += `<div class="cal-mini-day muted"><span>${i}</span><div class="cal-dots"></div></div>`;
        }
        grid.innerHTML = html;
    }

    function buildFullCal() {
        const grid = document.getElementById('calFullGrid');
        if (!grid) return;
        let html = '';
        const marchStart = 29;
        for (let i = 0; i < FIRST_DAY_OFFSET; i++) {
            html += `<div class="cal-full-day muted"><span class="cal-full-date">${marchStart + i}</span></div>`;
        }
        for (let d = 1; d <= DAYS_IN_MONTH; d++) {
            const events = CAL_EVENTS[d] || [];
            const isToday = d === TODAY;
            const eventsHtml = events.slice(0, 3).map(e => `<div class="cal-full-event ${e.type}">${e.title}</div>`).join('');
            const more = events.length > 3 ? `<div class="cal-full-event more">+${events.length - 3} more</div>` : '';
            html += `<div class="cal-full-day${isToday ? ' today' : ''}" data-day="${d}"><span class="cal-full-date">${d}</span><div class="cal-full-events">${eventsHtml}${more}</div></div>`;
        }
        const totalCells = Math.ceil((FIRST_DAY_OFFSET + DAYS_IN_MONTH) / 7) * 7;
        const trailing = totalCells - (FIRST_DAY_OFFSET + DAYS_IN_MONTH);
        for (let i = 1; i <= trailing; i++) {
            html += `<div class="cal-full-day muted"><span class="cal-full-date">${i}</span></div>`;
        }
        grid.innerHTML = html;
    }

    buildMiniCal();
    buildFullCal();

    const calendarModal = document.getElementById('calendarModal');
    const calendarCard = document.getElementById('calendarCard');
    const calendarClose = document.getElementById('calendarClose');

    calendarCard?.addEventListener('click', () => {
        calendarModal.classList.add('active');
    });
    calendarClose?.addEventListener('click', () => {
        calendarModal.classList.remove('active');
    });
    calendarModal?.addEventListener('click', (e) => {
        if (e.target === calendarModal) calendarModal.classList.remove('active');
    });

    // View toggle (Month / Week / Day)
    document.querySelectorAll('.cal-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.dataset.calView;
            document.getElementById('calMonthView').style.display = view === 'month' ? '' : 'none';
            document.getElementById('calWeekView').style.display = view === 'week' ? '' : 'none';
            document.getElementById('calDayView').style.display = view === 'day' ? '' : 'none';
        });
    });

    // --- Carlisle Rd Listing Deep Dive Modal ---
    const carlisleModal = document.getElementById('carlisleModal');
    const carlisleClose = document.getElementById('carlisleClose');
    const carlisleListingCard = document.getElementById('carlisleListingCard');
    const clHeroImg = document.getElementById('clHeroImg');
    const clImgCounter = document.getElementById('clImgCounter');
    const carlisleImages = Array.from(document.querySelectorAll('#clThumbs .cl-thumb')).map(t => t.dataset.img);
    let carlisleIdx = 0;

    function showCarlisleImg(idx) {
        if (idx < 0) idx = carlisleImages.length - 1;
        if (idx >= carlisleImages.length) idx = 0;
        carlisleIdx = idx;
        if (clHeroImg) clHeroImg.src = carlisleImages[idx];
        if (clImgCounter) clImgCounter.textContent = idx + 1;
        document.querySelectorAll('#clThumbs .cl-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
    }

    carlisleListingCard?.addEventListener('click', (e) => {
        e.preventDefault();
        carlisleModal?.classList.add('active');
        showCarlisleImg(0);
    });

    carlisleClose?.addEventListener('click', () => carlisleModal?.classList.remove('active'));
    carlisleModal?.addEventListener('click', (e) => {
        if (e.target === carlisleModal) carlisleModal.classList.remove('active');
    });

    document.getElementById('clPrevImg')?.addEventListener('click', () => showCarlisleImg(carlisleIdx - 1));
    document.getElementById('clNextImg')?.addEventListener('click', () => showCarlisleImg(carlisleIdx + 1));

    document.querySelectorAll('#clThumbs .cl-thumb').forEach((thumb, i) => {
        thumb.addEventListener('click', () => showCarlisleImg(i));
    });

    // Carlisle tabs (Overview / AI Analysis / Wallace / Molloy)
    document.querySelectorAll('.cl-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.cl-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.cl-tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panelKey = tab.dataset.clTab;
            document.querySelector(`.cl-tab-panel[data-cl-panel="${panelKey}"]`)?.classList.add('active');
        });
    });

    // --- Crummer Rd Property Detail Modal ---
    const crummerModal = document.getElementById('crummerModal');
    const crummerClose = document.getElementById('crummerClose');

    crummerClose?.addEventListener('click', () => crummerModal.classList.remove('active'));
    crummerModal?.addEventListener('click', (e) => {
        if (e.target === crummerModal) crummerModal.classList.remove('active');
    });

    // Open from properties table — match "Crummer" in any row
    document.querySelectorAll('.clickable-row').forEach(row => {
        row.addEventListener('click', () => {
            const addr = row.querySelector('.cell-primary')?.textContent || '';
            if (addr.includes('Crummer')) {
                crummerModal.classList.add('active');
            } else {
                // Default: open property modal for other rows
                propertyModal?.classList.add('active');
            }
        });
    });

    // --- Escape key closes any open modal ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            strategyModal.classList.remove('active');
            propertyModal?.classList.remove('active');
            crummerModal?.classList.remove('active');
            calendarModal?.classList.remove('active');
            carlisleModal?.classList.remove('active');
            mapPopup?.classList.remove('active');
        }
    });
});
