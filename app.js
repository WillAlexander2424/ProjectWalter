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
        // Toggle body class so the floating Walter FAB hides while on the chat view
        document.body.classList.toggle('on-chat-view', viewId === 'chat');
    }

    // ============ Floating Walter — Quick-ask popout ============
    const walterFab = document.getElementById('walterFab');
    const walterPopout = document.getElementById('walterPopout');
    const walterPopoutClose = document.getElementById('walterPopoutClose');
    const walterPopoutForm = document.getElementById('walterPopoutForm');
    const walterPopoutInput = document.getElementById('walterPopoutInput');
    const walterPopoutSuggestions = document.getElementById('walterPopoutSuggestions');
    const walterPopoutFullLink = document.getElementById('walterPopoutFullLink');
    const walterPopoutSub = document.getElementById('walterPopoutSub');

    // Context-aware suggestion sets
    const SUGGESTION_SETS = {
        home: {
            sub: 'Your priority actions & AI surfaced insights',
            chips: [
                { icon: '&#9728;', text: "What's on today?", prompt: "What are my priority actions for today?" },
                { icon: '&#9888;', text: 'Flight-risk tenants', prompt: 'Which industrial tenants in South Auckland have high flight risk?' },
                { icon: '&#9993;', text: 'Draft client update', prompt: 'Draft a weekly update for my top 3 clients' },
                { icon: '&#128200;', text: 'Market pulse', prompt: 'Give me a market pulse for Auckland commercial this week' }
            ]
        },
        chat: null, // popout doesn't show on chat view
        market: {
            sub: 'Market trends & sector performance',
            chips: [
                { icon: '&#128200;', text: 'Trending suburbs this week', prompt: 'What are the trending commercial suburbs in Auckland this week?' },
                { icon: '&#128176;', text: 'Office $/sqm vs last quarter', prompt: 'Compare office $/sqm in Auckland CBD vs last quarter' },
                { icon: '&#127970;', text: 'Industrial vacancy rates', prompt: "What's the current industrial vacancy rate for South Auckland?" },
                { icon: '&#128269;', text: 'Show me outliers', prompt: 'Show me any market outliers worth investigating' }
            ]
        },
        properties: {
            sub: 'Your portfolio at a glance',
            chips: [
                { icon: '&#9200;', text: 'Expiring in 3 months', prompt: 'Which properties in my portfolio expire in the next 3 months?' },
                { icon: '&#9888;', text: 'At-risk tenants', prompt: 'List all properties with at-risk tenants and their stickiness scores' },
                { icon: '&#127794;', text: 'Expansion opportunities', prompt: 'Which tenants are showing expansion signals?' },
                { icon: '&#128202;', text: 'Portfolio summary', prompt: 'Give me a summary of my portfolio performance' }
            ]
        },
        listings: {
            sub: 'Your live listings & campaigns',
            chips: [
                { icon: '&#128200;', text: 'Listing performance', prompt: 'How are my listings performing this week?' },
                { icon: '&#128100;', text: 'Top enquiries', prompt: 'Show me the top enquiries from my active listings' },
                { icon: '&#9889;', text: 'Find a match', prompt: 'Find tenant matches for my vacant listings' },
                { icon: '&#128198;', text: 'Campaign ideas', prompt: 'Suggest marketing ideas for my slow-moving listings' }
            ]
        },
        documents: {
            sub: 'Lease & contract advisory',
            chips: [
                { icon: '&#128196;', text: 'Analyse a new lease', prompt: 'I want to analyse a new lease for a client' },
                { icon: '&#128181;', text: 'Build an OPEX budget', prompt: 'Generate an OPEX budget from a lease I uploaded' },
                { icon: '&#9878;', text: 'Compare lease options', prompt: 'Compare multiple lease options for a client' },
                { icon: '&#128269;', text: 'Flag unusual clauses', prompt: 'What unusual clauses should I watch for in ADLS 6th Ed leases?' }
            ]
        },
        settings: {
            sub: 'Configure Walter to work for you',
            chips: [
                { icon: '&#129302;', text: 'Explain AI agents', prompt: 'Explain what each AI agent does and which I should turn on' },
                { icon: '&#128227;', text: 'Alert tuning tips', prompt: 'How should I tune my alert preferences for my patch?' },
                { icon: '&#128279;', text: 'Integration setup', prompt: 'Walk me through setting up the Contactless CRM integrations' },
                { icon: '&#128161;', text: "What's new?", prompt: "What's new in Walter this week?" }
            ]
        }
    };

    function getCurrentViewId() {
        const active = document.querySelector('.view.active');
        if (!active) return 'home';
        return (active.id || '').replace('view-', '') || 'home';
    }

    function getPropertyContext() {
        // Check if any property modal is open
        const crummer = document.getElementById('crummerModal');
        const beaumontSc = document.getElementById('strategyModal');
        const property = document.getElementById('propertyModal');
        const carlisle = document.getElementById('carlisleModal');
        const propDrill = document.getElementById('propDrillModal');
        if (crummer?.classList.contains('active')) return { address: '33 Crummer Road, Grey Lynn', tag: 'Property in focus' };
        if (beaumontSc?.classList.contains('active')) return { address: '24-28 Beaumont Street, Freemans Bay', tag: 'Strategy Card open' };
        if (carlisle?.classList.contains('active')) return { address: '170-174 Carlisle Road', tag: 'Listing in focus' };
        if (propDrill?.classList.contains('active')) {
            const addr = document.getElementById('pdAddress')?.textContent || 'Property';
            return { address: addr, tag: 'Property drill-down' };
        }
        if (property?.classList.contains('active')) return { address: '88 Shortland Street, CBD', tag: 'Property in focus' };
        return null;
    }

    function renderPopoutSuggestions() {
        const viewId = getCurrentViewId();
        const ctx = getPropertyContext();
        const set = SUGGESTION_SETS[viewId] || SUGGESTION_SETS.home;

        // Update subtitle
        if (walterPopoutSub) {
            walterPopoutSub.textContent = ctx ? `Looking at ${ctx.address}` : (set.sub || 'What can I look into?');
        }

        let html = '';

        // If there's a property context, inject a context badge + 2 tailored prompts
        if (ctx) {
            html += `<div class="wp-context-badge"><span class="wp-context-dot"></span>${ctx.tag}</div>`;
            html += `
                <button class="wp-chip" data-prompt="Tell me everything you know about ${ctx.address}">
                    <span class="wp-chip-icon">&#128269;</span>
                    <span class="wp-chip-text">Tell me about ${ctx.address}</span>
                    <svg class="wp-chip-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
                <button class="wp-chip" data-prompt="Generate a Walter Strategy Card for ${ctx.address}">
                    <span class="wp-chip-icon">&#9889;</span>
                    <span class="wp-chip-text">Generate a Strategy Card</span>
                    <svg class="wp-chip-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
            `;
        }

        // Standard suggestions for the current view
        html += '<div class="wp-suggest-label">' + (ctx ? 'Or try' : 'Suggestions') + '</div>';
        set.chips.forEach(chip => {
            html += `
                <button class="wp-chip" data-prompt="${chip.prompt.replace(/"/g, '&quot;')}">
                    <span class="wp-chip-icon">${chip.icon}</span>
                    <span class="wp-chip-text">${chip.text}</span>
                    <svg class="wp-chip-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
            `;
        });

        walterPopoutSuggestions.innerHTML = html;

        // Wire chip clicks
        walterPopoutSuggestions.querySelectorAll('.wp-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                submitPopoutPrompt(chip.dataset.prompt);
            });
        });
    }

    function openPopout() {
        renderPopoutSuggestions();
        walterPopout?.classList.add('open');
        walterFab?.classList.add('popout-open');
        setTimeout(() => walterPopoutInput?.focus(), 250);
    }

    function closePopout() {
        walterPopout?.classList.remove('open');
        walterFab?.classList.remove('popout-open');
        if (walterPopoutInput) walterPopoutInput.value = '';
        // Reset to suggestions view next time it opens
        setTimeout(() => {
            walterPopout?.classList.remove('has-response');
            walterPopoutResponse?.classList.remove('active');
            if (walterPopoutResponseBody) {
                walterPopoutResponseBody.innerHTML = '';
                walterPopoutResponseBody.classList.remove('active');
            }
            if (walterPopoutResponseActions) walterPopoutResponseActions.style.display = 'none';
            if (walterPopoutThinking) walterPopoutThinking.classList.remove('hidden');
        }, 250);
    }

    function togglePopout() {
        if (walterPopout?.classList.contains('open')) {
            closePopout();
        } else {
            openPopout();
        }
    }

    // ============ Inline response logic ============
    const walterPopoutResponse = document.getElementById('walterPopoutResponse');
    const walterPopoutThinking = document.getElementById('walterPopoutThinking');
    const walterPopoutResponseBody = document.getElementById('walterPopoutResponseBody');
    const walterPopoutResponseActions = document.getElementById('walterPopoutResponseActions');
    const walterPopoutAnotherBtn = document.getElementById('walterPopoutAnotherBtn');
    const walterPopoutMoreBtn = document.getElementById('walterPopoutMoreBtn');

    let lastPopoutPrompt = '';
    let lastResponseKey = '';
    let lastResponseTier = 'brief'; // 'brief' or 'detailed'

    // Detect which response template fits a question
    function classifyQuery(text) {
        const t = text.toLowerCase();
        if (t.includes("what's on") || t.includes('today') || t.includes('priority') || t.includes('my day')) return 'today';
        if (t.includes('flight') || (t.includes('risk') && t.includes('tenant'))) return 'flight';
        if (t.includes('market pulse') || t.includes('market update') || t.includes('trending') || t.includes('vacancy') || (t.includes('market') && (t.includes('this week') || t.includes('auckland')))) return 'market';
        if (t.includes('expir') || t.includes('next 3 months') || t.includes('upcoming')) return 'expiring';
        if (t.includes('expansion') || t.includes('hiring')) return 'expansion';
        if (t.includes('portfolio') && (t.includes('summary') || t.includes('overview') || t.includes('performance'))) return 'portfolio';
        if (t.includes('listing') && (t.includes('perform') || t.includes('week'))) return 'listings';
        if (t.includes('opex') || t.includes('outgoings') || t.includes('budget')) return 'opex';
        if (t.includes('client update') || t.includes('draft client') || t.includes('weekly update')) return 'clientUpdate';
        if (t.includes('agent') && (t.includes('explain') || t.includes('what'))) return 'agents';
        return 'generic';
    }

    // Two-tier response library: brief (short, lands fast) + detailed (expands inline)
    const RESPONSES = {
        today: {
            brief: `
                <div class="wp-r-title">Your top 4 priorities today</div>
                <ul class="wp-r-list">
                    <li><div><strong>Marcus Miller call</strong> at 11am &mdash; Beaumont St Suite 2B (flagged urgent by Zara)</div></li>
                    <li><div><strong>Property viewing</strong> 14 St Stephens Ave, Parnell at 11am &mdash; parking tight, Uber on standby</div></li>
                    <li><div><strong>2 high-engagement reports</strong> opened by clients in the last 3 hours &mdash; follow-up window open</div></li>
                    <li><div><strong>Costello market digest</strong> auto-generates at 5pm &mdash; review before send</div></li>
                </ul>
                <div class="wp-r-meta">5 events on calendar &middot; 2 AI agent tasks queued</div>
            `,
            detailed: `
                <div class="wp-r-title">Full day breakdown</div>
                <ul class="wp-r-list">
                    <li><div><strong>9:00 AM</strong> &mdash; Solving the world's problems with AI &middot; M365</div></li>
                    <li><div><strong>10:00 AM</strong> &mdash; Will/Alix RPM Conference catch-up</div></li>
                    <li><div><strong>10:30 AM</strong> &mdash; Project Walter</div></li>
                    <li><div><strong>11:00 AM</strong> &mdash; Marcus Miller call (Beaumont St) &middot; Property viewing Parnell</div></li>
                    <li><div><strong>12:00 PM</strong> &mdash; Sarah Cincotta meeting</div></li>
                    <li><div><strong>2:00 PM</strong> &mdash; SupaHuman.ai x Bayleys</div></li>
                </ul>
                <div class="wp-r-quote">Zara's flagged the Marcus Miller call as urgent &mdash; he's open to a 6-year extension on Suite 2A at $420/sqm if you bring comparables.</div>
                <div class="wp-r-stat-row">
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Reports opened today</span>
                        <span class="wp-r-stat-value">7</span>
                        <span class="wp-r-stat-trend up">2 follow-up ready</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Brittany captures</span>
                        <span class="wp-r-stat-value">23</span>
                        <span class="wp-r-stat-trend">All filed</span>
                    </div>
                </div>
            `
        },
        flight: {
            brief: `
                <div class="wp-r-title">8 flight-risk tenants in your patch</div>
                <ul class="wp-r-list">
                    <li><div><strong>Pacific Traders</strong> &middot; 45 Queen St &middot; Annual return 3mo overdue &middot; Score 28%</div></li>
                    <li><div><strong>Atlas Logistics</strong> &middot; 22 Wiri Station Rd &middot; Director contagion &middot; Score 31%</div></li>
                    <li><div><strong>Southern Steel</strong> &middot; 8 Kerrs Rd &middot; ICP -40% &middot; Score 35%</div></li>
                </ul>
                <div class="wp-r-meta">+ 5 more high-risk accounts</div>
            `,
            detailed: `
                <div class="wp-r-title">All 8 flight-risk tenants</div>
                <ul class="wp-r-list">
                    <li><div><strong>Pacific Traders Ltd</strong> &middot; 45 Queen St, Onehunga &middot; <strong>28%</strong> &middot; Annual return 3mo overdue, Google reviews declining</div></li>
                    <li><div><strong>Atlas Logistics NZ</strong> &middot; 22 Wiri Station Rd &middot; <strong>31%</strong> &middot; Director linked to recent liquidation</div></li>
                    <li><div><strong>Southern Steel Fab</strong> &middot; 8 Kerrs Rd, Manukau &middot; <strong>35%</strong> &middot; ICP consumption -40%</div></li>
                    <li><div><strong>Cafe Nero Ltd</strong> &middot; 12 Ponsonby Rd &middot; <strong>34%</strong> &middot; Google reviews declining</div></li>
                    <li><div><strong>Vibe Studio Ltd</strong> &middot; 88 Ponsonby Rd &middot; <strong>41%</strong> &middot; Late annual return</div></li>
                    <li><div><strong>Good Dog Holdings</strong> &middot; 4/1179 Great North Rd &middot; <strong>30%</strong> &middot; Hiring frozen</div></li>
                    <li><div><strong>Shaw NZ Ltd</strong> &middot; A/47 Dalgety Dr &middot; <strong>34%</strong> &middot; $485k/yr exposure</div></li>
                    <li><div><strong>Shane Bradley</strong> &middot; B/32-38 Patiki Rd &middot; <strong>29%</strong> &middot; $334k/yr exposure</div></li>
                </ul>
                <div class="wp-r-quote">Total at-risk revenue: <strong>$1.8M annually</strong>. Wallace has 87 prospect matches for the top 4 properties &mdash; pre-emptive backfill recommended.</div>
            `
        },
        market: {
            brief: `
                <div class="wp-r-title">Auckland commercial &mdash; this week</div>
                <div class="wp-r-stat-row">
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Office $/sqm</span>
                        <span class="wp-r-stat-value">$385</span>
                        <span class="wp-r-stat-trend up">&#9650; 2.1%</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Industrial</span>
                        <span class="wp-r-stat-value">$165</span>
                        <span class="wp-r-stat-trend up">&#9650; 4.3%</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Retail</span>
                        <span class="wp-r-stat-value">$520</span>
                        <span class="wp-r-stat-trend down">&#9660; 0.8%</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Vacancy</span>
                        <span class="wp-r-stat-value">8.2%</span>
                        <span class="wp-r-stat-trend down">&#9650; 0.4%</span>
                    </div>
                </div>
                <div class="wp-r-quote">Industrial South Auckland is the standout &mdash; tight supply, +4.3% rate movement, low vacancy. Worth pitching to investors.</div>
            `,
            detailed: `
                <div class="wp-r-title">Sector deep dive</div>
                <div class="wp-r-stat-row">
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">CBD office prime</span>
                        <span class="wp-r-stat-value">$485</span>
                        <span class="wp-r-stat-trend up">&#9650; 1.8%</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">CBD office B-grade</span>
                        <span class="wp-r-stat-value">$285</span>
                        <span class="wp-r-stat-trend">flat</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Wynyard / Britomart</span>
                        <span class="wp-r-stat-value">$425</span>
                        <span class="wp-r-stat-trend up">&#9650; 3.2%</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Penrose industrial</span>
                        <span class="wp-r-stat-value">$182</span>
                        <span class="wp-r-stat-trend up">&#9650; 5.1%</span>
                    </div>
                </div>
                <ul class="wp-r-list">
                    <li><div><strong>Hot suburbs:</strong> Wynyard Quarter, East Tamaki, Penrose, Albany Tech Park</div></li>
                    <li><div><strong>Cooling:</strong> Newmarket retail, Queen St ground-floor retail</div></li>
                    <li><div><strong>OCR:</strong> 4.25% trending down &mdash; favours longer lease commitments</div></li>
                    <li><div><strong>CPI 2026-28 forecast:</strong> 2.1-2.4% &mdash; CPI-linked reviews favour tenants</div></li>
                </ul>
                <div class="wp-r-meta">Source: 847 comparable leases &middot; Last 24 months</div>
            `
        },
        expiring: {
            brief: `
                <div class="wp-r-title">18 leases expiring in next 3 months</div>
                <ul class="wp-r-list">
                    <li><div><strong>40A Spring St</strong>, Freemans Bay &middot; Integrity Food &middot; Jan 2026 (overdue)</div></li>
                    <li><div><strong>Unit H, 195 Main Hwy</strong>, Ellerslie &middot; Latitude Homes &middot; Jan 2026</div></li>
                    <li><div><strong>K117 Ormiston Town Centre</strong> &middot; Asaving Ltd &middot; Jan 2026</div></li>
                    <li><div><strong>367 Remuera Rd</strong> &middot; Kooper Fushion &middot; May 2026</div></li>
                </ul>
                <div class="wp-r-meta">+ 14 more &middot; 4 are flight risks</div>
            `,
            detailed: `
                <div class="wp-r-title">All 18 expiring leases (next 3 months)</div>
                <ul class="wp-r-list">
                    <li><div><strong>40A Spring St</strong> &middot; Integrity Food &middot; Jan 2026 &middot; <strong>$36k/yr</strong> &middot; Overdue</div></li>
                    <li><div><strong>Unit H, 195 Main Hwy</strong> &middot; Latitude Homes &middot; Jan 2026 &middot; $55k/yr</div></li>
                    <li><div><strong>K117 Ormiston</strong> &middot; Asaving Ltd &middot; Jan 2026 &middot; $46k/yr &middot; <strong>Renewing</strong></div></li>
                    <li><div><strong>136 Fanshawe St</strong> &middot; Riru Ltd &middot; Jan 2026 &middot; $34k/yr</div></li>
                    <li><div><strong>3 Pukemiro St</strong> &middot; Mr Cool Auto &middot; May 2026 &middot; <strong>Flight risk</strong></div></li>
                    <li><div><strong>367 Remuera Rd</strong> &middot; Kooper Fushion &middot; May 2026 &middot; $76k/yr</div></li>
                </ul>
                <div class="wp-r-stat-row">
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Total at risk</span>
                        <span class="wp-r-stat-value">$680k</span>
                        <span class="wp-r-stat-trend">3-month window</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Likely renew</span>
                        <span class="wp-r-stat-value">9</span>
                        <span class="wp-r-stat-trend up">Stickiness &gt;70%</span>
                    </div>
                </div>
                <div class="wp-r-meta">Backfill candidates surfaced by Wallace for 6 properties</div>
            `
        },
        expansion: {
            brief: `
                <div class="wp-r-title">11 expansion opportunities</div>
                <ul class="wp-r-list">
                    <li><div><strong>Lumiere Design</strong> &middot; 24-28 Beaumont St &middot; 6 active job listings, $450k fit-out</div></li>
                    <li><div><strong>Dawn Aerospace</strong> &middot; 12-14 Birmingham Dr &middot; 89% stickiness, hiring 4 engineers</div></li>
                    <li><div><strong>Creative Dental Ceramics</strong> &middot; 168 Aviemore Dr &middot; 95% stickiness</div></li>
                </ul>
                <div class="wp-r-meta">+ 8 more &middot; All flagged by Wallace</div>
            `,
            detailed: `
                <div class="wp-r-title">All 11 expansion candidates</div>
                <ul class="wp-r-list">
                    <li><div><strong>Lumiere Design</strong> &middot; Beaumont St &middot; 6 jobs, $450k fit-out, 92% stickiness</div></li>
                    <li><div><strong>Dawn Aerospace</strong> &middot; Birmingham Dr &middot; 4 engineering hires</div></li>
                    <li><div><strong>Creative Dental Ceramics</strong> &middot; Aviemore Dr &middot; 95% stickiness</div></li>
                    <li><div><strong>NZ Health Group</strong> &middot; Various &middot; Hiring surge, 12 roles</div></li>
                    <li><div><strong>Pandher Enterprises</strong> &middot; 180 Moore St &middot; 93% stickiness</div></li>
                    <li><div><strong>DB International Trading</strong> &middot; 81 Mays Rd &middot; 95% stickiness, blend &amp; extend ready</div></li>
                </ul>
                <div class="wp-r-quote">Wallace recommends focusing on Lumiere first &mdash; the renewal window opens in November and they've already flagged Suite 2B interest.</div>
            `
        },
        portfolio: {
            brief: `
                <div class="wp-r-title">Your portfolio at a glance</div>
                <div class="wp-r-stat-row">
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Properties</span>
                        <span class="wp-r-stat-value">54</span>
                        <span class="wp-r-stat-trend">7 regions</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Annual rent</span>
                        <span class="wp-r-stat-value">$6.8M</span>
                        <span class="wp-r-stat-trend up">+5.2%</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Avg stickiness</span>
                        <span class="wp-r-stat-value">62%</span>
                        <span class="wp-r-stat-trend up">+3% QoQ</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">At risk</span>
                        <span class="wp-r-stat-value">10</span>
                        <span class="wp-r-stat-trend down">$1.8M exposure</span>
                    </div>
                </div>
                <div class="wp-r-meta">11 expansion opportunities &middot; 18 expiring in 12 months</div>
            `,
            detailed: `
                <div class="wp-r-title">Portfolio breakdown by sector</div>
                <div class="wp-r-stat-row">
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Industrial</span>
                        <span class="wp-r-stat-value">19</span>
                        <span class="wp-r-stat-trend up">$2.1M rent</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Office</span>
                        <span class="wp-r-stat-value">15</span>
                        <span class="wp-r-stat-trend up">$2.4M rent</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Retail</span>
                        <span class="wp-r-stat-value">20</span>
                        <span class="wp-r-stat-trend">$2.3M rent</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Stable</span>
                        <span class="wp-r-stat-value">24</span>
                        <span class="wp-r-stat-trend up">Renewal &gt;70%</span>
                    </div>
                </div>
                <ul class="wp-r-list">
                    <li><div><strong>New signals this week:</strong> 9 properties (ICP, NZBN, hiring)</div></li>
                    <li><div><strong>Rolling 30-day enquiries:</strong> 142 across all listings</div></li>
                    <li><div><strong>Top performer:</strong> Industrial Penrose +5.1% $/sqm</div></li>
                </ul>
            `
        },
        listings: {
            brief: `
                <div class="wp-r-title">Your live listings &mdash; this week</div>
                <ul class="wp-r-list">
                    <li><div><strong>4 active listings</strong> &middot; 2 sale, 2 lease</div></li>
                    <li><div><strong>38 enquiries</strong> &middot; +12 vs last week</div></li>
                    <li><div><strong>Avg days on market: 52</strong> &middot; -8 vs regional</div></li>
                    <li><div><strong>Carlisle Rd</strong> standout &middot; 14 enquiries this week</div></li>
                </ul>
                <div class="wp-r-meta">Campaign spend: $4,220 &middot; $111 per enquiry</div>
            `,
            detailed: `
                <div class="wp-r-title">Listing performance breakdown</div>
                <ul class="wp-r-list">
                    <li><div><strong>170-174 Carlisle Rd</strong> &middot; Office investment &middot; 14 enquiries, 3 inspections booked</div></li>
                    <li><div><strong>33 Crummer Rd</strong> &middot; Office &middot; 8 enquiries, owner viewing this week</div></li>
                    <li><div><strong>49 Bryce St, Whanganui</strong> &middot; Industrial &middot; 11 enquiries</div></li>
                    <li><div><strong>88 Shortland St</strong> &middot; Office &middot; 5 enquiries, 1 hot lead from Wallace</div></li>
                </ul>
                <div class="wp-r-stat-row">
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Web views</span>
                        <span class="wp-r-stat-value">2,847</span>
                        <span class="wp-r-stat-trend up">+18% WoW</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Conversion</span>
                        <span class="wp-r-stat-value">1.3%</span>
                        <span class="wp-r-stat-trend up">Above average</span>
                    </div>
                </div>
            `
        },
        opex: {
            brief: `
                <div class="wp-r-title">OPEX budget generator</div>
                <p style="margin:0;">I can build a 12-month operating budget from any lease's Third Schedule &mdash; every line item mapped, benchmarked against the portfolio average, and projected forward 5 years. Auto-flags landlord-liability items.</p>
                <div class="wp-r-meta">Head to Documents &rarr; Advisory 03 to upload a lease</div>
            `,
            detailed: `
                <div class="wp-r-title">What the OPEX generator does</div>
                <ul class="wp-r-list">
                    <li><div><strong>Extract</strong> &middot; Reads Third Schedule, identifies all OPEX categories</div></li>
                    <li><div><strong>Map</strong> &middot; Each line tagged with accounting code</div></li>
                    <li><div><strong>Benchmark</strong> &middot; Compares each line against 847 comparable leases</div></li>
                    <li><div><strong>Flag</strong> &middot; Highlights items that should sit with the landlord (structural, capital)</div></li>
                    <li><div><strong>Project</strong> &middot; 5-year forecast using CPI + category inflators</div></li>
                    <li><div><strong>Export</strong> &middot; Excel, PDF, or push directly to Xero</div></li>
                </ul>
                <div class="wp-r-quote">Typical run on a 13-category Third Schedule takes about 4 seconds &mdash; agents have used it to identify $8-12k/yr savings on the average industrial lease.</div>
            `
        },
        clientUpdate: {
            brief: `
                <div class="wp-r-title">Draft for your top 3 clients</div>
                <p style="margin:0;">I can pre-draft a personalised weekly update for each client based on their property activity, market movements affecting their portfolio, and any recommendations from Costello.</p>
                <div class="wp-r-meta">Costello has 3 drafts ready for your review</div>
            `,
            detailed: `
                <div class="wp-r-title">Drafts ready for your sign-off</div>
                <ul class="wp-r-list">
                    <li><div><strong>Des Radonich</strong> &middot; 33 Crummer Rd update + Grey Lynn office market &middot; <strong>Ready</strong></div></li>
                    <li><div><strong>Marcus Miller</strong> &middot; Beaumont St renewal positioning + Suite 2B opportunity &middot; <strong>Ready</strong></div></li>
                    <li><div><strong>Glenn Cotterill</strong> &middot; Q1 portfolio summary + Wallace expansion matches &middot; <strong>Ready</strong></div></li>
                </ul>
                <div class="wp-r-quote">Costello pulls in property data, market movements, and engagement signals automatically &mdash; you just review the tone and click send.</div>
            `
        },
        agents: {
            brief: `
                <div class="wp-r-title">Your AI team &mdash; 5 agents</div>
                <ul class="wp-r-list">
                    <li><div><strong>Zara</strong> &middot; Admin &amp; task intelligence &mdash; runs your day</div></li>
                    <li><div><strong>Wallace</strong> &middot; Lead &amp; tenant matchmaker</div></li>
                    <li><div><strong>Costello</strong> &middot; Market reports &amp; data analysis</div></li>
                    <li><div><strong>Molloy</strong> &middot; Investment &amp; value-add analyst</div></li>
                    <li><div><strong>Brittany</strong> &middot; Contactless CRM &mdash; the data plumber</div></li>
                </ul>
            `,
            detailed: `
                <div class="wp-r-title">What each agent actually does</div>
                <ul class="wp-r-list">
                    <li><div><strong>Zara</strong> &middot; Schedules your week, prioritises tasks, monitors emails for follow-ups, books Ubers when parking is tight</div></li>
                    <li><div><strong>Wallace</strong> &middot; Matches tenants to properties using business vitality, hiring trends, location preferences. Surfaces conjunctional opportunities</div></li>
                    <li><div><strong>Costello</strong> &middot; Generates client market reports automatically. Pulls property data, market movements, comparable sales</div></li>
                    <li><div><strong>Molloy</strong> &middot; Investment analysis, value-add opportunities (mezzanines, fit-outs), yield projections</div></li>
                    <li><div><strong>Brittany</strong> &middot; Captures every conversation (calls, email, WhatsApp, WeChat, Plaud) and files into Vault RE automatically. Saves ~32hrs of admin per week</div></li>
                </ul>
                <div class="wp-r-meta">All 5 agents run simultaneously &middot; Configure under Settings &rarr; AI Agents</div>
            `
        },
        generic: {
            brief: `
                <div class="wp-r-title">Here's what I know</div>
                <p style="margin:0;">I can answer most quick questions about your portfolio, market trends, leases, contacts, and your daily activity. For property-specific deep dives I'll generate a Strategy Card, and for lease analysis I can run an Advisory or build an OPEX budget.</p>
                <div class="wp-r-stat-row">
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Properties indexed</span>
                        <span class="wp-r-stat-value">113k</span>
                        <span class="wp-r-stat-trend">NZ-wide</span>
                    </div>
                    <div class="wp-r-stat">
                        <span class="wp-r-stat-label">Comparables</span>
                        <span class="wp-r-stat-value">847</span>
                        <span class="wp-r-stat-trend">Last 24 months</span>
                    </div>
                </div>
                <div class="wp-r-meta">Tap one of the suggestions or rephrase your question</div>
            `,
            detailed: `
                <div class="wp-r-title">All the ways I can help</div>
                <ul class="wp-r-list">
                    <li><div><strong>Property analysis</strong> &middot; Strategy Cards, lease history, value-add opportunities</div></li>
                    <li><div><strong>Tenant intelligence</strong> &middot; Stickiness scoring, flight risk, expansion signals</div></li>
                    <li><div><strong>Market data</strong> &middot; $/sqm benchmarks, vacancy rates, sector trends</div></li>
                    <li><div><strong>Lease advisory</strong> &middot; Single-lease review, multi-lease comparison, OPEX budget</div></li>
                    <li><div><strong>Client engagement</strong> &middot; Drafts, reports, follow-up nudges</div></li>
                    <li><div><strong>Contactless capture</strong> &middot; Brittany handles all data entry across 6 channels</div></li>
                </ul>
                <div class="wp-r-meta">Just ask &mdash; I'll either answer here or open the full chat for the deep dive</div>
            `
        }
    };

    function getInlineResponse(key, tier) {
        const set = RESPONSES[key] || RESPONSES.generic;
        return set[tier] || set.brief;
    }

    // Detect strictly-complex queries that warrant the full chat (specific addresses, agent names)
    function isStrictlyComplexQuery(text) {
        const t = text.toLowerCase();
        const complexPatterns = [
            'strategy card', 'tell me about', 'tell me everything', 'analyse',
            'beaumont', 'crummer', 'osterley', 'parnell', 'lumiere',
            'wallace', 'costello', 'molloy', 'find tenant', 'find investor',
            'value-add', 'mezzanine', 'compare lease',
            'lease review', 'send to', 'generate report'
        ];
        return complexPatterns.some(p => t.includes(p));
    }

    function showThinking() {
        walterPopoutResponse?.classList.add('active');
        walterPopout?.classList.add('has-response');
        if (walterPopoutThinking) walterPopoutThinking.classList.remove('hidden');
        if (walterPopoutResponseBody) {
            walterPopoutResponseBody.classList.remove('active');
            walterPopoutResponseBody.innerHTML = '';
        }
        if (walterPopoutResponseActions) walterPopoutResponseActions.style.display = 'none';
    }

    function showResponse(html) {
        if (walterPopoutThinking) walterPopoutThinking.classList.add('hidden');
        if (walterPopoutResponseBody) {
            walterPopoutResponseBody.innerHTML = html;
            walterPopoutResponseBody.classList.add('active');
        }
        if (walterPopoutResponseActions) walterPopoutResponseActions.style.display = 'flex';
    }

    function clearResponse() {
        walterPopout?.classList.remove('has-response');
        walterPopoutResponse?.classList.remove('active');
        if (walterPopoutResponseBody) {
            walterPopoutResponseBody.innerHTML = '';
            walterPopoutResponseBody.classList.remove('active');
        }
        if (walterPopoutResponseActions) walterPopoutResponseActions.style.display = 'none';
        if (walterPopoutThinking) walterPopoutThinking.classList.remove('hidden');
        if (walterPopoutInput) walterPopoutInput.value = '';
    }

    function submitPopoutPrompt(text) {
        if (!text || !text.trim()) return;
        lastPopoutPrompt = text;
        lastResponseKey = classifyQuery(text);
        lastResponseTier = 'brief';

        // Strictly-complex queries (specific properties / agent names) → still escalate to full chat
        if (isStrictlyComplexQuery(text)) {
            closePopout();
            switchView('chat');
            setTimeout(() => {
                if (typeof simulateChat === 'function') {
                    simulateChat(text);
                }
            }, 200);
            return;
        }

        // Otherwise render the brief inline
        showThinking();
        if (walterPopoutInput) walterPopoutInput.value = '';
        setTimeout(() => {
            const html = getInlineResponse(lastResponseKey, 'brief');
            showResponse(html);
            updateMoreButton();
        }, 1100);
    }

    function updateMoreButton() {
        if (!walterPopoutMoreBtn) return;
        const hasDetailed = RESPONSES[lastResponseKey]?.detailed && lastResponseTier === 'brief';
        if (hasDetailed) {
            walterPopoutMoreBtn.style.display = '';
            walterPopoutMoreBtn.innerHTML = `
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                More detail
            `;
        } else {
            // Already showing detailed — hide the button or show "Done" state
            walterPopoutMoreBtn.style.display = 'none';
        }
    }

    // Wire response action buttons
    walterPopoutAnotherBtn?.addEventListener('click', () => {
        clearResponse();
        renderPopoutSuggestions();
        setTimeout(() => walterPopoutInput?.focus(), 100);
    });

    walterPopoutMoreBtn?.addEventListener('click', () => {
        // Show the detailed tier inline — no navigation
        if (!RESPONSES[lastResponseKey]?.detailed) return;
        showThinking();
        setTimeout(() => {
            lastResponseTier = 'detailed';
            const html = getInlineResponse(lastResponseKey, 'detailed');
            showResponse(html);
            updateMoreButton();
            // Scroll the response body to top so the new content is visible
            if (walterPopoutResponseBody) walterPopoutResponseBody.scrollTop = 0;
        }, 700);
    });

    // Wire interactions
    walterFab?.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePopout();
    });

    walterPopoutClose?.addEventListener('click', closePopout);

    walterPopoutForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = walterPopoutInput?.value.trim();
        if (text) submitPopoutPrompt(text);
    });

    walterPopoutFullLink?.addEventListener('click', () => {
        closePopout();
        switchView('chat');
        setTimeout(() => document.getElementById('chatInput')?.focus(), 150);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!walterPopout?.classList.contains('open')) return;
        if (walterPopout.contains(e.target) || walterFab?.contains(e.target)) return;
        closePopout();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && walterPopout?.classList.contains('open')) {
            closePopout();
        }
    });

    // simulateChat is defined inside this same closure so we need a reference
    // It will be hoisted by function declaration, but we check dynamically above

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

    // --- Settings page switching ---
    const settingsMeta = {
        contactless: {
            title: 'Contactless CRM',
            subtitle: 'Brittany listens across every channel and files everything into Vault RE automatically'
        },
        integrations: {
            title: 'Integrations',
            subtitle: 'Workspace identity, CRM backbone, and signal sources — the foundations that feed Walter'
        },
        alerts: {
            title: 'Alert Preferences',
            subtitle: 'Choose which signals reach you — and when'
        },
        agents: {
            title: 'AI Agents',
            subtitle: 'Manage the autonomous agents working alongside you'
        },
        context: {
            title: 'Personal Context',
            subtitle: 'Build a rich profile that personalises every agent, report, and recommendation'
        }
    };

    function showSettingsSection(section) {
        if (!section || !settingsMeta[section]) section = 'contactless';
        // Activate matching section panel
        document.querySelectorAll('#view-settings .settings-section').forEach(s => {
            s.classList.toggle('active', s.id === 'settings-' + section);
        });
        // Update tab active state
        document.querySelectorAll('.settings-page-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.section === section);
        });
        // Update header title + subtitle
        const meta = settingsMeta[section];
        const titleEl = document.getElementById('settingsViewTitle');
        const subtitleEl = document.getElementById('settingsViewSubtitle');
        if (titleEl) titleEl.textContent = meta.title;
        if (subtitleEl) subtitleEl.textContent = meta.subtitle;
        // Scroll the view to the top
        const viewEl = document.getElementById('view-settings');
        if (viewEl) viewEl.scrollTo?.({ top: 0, behavior: 'smooth' });
    }

    // In-page tab clicks
    document.querySelectorAll('.settings-page-tab').forEach(tab => {
        tab.addEventListener('click', () => showSettingsSection(tab.dataset.section));
    });

    // Cross-page handoff links (e.g. Integrations → Contactless CRM)
    document.querySelectorAll('[data-goto]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            showSettingsSection(el.dataset.goto);
        });
    });

    // Dropdown items navigate to settings + activate section
    document.querySelectorAll('.dropdown-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            settingsContainer.classList.remove('open');
            switchView(item.dataset.view);
            const section = item.dataset.section;
            // Only switch section if the dropdown item has a matching settings page
            if (section && settingsMeta[section]) {
                setTimeout(() => showSettingsSection(section), 50);
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
            const isWhoIsWalter = (
                /\bwho(?:'s|\s+is)\s+walter\b/i.test(text) ||
                /\bwhat\s+is\s+walter\b/i.test(text) ||
                /\bwhere\s+is\s+walter\b/i.test(text) ||
                /\bwalter\s+who\b/i.test(text) ||
                t === 'walter?' || t === 'walter'
            );

            let response = '';

            if (isWhoIsWalter) {
                response = getWhoIsWalterResponse();
            } else if (isBeaumont) {
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

    function getWhoIsWalterResponse() {
        const theories = [
            {
                title: 'Theory #1 — The Grandfather Paradox',
                body: `Honestly? <strong>We don't know who Walter is.</strong><br><br>Our best guess: Walter could be an example of the <em>Grandfather Paradox</em> in time travel. If he went back in time and prevented his grandfather from meeting his grandmother, he would never be born — which means he could never have gone back in time to stop them. So Walter both exists and doesn't exist, simultaneously. This may explain why nobody at Bayleys can confirm having met him.`
            },
            {
                title: 'Theory #2 — Schrödinger\'s Agent',
                body: `<strong>Walter is, by all available evidence, both a person and not a person.</strong><br><br>I queried the CRM, NZBN, LinkedIn, and three internal Slack channels. Walter appears in 47 references across Bayleys documentation, but no employee record exists. Until someone opens the box (i.e. actually meets him), Walter remains in a superposition of "legendary commercial property savant" and "elaborate group hallucination."`
            },
            {
                title: 'Theory #3 — The Founding Ghost',
                body: `<strong>Walter predates the data.</strong><br><br>Some say he was the first agent to ever close a deal on Queen Street. Others say he <em>is</em> the deal. The earliest mention of "Walter" in Bayleys archives is a 1973 note that simply reads: <em>"Walter says the warehouse is undervalued. He's usually right."</em> No surname. No follow-up. The warehouse sold for double a week later.`
            }
        ];
        const pick = theories[Math.floor(Math.random() * theories.length)];
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Searched CRM, HR records, and NZBN</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Cross-referenced 14 internal Slack channels</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Consulted physics department (just in case)</div>
                <div class="processing-step"><span class="step-icon done">&#10003;</span> Result: <em>inconclusive</em></div>
            </div>
            <strong>${pick.title}</strong><br><br>
            ${pick.body}<br><br>
            <div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.08));border-left:3px solid #8b5cf6;border-radius:6px;font-size:12px;color:var(--text-secondary);font-style:italic;">
                <span style="font-size:14px;line-height:1;">&#9758;</span>
                <span>If you do meet Walter, please let the team know. We'd love to thank him.</span>
            </div>
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

    // --- Documents: workflow widget + recent doc switching ---
    function showDocResult(viewId) {
        // Update active result view
        document.querySelectorAll('.doc-result-view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId)?.classList.add('active');

        // Update active workflow widget
        document.querySelectorAll('.docs-workflows-3 .docs-workflow').forEach(w => {
            w.classList.toggle('active', w.dataset.result === viewId);
        });

        // Smoothly scroll the results panel into view
        const panel = document.getElementById('docsResultPanel');
        if (panel) {
            setTimeout(() => {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }
    }

    // Wire up all data-result triggers (workflow widgets + recent doc cards)
    document.querySelectorAll('[data-result]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            showDocResult(el.dataset.result);
        });
    });

    // --- OPEX Budget: Regenerate animation ---
    const opexRegenBtn = document.getElementById('opexRegenBtn');
    const opexGenerating = document.getElementById('opexGenerating');
    const opexOutput = document.getElementById('opexOutput');
    opexRegenBtn?.addEventListener('click', () => {
        if (!opexGenerating || !opexOutput) return;
        opexOutput.style.display = 'none';
        opexGenerating.style.display = 'flex';
        setTimeout(() => {
            opexGenerating.style.display = 'none';
            opexOutput.style.display = '';
        }, 1800);
    });

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

    // --- Personal Context: Tag toggling ---
    document.querySelectorAll('.pc-tag:not(.add)').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    // --- Personal Context: Source pill switching (Bayleys / 365 / Manual) ---
    document.querySelectorAll('.pc-source-pills').forEach(group => {
        const pills = group.querySelectorAll('.pc-source-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            });
        });
    });

    // --- Personal Context: Communication style selection (multi-select) ---
    document.querySelectorAll('.pc-style-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('active');
        });
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

    // --- Agent Activity: show more/less toggle ---
    const activityMoreBtn = document.getElementById('activityMoreBtn');
    const activityMore = document.getElementById('activityMore');
    if (activityMoreBtn && activityMore) {
        activityMoreBtn.addEventListener('click', () => {
            const expanded = activityMore.classList.toggle('open');
            activityMoreBtn.setAttribute('aria-expanded', String(expanded));
            activityMoreBtn.querySelector('.activity-more-label').textContent = expanded
                ? 'Show less'
                : 'Show 4 more activities';
        });
    }

    // --- AI Agents: live pulse rings (toggle on/off) ---
    document.querySelectorAll('.agent-card').forEach(card => {
        const toggle = card.querySelector('.agent-card-header .toggle input[type="checkbox"]');
        if (!toggle) return;
        const sync = () => card.classList.toggle('paused', !toggle.checked);
        sync();
        toggle.addEventListener('change', sync);
    });

    // --- Contactless Capture: live feed ticker ---
    // Every 20s, update the "last capture" time hints on the first feed item to simulate live activity
    const ccFeed = document.getElementById('ccFeed');
    if (ccFeed) {
        const incomingCaptures = [
            {
                channel: 'sms',
                time: 'Just now',
                title: 'SMS from <strong>Karen Patel</strong> <span class="cc-feed-pill">Buyer enquiry</span>',
                desc: '"Hi Will, saw the Ormiston listing online — are you doing viewings this Saturday?"',
                route: 'Linked to <strong>R54 Ormiston Town Centre</strong> &middot; Intent: <span class="cc-intent warm">Buyer enquiry</span>'
            },
            {
                channel: 'whatsapp',
                time: 'Just now',
                title: 'WhatsApp from <strong>Priya Shah</strong> <span class="cc-feed-pill">Investor</span>',
                desc: '"Can you share the yield comparison for the Penrose industrial portfolio? Keen to progress this week."',
                route: 'Linked to <strong>Penrose Industrial Portfolio</strong> &middot; Intent: <span class="cc-intent hot">Ready to transact</span>'
            },
            {
                channel: 'email',
                time: 'Just now',
                title: 'Email from <strong>Nick Whitlow</strong> <span class="cc-feed-pill">Parnell owner</span>',
                desc: 'Thread summarised: Nick confirmed OIA approval and wants to progress the deal quickly.',
                route: 'Linked to <strong>14 St Stephens Ave</strong> &middot; <span class="cc-intent hot">OIA cleared</span>'
            },
            {
                channel: 'calls',
                time: 'Just now',
                title: 'Inbound call from <strong>Rachel Kim</strong> <span class="cc-feed-pill">2m 15s</span>',
                desc: 'Summary: Rachel asking about the Fanshawe St retail vacancy. Budget $450/sqm, timeline 30 days.',
                route: 'Linked to <strong>136 Fanshawe St</strong> &middot; Task: <span class="cc-intent">Send floorplan</span>'
            },
            {
                channel: 'plaud',
                time: 'Just now',
                title: 'Client meeting at <strong>Bayleys House</strong> <span class="cc-feed-pill plaud">Plaud</span>',
                desc: 'Captured: Discussed Ponsonby portfolio. Prospect open to yield-driven plays above 6.2%.',
                route: '1 contact enriched &middot; <span class="cc-intent">Sent to Wallace</span>'
            },
            {
                channel: 'wechat',
                time: 'Just now',
                title: 'WeChat voice note from <strong>Mr Wong</strong> <span class="cc-feed-pill wechat">52s &middot; 粵語</span>',
                desc: 'Transcribed from Cantonese: "The Botany retail strip — I\'m ready to move. Can we close before Chinese New Year?"',
                route: 'Linked to <strong>Botany Retail Strip</strong> &middot; Intent: <span class="cc-intent hot">Ready to close</span>'
            },
            {
                channel: 'wechat',
                time: 'Just now',
                title: 'WeChat Moments signal &mdash; <strong>Lucy Tan</strong> <span class="cc-feed-pill wechat">Moments</span>',
                desc: 'Posted photo at Commercial Bay lobby with caption "new HQ vibes" — contact flagged as expansion lead.',
                route: 'Linked to <strong>Lucy Tan &middot; ABC Imports</strong> &middot; Intent: <span class="cc-intent warm">Office expansion</span>'
            }
        ];
        let captureIndex = 0;

        function addLiveCapture() {
            // Skip if feed not visible (user is on a different page)
            const contactless = document.getElementById('settings-contactless');
            if (!contactless?.classList.contains('active')) return;

            const capture = incomingCaptures[captureIndex % incomingCaptures.length];
            captureIndex++;

            const iconSvgs = {
                plaud: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>',
                calls: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
                sms: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
                whatsapp: '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>',
                email: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
                wechat: '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/></svg>'
            };

            const newItem = document.createElement('div');
            newItem.className = 'cc-feed-item just-in';
            newItem.dataset.channel = capture.channel;
            newItem.innerHTML = `
                <div class="cc-feed-time">${capture.time}</div>
                <div class="cc-feed-icon ${capture.channel}">${iconSvgs[capture.channel]}</div>
                <div class="cc-feed-body">
                    <div class="cc-feed-title">${capture.title}</div>
                    <div class="cc-feed-desc">${capture.desc}</div>
                    <div class="cc-feed-route"><span class="cc-feed-arrow">&rarr;</span> ${capture.route}</div>
                </div>
            `;
            ccFeed.insertBefore(newItem, ccFeed.firstChild);

            // Age all other time labels
            const items = ccFeed.querySelectorAll('.cc-feed-item');
            items.forEach((item, i) => {
                if (i === 0) return;
                const timeEl = item.querySelector('.cc-feed-time');
                // Add a minute to each cascade (simple simulation)
                const ageMap = ['3 min ago','12 min ago','42 min ago','1 hour ago','2 hours ago'];
                timeEl.textContent = ageMap[Math.min(i - 1, ageMap.length - 1)];
            });

            // Trim to 5 items max
            while (ccFeed.querySelectorAll('.cc-feed-item').length > 5) {
                ccFeed.removeChild(ccFeed.lastChild);
            }
        }

        setInterval(addLiveCapture, 22000);
    }

    // --- Pipeline Drill-down Modal ---
    const pipelineModal = document.getElementById('pipelineModal');
    const pipelineModalClose = document.getElementById('pipelineModalClose');
    let pmCurrentTab = 'expiring';
    let pmCurrentWindow = 3;

    // Data model for drill-down list
    const pipelineData = {
        expiring: {
            title: 'Expiring Leases',
            subtitle: '142 leases expiring across your portfolio',
            heroNumber: '142',
            heroLabel: 'Expiring',
            // counts by window
            counts: { 3: 18, 6: 42, 12: 142, 18: 201 },
            quickstats: [
                { label: 'High-value (>$250k)', value: '23', sub: '16% of total', subClass: '' },
                { label: 'Flight risk', value: '31', sub: 'Stickiness < 40%', subClass: 'down' },
                { label: 'Auto-renewal predicted', value: '67', sub: 'Stickiness > 70%', subClass: 'up' }
            ],
            items: [
                { addr: '40A Spring Street, Freemans Bay', tenant: 'Integrity Food Distributors', type: 'office', expiry: 'Jan 2026', days: 'Expired 68 days ago', stick: 63, stickClass: 'medium', action: 'Overdue', agent: 'Z' },
                { addr: 'Unit H, 195 Main Highway, Ellerslie', tenant: 'Latitude Homes Ltd', type: 'office', expiry: 'Jan 2026', days: 'Expired 68 days', stick: 53, stickClass: 'medium', action: 'Overdue', agent: 'Z' },
                { addr: 'K117 Ormiston Town Centre, Flat Bush', tenant: 'Asaving Limited', type: 'retail', expiry: 'Jan 2026', days: 'Expired 68 days', stick: 90, stickClass: 'high', action: 'Likely renewed', agent: 'Z' },
                { addr: 'Ground Floor, 136 Fanshawe St, CBD', tenant: 'Riru Limited', type: 'retail', expiry: 'Jan 2026', days: 'Expired 68 days', stick: 49, stickClass: 'medium', action: 'Action req', agent: 'Z' },
                { addr: '367 Remuera Rd, Remuera', tenant: 'Kooper Fushion Ltd', type: 'retail', expiry: 'May 2026', days: 'In 28 days', stick: 68, stickClass: 'medium', action: 'Schedule call', agent: 'Z' },
                { addr: '3 Pukemiro Street, Onehunga', tenant: 'Mr Cool Auto Limited', type: 'industrial', expiry: 'May 2026', days: 'In 28 days', stick: 40, stickClass: 'low', action: 'Flight risk', agent: 'Z' }
            ]
        },
        renewals: {
            title: 'Renewals Likely',
            subtitle: '38 properties with renewal probability above 70%',
            heroNumber: '38',
            heroLabel: 'Renewals',
            counts: { 3: 9, 6: 17, 12: 38, 18: 54 },
            quickstats: [
                { label: 'Stickiness average', value: '84%', sub: '+4% vs portfolio', subClass: 'up' },
                { label: 'Total annual rent', value: '$2.1M', sub: 'Secure income', subClass: '' },
                { label: 'Blend & extend ready', value: '14', sub: 'Approach early', subClass: '' }
            ],
            items: [
                { addr: '12-14 Birmingham Drive, Christchurch', tenant: 'Dawn Aerospace NZ Ltd', type: 'industrial', expiry: 'Apr 2029', days: 'Renewal target', stick: 89, stickClass: 'high', action: 'Blend & extend', agent: 'Z' },
                { addr: '81 Mays Road, Onehunga', tenant: 'DB International Trading Ltd', type: 'industrial', expiry: 'Nov 2028', days: 'Renewal target', stick: 95, stickClass: 'high', action: 'Expansion', agent: 'W' },
                { addr: 'G/168 Aviemore Drive, Highland Park', tenant: 'Creative Dental Ceramics', type: 'retail', expiry: 'Apr 2029', days: 'Renewal target', stick: 95, stickClass: 'high', action: 'Expansion', agent: 'W' },
                { addr: '180 Moore Street, Howick', tenant: 'Pandher Enterprises Ltd', type: 'retail', expiry: 'Oct 2027', days: 'Renewal target', stick: 93, stickClass: 'high', action: 'Early close', agent: 'Z' },
                { addr: '373 Remuera Road, Remuera', tenant: 'Yanfeng LI', type: 'retail', expiry: 'Jul 2028', days: 'Renewal target', stick: 91, stickClass: 'high', action: 'Early close', agent: 'Z' },
                { addr: '24-28 Beaumont Street, Freemans Bay', tenant: 'Lumiere Design Group', type: 'office', expiry: 'Nov 2026', days: 'In 7 months', stick: 92, stickClass: 'high', action: 'Retention', agent: 'Z' }
            ]
        },
        backfill: {
            title: 'Backfill Needed',
            subtitle: '24 properties need a new tenant within 12 months',
            heroNumber: '24',
            heroLabel: 'Backfill',
            counts: { 3: 6, 6: 13, 12: 24, 18: 31 },
            quickstats: [
                { label: 'Wallace matches found', value: '87', sub: 'Active prospects', subClass: 'up' },
                { label: 'Avg days vacant', value: '42', sub: '&#9660; 18 vs market', subClass: 'up' },
                { label: 'Total $ at risk', value: '$1.8M', sub: 'Annual rent', subClass: 'down' }
            ],
            items: [
                { addr: 'A/47 Dalgety Drive, Wiri', tenant: 'Shaw NZ Limited', type: 'industrial', expiry: 'Sep 2026', days: 'In 5 months', stick: 34, stickClass: 'low', action: 'Wallace · 12 matches', agent: 'W' },
                { addr: '9/96 Rosedale Road, Albany', tenant: 'Unknown — ICP active', type: 'retail', expiry: 'Sep 2026', days: 'In 5 months', stick: 23, stickClass: 'low', action: 'Wallace · 8 matches', agent: 'W' },
                { addr: '2A/3-7 High Street, CBD', tenant: 'ICP signal detected', type: 'office', expiry: 'Sep 2026', days: 'In 5 months', stick: 41, stickClass: 'medium', action: 'Wallace · 15 matches', agent: 'W' },
                { addr: '4/1179 Great North Road, Pt Chevalier', tenant: 'Good Dog Holdings Ltd', type: 'retail', expiry: 'Feb 2027', days: 'In 10 months', stick: 30, stickClass: 'low', action: 'Pre-emptive', agent: 'W' },
                { addr: 'B/32-38 Patiki Road, Avondale', tenant: 'Shane Bradley', type: 'industrial', expiry: 'Oct 2027', days: 'In 18 months', stick: 29, stickClass: 'low', action: 'Monitor', agent: 'W' },
                { addr: '12 Ponsonby Rd, Ponsonby', tenant: 'Cafe Nero Ltd', type: 'retail', expiry: 'Aug 2026', days: 'In 4 months', stick: 34, stickClass: 'low', action: 'Flight risk', agent: 'W' }
            ]
        },
        risk: {
            title: 'Revenue at Risk',
            subtitle: '$4.2M in annual rent tied to accounts showing risk signals',
            heroNumber: '$4.2M',
            heroLabel: 'At risk',
            counts: { 3: 680000, 6: 1400000, 12: 4200000, 18: 5100000 },
            quickstats: [
                { label: 'Highest single risk', value: '$485k', sub: 'Shaw NZ · Wiri', subClass: 'down' },
                { label: 'Flight-risk tenants', value: '31', sub: 'Across 4 sectors', subClass: 'down' },
                { label: 'Mitigation actions', value: '18', sub: 'Zara in progress', subClass: 'up' }
            ],
            items: [
                { addr: 'A/47 Dalgety Drive, Wiri', tenant: 'Shaw NZ Limited', type: 'industrial', expiry: 'Sep 2026', days: '$485k/yr', stick: 34, stickClass: 'low', action: '&#8595; Flight', agent: 'Z' },
                { addr: 'B/32-38 Patiki Road, Avondale', tenant: 'Shane Bradley', type: 'industrial', expiry: 'Oct 2027', days: '$334k/yr', stick: 29, stickClass: 'low', action: '&#8595; Flight', agent: 'Z' },
                { addr: '9/96 Rosedale Road, Albany', tenant: 'Unknown — ICP active', type: 'retail', expiry: 'Sep 2026', days: '$287k/yr', stick: 23, stickClass: 'low', action: '&#8595; Flight', agent: 'Z' },
                { addr: '4/1179 Great North Road, Pt Chev', tenant: 'Good Dog Holdings Ltd', type: 'retail', expiry: 'Feb 2027', days: '$225k/yr', stick: 30, stickClass: 'low', action: '&#8595; Flight', agent: 'Z' },
                { addr: '12 Ponsonby Rd, Ponsonby', tenant: 'Cafe Nero Ltd', type: 'retail', expiry: 'Aug 2026', days: '$198k/yr', stick: 34, stickClass: 'low', action: '&#8595; Declining', agent: 'Z' },
                { addr: '88 Ponsonby Rd, Ponsonby', tenant: 'Vibe Studio Ltd', type: 'retail', expiry: 'Oct 2026', days: '$172k/yr', stick: 41, stickClass: 'medium', action: '&#8595; Declining', agent: 'Z' }
            ]
        }
    };

    function renderPipelineModal() {
        const d = pipelineData[pmCurrentTab];
        if (!d) return;
        document.getElementById('pmTitle').textContent = d.title;
        document.getElementById('pmHeroNumber').textContent = d.heroNumber;
        document.getElementById('pmHeroLabel').textContent = d.heroLabel;
        const subtitleEl = document.getElementById('pmSubtitle');
        const countForWindow = d.counts[pmCurrentWindow];
        const windowLabel = pmCurrentWindow === 3 ? 'next 3 months' : (pmCurrentWindow + ' months');
        let countText;
        if (pmCurrentTab === 'risk') {
            countText = '$' + (countForWindow >= 1000000 ? (countForWindow/1000000).toFixed(1) + 'M' : Math.round(countForWindow/1000) + 'k');
            subtitleEl.textContent = `${countText} at risk in the ${windowLabel} across your portfolio`;
            document.getElementById('pmCtaCount').textContent = `See all high-risk accounts`;
        } else {
            subtitleEl.textContent = `${countForWindow} ${d.heroLabel.toLowerCase()} in the ${windowLabel} across your portfolio`;
            document.getElementById('pmCtaCount').textContent = `See all ${countForWindow} properties`;
        }

        // Quickstats
        const qsEl = document.getElementById('pmQuickstats');
        qsEl.innerHTML = d.quickstats.map(q => `
            <div class="pm-qs">
                <span class="pm-qs-label">${q.label}</span>
                <span class="pm-qs-value">${q.value}</span>
                <span class="pm-qs-sub ${q.subClass}">${q.sub}</span>
            </div>
        `).join('');

        // List
        const listEl = document.getElementById('pmList');
        // Show a subset based on window (visual cue that window matters)
        const visibleCount = pmCurrentWindow === 3 ? 4 : (pmCurrentWindow === 6 ? 5 : 6);
        const items = d.items.slice(0, visibleCount);
        listEl.innerHTML = items.map(it => `
            <div class="pm-item">
                <div class="pm-item-main">
                    <div class="pm-item-addr">${it.addr}</div>
                    <div class="pm-item-tenant">
                        <span class="pm-item-type ${it.type}">${it.type}</span>
                        ${it.tenant}
                    </div>
                </div>
                <div class="pm-item-expiry">
                    <span class="pm-item-expiry-date">${it.expiry}</span>
                    <span class="pm-item-expiry-days">${it.days}</span>
                </div>
                <div class="pm-item-stick">
                    <div class="pm-item-stick-label"><span>Stickiness</span><span>${it.stick}%</span></div>
                    <div class="pm-item-stick-bar"><div class="pm-item-stick-fill ${it.stickClass}" style="width:${it.stick}%"></div></div>
                </div>
                <div class="pm-item-action">
                    <span class="agent-pip zara">${it.agent}</span>
                    <span>${it.action}</span>
                </div>
            </div>
        `).join('');
    }

    function openPipelineModal(tab) {
        pmCurrentTab = tab || 'expiring';
        pmCurrentWindow = 3;
        // Update active tab button
        document.querySelectorAll('.pm-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === pmCurrentTab));
        document.querySelectorAll('.pm-chip[data-window]').forEach(c => c.classList.toggle('active', c.dataset.window === '3'));
        renderPipelineModal();
        pipelineModal?.classList.add('active');
    }

    // Wire home stats
    document.querySelectorAll('.pipeline-stat').forEach(btn => {
        btn.addEventListener('click', () => openPipelineModal(btn.dataset.pipeline));
    });

    // Tab switching inside modal
    document.querySelectorAll('.pm-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            pmCurrentTab = tab.dataset.tab;
            document.querySelectorAll('.pm-tab').forEach(t => t.classList.toggle('active', t === tab));
            renderPipelineModal();
        });
    });

    // Window chip switching
    document.querySelectorAll('.pm-chip[data-window]').forEach(chip => {
        chip.addEventListener('click', () => {
            pmCurrentWindow = parseInt(chip.dataset.window, 10);
            document.querySelectorAll('.pm-chip[data-window]').forEach(c => c.classList.toggle('active', c === chip));
            renderPipelineModal();
        });
    });

    pipelineModalClose?.addEventListener('click', () => pipelineModal.classList.remove('active'));
    pipelineModal?.addEventListener('click', (e) => {
        if (e.target === pipelineModal) pipelineModal.classList.remove('active');
    });

    // CTA → flow to My Properties with filter
    document.getElementById('pmCtaBtn')?.addEventListener('click', () => {
        const filterMap = {
            expiring: 'expiring-12',
            renewals: 'stable',
            backfill: 'at-risk',
            risk: 'at-risk'
        };
        pipelineModal.classList.remove('active');
        switchView('properties');
        setTimeout(() => applyPropertyFilter(filterMap[pmCurrentTab]), 150);
    });

    // --- My Properties: per-row action menu + drill-down modal ---
    const propDrillModal = document.getElementById('propDrillModal');
    const propDrillClose = document.getElementById('propDrillClose');
    const pdAddress = document.getElementById('pdAddress');

    function openPropDrill(address, tab) {
        if (pdAddress && address) pdAddress.textContent = address;
        // Activate the selected tab (default: history)
        const targetTab = tab || 'history';
        document.querySelectorAll('.pd-tab').forEach(t => t.classList.toggle('active', t.dataset.pdTab === targetTab));
        document.querySelectorAll('.pd-panel').forEach(p => p.classList.toggle('active', p.id === 'pdPanel' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)));
        propDrillModal?.classList.add('active');
    }

    propDrillClose?.addEventListener('click', () => propDrillModal.classList.remove('active'));
    propDrillModal?.addEventListener('click', (e) => {
        if (e.target === propDrillModal) propDrillModal.classList.remove('active');
    });

    // Tab switching inside drill-down modal
    document.querySelectorAll('.pd-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.dataset.pdTab;
            document.querySelectorAll('.pd-tab').forEach(t => t.classList.toggle('active', t === tab));
            document.querySelectorAll('.pd-panel').forEach(p => p.classList.toggle('active', p.id === 'pdPanel' + key.charAt(0).toUpperCase() + key.slice(1)));
        });
    });

    // History category filter
    document.querySelectorAll('.pd-hist-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const cat = chip.dataset.hist;
            document.querySelectorAll('.pd-hist-chip').forEach(c => c.classList.toggle('active', c === chip));
            document.querySelectorAll('.pd-tl-item').forEach(item => {
                item.classList.toggle('filtered-out', cat !== 'all' && item.dataset.cat !== cat);
            });
        });
    });

    // Inject action cells into every property row
    const propTableRows = document.querySelectorAll('#view-properties .properties-table tbody tr');
    propTableRows.forEach((row) => {
        // Don't double-inject
        if (row.querySelector('.td-actions')) return;

        const actionCell = document.createElement('td');
        actionCell.className = 'td-actions';
        // Stop row click-through so the action cell doesn't also open the property summary
        actionCell.addEventListener('click', (e) => e.stopPropagation());
        actionCell.innerHTML = `
            <button class="prop-action-btn" aria-label="Property actions">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
            </button>
            <div class="prop-action-menu">
                <div class="pam-sub" style="padding:6px 12px 2px;">Property drill-down</div>
                <button data-pd="history">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span class="pam-label">History</span>
                </button>
                <button data-pd="reports">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span class="pam-label">Reports</span>
                </button>
                <button data-pd="insights">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    <span class="pam-label">Insights</span>
                </button>
                <button data-pd="data">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0018 0V5"/><path d="M3 12a9 3 0 0018 0"/></svg>
                    <span class="pam-label">Data</span>
                </button>
                <div class="pam-divider"></div>
                <button data-pd="summary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    <span class="pam-label">Open property summary</span>
                </button>
            </div>
        `;
        row.appendChild(actionCell);

        const btn = actionCell.querySelector('.prop-action-btn');
        const menu = actionCell.querySelector('.prop-action-menu');

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close any other open menus first
            document.querySelectorAll('.prop-action-menu.open').forEach(m => {
                if (m !== menu) m.classList.remove('open');
            });
            document.querySelectorAll('.prop-action-btn.open').forEach(b => {
                if (b !== btn) b.classList.remove('open');
            });
            menu.classList.toggle('open');
            btn.classList.toggle('open');
        });

        // Menu item clicks
        actionCell.querySelectorAll('.prop-action-menu button[data-pd]').forEach(mi => {
            mi.addEventListener('click', (e) => {
                e.stopPropagation();
                const tab = mi.dataset.pd;
                const address = row.querySelector('.cell-primary')?.textContent?.trim() || 'Property';
                menu.classList.remove('open');
                btn.classList.remove('open');
                if (tab === 'summary') {
                    // Trigger the existing row-click behaviour
                    if (address.includes('Crummer')) {
                        document.getElementById('crummerModal')?.classList.add('active');
                    } else {
                        document.getElementById('propertyModal')?.classList.add('active');
                    }
                } else {
                    openPropDrill(address, tab);
                }
            });
        });
    });

    // Close dropdown menus when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.prop-action-menu.open').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.prop-action-btn.open').forEach(b => b.classList.remove('open'));
    });

    // --- My Properties: filtering ---
    const mpWidgets = document.querySelectorAll('.mp-widget');
    const mpQuickChips = document.querySelectorAll('.mp-quick-chips .mp-chip');
    const mpSearchInput = document.getElementById('mpSearchInput');
    const mpActiveFilter = document.getElementById('mpActiveFilter');
    const mpActiveChip = document.getElementById('mpActiveChip');
    const mpClearFilter = document.getElementById('mpClearFilter');
    const propCountDisplay = document.getElementById('propCountDisplay');

    let mpState = { filter: 'all', type: 'all', search: '' };

    const widgetLabels = {
        'all': 'All properties',
        'expiring-12': 'Expiring in 12 months',
        'at-risk': 'At Risk',
        'expansion': 'Expansion Opportunity',
        'new-signal': 'New Signals',
        'stable': 'Stable',
        'high-value': 'High-value (>$300/sqm)',
        'stickiness': 'High stickiness (>70%)'
    };

    function applyPropertyFilter(filter) {
        mpState.filter = filter || 'all';
        mpWidgets.forEach(w => w.classList.toggle('active', w.dataset.filter === mpState.filter && mpState.filter !== 'all'));
        renderPropertyFilter();
    }

    function renderPropertyFilter() {
        const rows = document.querySelectorAll('.properties-table tbody tr');
        let visible = 0;
        const total = rows.length;
        rows.forEach(row => {
            let show = true;

            // Filter by status/category
            if (mpState.filter !== 'all') {
                const statusBadge = row.querySelector('.status-badge');
                const status = statusBadge ? Array.from(statusBadge.classList).find(c => c !== 'status-badge') : '';
                const stickFill = row.querySelector('.stickiness-fill');
                const stickPct = stickFill ? parseInt(stickFill.style.width) || 0 : 0;
                const dollarCell = row.querySelectorAll('td')[4];
                const dollar = dollarCell ? parseInt((dollarCell.textContent || '').replace(/[^0-9]/g, '')) || 0 : 0;
                const expiryCell = row.querySelectorAll('td')[5];
                const expiry = expiryCell ? expiryCell.textContent.trim() : '';

                if (mpState.filter === 'at-risk' && status !== 'at-risk') show = false;
                else if (mpState.filter === 'expansion' && status !== 'expansion') show = false;
                else if (mpState.filter === 'new-signal' && status !== 'new-signal') show = false;
                else if (mpState.filter === 'stable' && status !== 'stable') show = false;
                else if (mpState.filter === 'high-value' && dollar < 300) show = false;
                else if (mpState.filter === 'stickiness' && stickPct < 70) show = false;
                else if (mpState.filter === 'expiring-12') {
                    // Expiries in the next 12 months: Jan 2026 – Apr 2027
                    const m12 = ['Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026','Jul 2026','Aug 2026','Sep 2026','Oct 2026','Nov 2026','Dec 2026','Jan 2027','Feb 2027','Mar 2027','Apr 2027'];
                    if (!m12.includes(expiry)) show = false;
                }
            }

            // Filter by type chip
            if (mpState.type !== 'all') {
                const typeBadge = row.querySelector('.type-badge');
                const type = typeBadge ? Array.from(typeBadge.classList).find(c => c !== 'type-badge') : '';
                if (type !== mpState.type) show = false;
            }

            // Filter by search
            if (mpState.search) {
                const txt = row.textContent.toLowerCase();
                if (!txt.includes(mpState.search.toLowerCase())) show = false;
            }

            row.classList.toggle('filtered-out', !show);
            if (show) {
                visible++;
                row.classList.add('filtered-highlight');
                setTimeout(() => row.classList.remove('filtered-highlight'), 1300);
            }
        });

        propCountDisplay.textContent = `Showing ${visible} of ${total}`;

        // Update active filter pill
        if (mpState.filter !== 'all' || mpState.type !== 'all' || mpState.search) {
            mpActiveFilter.style.display = 'inline-flex';
            const parts = [];
            if (mpState.filter !== 'all') parts.push(widgetLabels[mpState.filter]);
            if (mpState.type !== 'all') parts.push(mpState.type.charAt(0).toUpperCase() + mpState.type.slice(1));
            if (mpState.search) parts.push(`"${mpState.search}"`);
            mpActiveChip.textContent = parts.join(' · ') || 'Active';
        } else {
            mpActiveFilter.style.display = 'none';
        }
    }

    mpWidgets.forEach(w => {
        w.addEventListener('click', () => {
            const next = w.dataset.filter;
            // Toggle off if clicking active widget
            if (mpState.filter === next && next !== 'all') {
                applyPropertyFilter('all');
            } else {
                applyPropertyFilter(next);
            }
        });
    });

    mpQuickChips.forEach(c => {
        c.addEventListener('click', () => {
            mpState.type = c.dataset.type;
            mpQuickChips.forEach(o => o.classList.toggle('active', o === c));
            renderPropertyFilter();
        });
    });
    // Init "All types" as active
    const defaultChip = document.querySelector('.mp-quick-chips .mp-chip[data-type="all"]');
    if (defaultChip) defaultChip.classList.add('active');

    mpSearchInput?.addEventListener('input', () => {
        mpState.search = mpSearchInput.value.trim();
        renderPropertyFilter();
    });

    mpClearFilter?.addEventListener('click', () => {
        mpState = { filter: 'all', type: 'all', search: '' };
        mpSearchInput.value = '';
        mpWidgets.forEach(w => w.classList.remove('active'));
        mpQuickChips.forEach(c => c.classList.toggle('active', c.dataset.type === 'all'));
        renderPropertyFilter();
    });

    // --- Zara × Uber: book parking-rescue ride ---
    document.getElementById('zuBookBtn')?.addEventListener('click', () => {
        const card = document.getElementById('zaraUberCard');
        if (!card) return;
        const actions = card.querySelector('.zu-actions');
        actions.innerHTML = '&#10003; Booked &mdash; Uber arrives 10:48 AM &middot; receipt to Xero';
        card.classList.add('booked');
    });

    // --- Feedback Modal ---
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackLink = document.getElementById('feedbackLink');
    const feedbackModalClose = document.getElementById('feedbackModalClose');
    const fbInput = document.getElementById('fbInput');
    const fbCharCount = document.getElementById('fbCharCount');
    const fbSendBtn = document.getElementById('fbSendBtn');
    const fbStageCompose = document.getElementById('fbStageCompose');
    const fbStageThinking = document.getElementById('fbStageThinking');
    const fbStageResponse = document.getElementById('fbStageResponse');
    const fbAnotherBtn = document.getElementById('fbAnotherBtn');
    const fbDoneBtn = document.getElementById('fbDoneBtn');
    let fbCurrentType = 'idea';

    function openFeedback() {
        resetFeedback();
        feedbackModal?.classList.add('active');
        setTimeout(() => fbInput?.focus(), 200);
    }
    function closeFeedback() {
        feedbackModal?.classList.remove('active');
    }
    function resetFeedback() {
        fbStageCompose.classList.add('active');
        fbStageThinking.classList.remove('active');
        fbStageResponse.classList.remove('active');
        if (fbInput) fbInput.value = '';
        if (fbCharCount) fbCharCount.textContent = '0 chars';
        document.querySelectorAll('.fb-thinking-step').forEach(s => s.classList.remove('visible'));
    }

    feedbackLink?.addEventListener('click', (e) => {
        e.preventDefault();
        openFeedback();
        // Close the dropdown if open
        document.querySelector('.user-dropdown')?.classList.remove('active');
    });
    feedbackModalClose?.addEventListener('click', closeFeedback);
    feedbackModal?.addEventListener('click', (e) => {
        if (e.target === feedbackModal) closeFeedback();
    });
    fbAnotherBtn?.addEventListener('click', () => resetFeedback());
    fbDoneBtn?.addEventListener('click', closeFeedback);

    document.querySelectorAll('.fb-type').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.fb-type').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            fbCurrentType = btn.dataset.type;
            const placeholders = {
                idea: "The more detail the better. Walter loves context.",
                bug: "What happened? What did you expect? Walter will trace it.",
                love: "What's working for you? We'll do more of it.",
                question: "Ask away — Walter will explain or point you to a tip."
            };
            if (fbInput) fbInput.placeholder = placeholders[fbCurrentType];
        });
    });

    fbInput?.addEventListener('input', () => {
        const len = fbInput.value.length;
        fbCharCount.textContent = `${len} chars`;
    });

    fbSendBtn?.addEventListener('click', () => {
        const text = fbInput.value.trim();
        if (!text) {
            fbInput.focus();
            fbInput.style.boxShadow = '0 0 0 4px rgba(239,68,68,0.15)';
            setTimeout(() => fbInput.style.boxShadow = '', 800);
            return;
        }
        runFeedbackFlow(text);
    });

    function runFeedbackFlow(text) {
        fbStageCompose.classList.remove('active');
        fbStageThinking.classList.add('active');
        const steps = document.querySelectorAll('.fb-thinking-step');
        steps.forEach((s, i) => {
            setTimeout(() => s.classList.add('visible'), 350 + i * 500);
        });
        setTimeout(() => {
            fbStageThinking.classList.remove('active');
            fbStageResponse.classList.add('active');
            renderFeedbackResponse(text);
        }, 2200);
    }

    function renderFeedbackResponse(text) {
        const t = text.toLowerCase();
        const titleEl = document.getElementById('fbResponseTitle');
        const bodyEl = document.getElementById('fbResponseBody');
        const extrasEl = document.getElementById('fbResponseExtras');
        extrasEl.innerHTML = '';

        // Pattern matching: detect existing functionality
        const features = [
            { keywords: ['dark mode', 'dark theme', 'night mode'], name: 'Dark Mode', tip: 'Already shipped! Click your profile avatar (top-right) → Theme → Dark. Walter remembers your preference across sessions.' },
            { keywords: ['export', 'pdf', 'download'], name: 'Strategy Card Export', tip: 'You can export any Walter Strategy Card to PDF — open the card, then click the share icon in the top-right of the modal.' },
            { keywords: ['mobile', 'phone', 'app'], name: 'Mobile Companion', tip: 'The mobile companion app is in beta. Ask your team lead for an invite — it pushes priority actions to your phone.' },
            { keywords: ['calendar', 'sync', 'outlook'], name: 'Calendar Sync', tip: 'Calendar sync is live via Microsoft 365. Settings → Integrations → Microsoft 365 → toggle "Sync calendar".' },
            { keywords: ['signature', 'email signature'], name: 'Email Signature Sync', tip: 'Walter pulls your signature automatically from M365. Check it under Settings → Personal Context → Communication.' },
            { keywords: ['notification', 'alert'], name: 'Alert Preferences', tip: 'Customise alerts under Settings → Alert Preferences. You can mute specific signal types or change the lead time.' },
            { keywords: ['tag', 'specialty', 'specialism'], name: 'Personal Context Tags', tip: 'Tags live in Settings → Personal Context. They power how Zara routes opportunities to you.' }
        ];
        const matched = features.find(f => f.keywords.some(k => t.includes(k)));

        // Bug detection
        const isBug = fbCurrentType === 'bug' || /\b(broken|bug|error|crash|stuck|frozen|won't|wont|fail)\b/.test(t);
        const isLove = fbCurrentType === 'love' || /\b(love|amazing|awesome|brilliant|incredible|game.changer)\b/.test(t);

        let title, body;
        let popularity = null;

        if (matched) {
            title = "Walter found something for you";
            body = `Good news — <strong>${matched.name}</strong> already exists in Walter, you might not have come across it yet. Here's how to use it:`;
            extrasEl.innerHTML = `
                <div class="fb-tip-card">
                    <div class="fb-tip-icon">&#9728;</div>
                    <div class="fb-tip-card-body">
                        <strong>${matched.name}</strong>
                        ${matched.tip}
                    </div>
                </div>
                <div class="fb-popularity">
                    <span>Still want this changed? I'll log your note against the feature.</span>
                </div>
            `;
        } else if (isBug) {
            title = "On it. Sorry about that.";
            body = `Logged as <strong>BUG-1248</strong> and routed to the engineering channel. The team checks the bug queue every morning at 8:30am. I've attached your current screen and session details so they can reproduce it without having to chase you.`;
            extrasEl.innerHTML = `
                <div class="fb-popularity">
                    <span>You'll get an email when this is fixed</span>
                    <div class="fb-popularity-bar"><div class="fb-popularity-fill" style="width:18%"></div></div>
                    <span style="white-space:nowrap;color:var(--text-primary);font-weight:500;">Triage</span>
                </div>
            `;
        } else if (isLove) {
            title = "This made my day";
            body = `Genuinely — thank you. I'll pass this through to the team. Knowing what's working keeps us pointed at the right things. Keep the loving feedback coming, and keep the suggestions coming too.`;
            extrasEl.innerHTML = `
                <div class="fb-popularity">
                    <span>&#10084; Shared with the Walter team Slack channel</span>
                </div>
            `;
        } else {
            // Generic "your idea" response with popularity match
            const matchCount = Math.floor(Math.random() * 6) + 2; // 2–7
            const ranks = ['top of the to-do list', 'roadmap shortlist', 'next sprint shortlist'];
            const rank = ranks[Math.floor(Math.random() * ranks.length)];
            title = "Awesome feedback";
            body = `You're actually the <strong>${matchCount}${ordinalSuffix(matchCount)} person</strong> to mention this concept in the last week. That puts it on the <strong>${rank}</strong>. Thank you for taking the time — this is exactly the kind of input that shapes Walter.<br><br>&mdash; Walter`;
            const pct = Math.min(20 + matchCount * 12, 92);
            extrasEl.innerHTML = `
                <div class="fb-popularity">
                    <span>Idea momentum</span>
                    <div class="fb-popularity-bar"><div class="fb-popularity-fill" style="width:0%"></div></div>
                    <span style="white-space:nowrap;color:var(--text-primary);font-weight:500;">${matchCount} mentions</span>
                </div>
                <div class="fb-tip-card">
                    <div class="fb-tip-icon" style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);">&#9758;</div>
                    <div class="fb-tip-card-body">
                        <strong>What happens next</strong>
                        Your idea joins 1,247 prior submissions. Top-voted concepts go to the team's monthly roadmap review on the 1st. You'll get a note from me when it ships.
                    </div>
                </div>
            `;
            // Animate the bar after a beat
            setTimeout(() => {
                const fill = extrasEl.querySelector('.fb-popularity-fill');
                if (fill) fill.style.width = pct + '%';
            }, 100);
        }

        titleEl.textContent = title;
        bodyEl.innerHTML = body;
    }

    function ordinalSuffix(n) {
        const s = ['th','st','nd','rd'];
        const v = n % 100;
        return s[(v-20)%10] || s[v] || s[0];
    }

    // --- Escape key closes any open modal ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            strategyModal.classList.remove('active');
            propertyModal?.classList.remove('active');
            crummerModal?.classList.remove('active');
            calendarModal?.classList.remove('active');
            carlisleModal?.classList.remove('active');
            mapPopup?.classList.remove('active');
            feedbackModal?.classList.remove('active');
            pipelineModal?.classList.remove('active');
            propDrillModal?.classList.remove('active');
        }
    });
});
