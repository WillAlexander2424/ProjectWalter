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
        // Scroll main content to top on view switch
        document.querySelector('.main-content')?.scrollTo?.(0, 0);
        // Close any open modals when switching views (clean slate for demo)
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        // Reset Walter Chat when navigating away so the demo experience resets
        if (viewId !== 'chat') {
            resetChat();
        }
    }

    function resetChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        chatMessages.innerHTML = `
            <div class="chat-welcome">
                <div class="chat-logo"><div class="logo-icon large">W</div></div>
                <h2>Walter Intelligence</h2>
                <p>Ask me about any commercial property in New Zealand. I can analyse leases, predict expiries, identify opportunities, draft clauses, and reference legal precedents.</p>
                <div class="chat-suggestions">
                    <button class="chat-suggestion" data-prompt="Analyse the lease situation for 24-28 Beaumont Street, Freemans Bay">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        Analyse 24 Beaumont St
                    </button>
                    <button class="chat-suggestion" data-prompt="Show me all industrial properties in South Auckland with leases expiring in the next 18 months">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        Industrial expiries — South Auckland
                    </button>
                    <button class="chat-suggestion" data-prompt="Compare $/sqm rates for retail in Ponsonby vs Newmarket over the last 3 years">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        Ponsonby vs Newmarket retail
                    </button>
                    <button class="chat-suggestion" data-prompt="Get Costello to prepare a market report for Des Radonich Limited, the owner of 33 Crummer Road, Grey Lynn. Include Grey Lynn office sector performance, lease trends, and value-add opportunities.">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                        Market report for 33 Crummer Rd owner
                    </button>
                    <button class="chat-suggestion" data-prompt="Get Wallace to find tenant and investor matches for 33 Crummer Road, Grey Lynn. Show compatibility scores and conjunctional opportunities.">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                        Wallace: Match tenants for 33 Crummer Rd
                    </button>
                    <button class="chat-suggestion" data-prompt="A tenant is disputing the OPEX charges claiming the landlord has included capital expenditure items. What are the legal grounds under the ADLS lease and what tribunal precedents support the tenant or landlord position?">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        OPEX dispute — tribunal precedents
                    </button>
                </div>
            </div>
        `;
        // Re-wire suggestion chips
        chatMessages.querySelectorAll('.chat-suggestion').forEach(btn => {
            btn.addEventListener('click', () => simulateChat(btn.dataset.prompt));
        });
        // Reset input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) { chatInput.value = ''; chatInput.style.height = 'auto'; }
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
                <div class="processing-step"><span class="step-dot done"></span> Queried CRM database — match found</div>
                <div class="processing-step"><span class="step-dot done"></span> LINZ title search — Beaumont Trustees Ltd</div>
                <div class="processing-step"><span class="step-dot done"></span> ICP Registry — Active since Nov 2022</div>
                <div class="processing-step"><span class="step-dot done"></span> NZBN entity check — Lumiere Design Group Ltd</div>
                <div class="processing-step"><span class="step-dot done"></span> OpenClaw scan — 6 active Seek listings detected</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Filtered database — Ponsonby, lease expiry within 12 months</div>
                <div class="processing-step"><span class="step-dot done"></span> Cross-referenced ICP and NZBN signals</div>
                <div class="processing-step"><span class="step-dot done"></span> Applied stickiness scoring model</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Filtered — South Auckland, Industrial, elevated risk signals</div>
                <div class="processing-step"><span class="step-dot done"></span> NZBN annual return status check</div>
                <div class="processing-step"><span class="step-dot done"></span> OpenClaw business vitality scan</div>
            </div>
            <div class="chat-section-title">South Auckland Industrial — Elevated Flight Risk</div>
            <p class="chat-body">Identified <strong>8 tenants</strong> with high flight risk signals across South Auckland industrial:</p>
            <div class="chat-risk-card risk-high">
                <div class="chat-risk-header"><span class="chat-risk-dot high"></span><strong>Pacific Traders Ltd</strong><span class="chat-risk-score">28%</span></div>
                <div class="chat-risk-meta">45 Queen St · Annual return 3 months overdue · Google reviews declining</div>
            </div>
            <div class="chat-risk-card risk-high">
                <div class="chat-risk-header"><span class="chat-risk-dot high"></span><strong>Atlas Logistics NZ</strong><span class="chat-risk-score">31%</span></div>
                <div class="chat-risk-meta">22 Wiri Station Rd · Director linked to recent liquidation</div>
            </div>
            <div class="chat-risk-card risk-medium">
                <div class="chat-risk-header"><span class="chat-risk-dot medium"></span><strong>Southern Steel Fabrication</strong><span class="chat-risk-score">35%</span></div>
                <div class="chat-risk-meta">8 Kerrs Rd, Manukau · ICP consumption dropped 40%</div>
            </div>
            <div class="chat-section-title" style="margin-top:16px">Recommended Actions</div>
            <div class="chat-actions-list">
                <div class="chat-action-item"><span class="chat-action-num">1</span>Immediate landlord engagement for Pacific Traders — prepare backfill strategy</div>
                <div class="chat-action-item"><span class="chat-action-num">2</span>Monitor Atlas Logistics monthly — director contagion risk</div>
                <div class="chat-action-item"><span class="chat-action-num">3</span>Check Southern Steel ICP trend next 30 days before escalating</div>
            </div>
            <p class="chat-body" style="margin-top:12px;color:var(--blue);">Shall I generate a Pre-emptive Backfill strategy for any of these properties?</p>
        `;
    }

    function getWallaceResponse() {
        return `
            <div class="processing-steps">
                <div class="processing-step"><span class="step-dot done"></span> Wallace activated — scanning market for 33 Crummer Rd matches</div>
                <div class="processing-step"><span class="step-dot done"></span> Searched Bayleys database — 3 active tenant requirements matched</div>
                <div class="processing-step"><span class="step-dot done"></span> Scanned competitor listings — Colliers, CBRE, JLL</div>
                <div class="processing-step"><span class="step-dot done"></span> Checked Walter signals — ICP activations, Seek, NZBN</div>
                <div class="processing-step"><span class="step-dot done"></span> Scored 8 matches by compatibility</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Costello activated — aggregating market data for Grey Lynn office sector</div>
                <div class="processing-step"><span class="step-dot done"></span> Pulled ownership records — Des Radonich Limited (33 Crummer Rd)</div>
                <div class="processing-step"><span class="step-dot done"></span> Analysed 142 Grey Lynn office transactions (2021-2026)</div>
                <div class="processing-step"><span class="step-dot done"></span> Cross-referenced RBNZ, Stats NZ, and realestate.co.nz data</div>
                <div class="processing-step"><span class="step-dot done"></span> Generated Bayleys Commercial Market Report</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Searched Bayleys clause library — 73.0 CPI Adjustment Formula</div>
                <div class="processing-step"><span class="step-dot done"></span> Cross-referenced ADLS 6th Edition rent review provisions</div>
                <div class="processing-step"><span class="step-dot done"></span> Analysed 1,240 commercial leases with CPI clauses</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Retrieved Bayleys Clause 62.0 — Conditional on Deed of Lease</div>
                <div class="processing-step"><span class="step-dot done"></span> Cross-referenced 847 conditional sale agreements</div>
                <div class="processing-step"><span class="step-dot done"></span> Checked relevant tribunal decisions</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Retrieved Bayleys Clause 56.0 — Verification of Floor Areas</div>
                <div class="processing-step"><span class="step-dot done"></span> Referenced BOMA/PCNZ Measurement Standard</div>
                <div class="processing-step"><span class="step-dot done"></span> Analysed 326 lease disputes involving floor area discrepancies</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Searched clause library — Retail lease provisions</div>
                <div class="processing-step"><span class="step-dot done"></span> Analysed 2,180 retail leases in Bayleys database</div>
                <div class="processing-step"><span class="step-dot done"></span> Referenced 89 retail lease tribunal decisions</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Searched 72,000 judicial decisions — lease assignment consent</div>
                <div class="processing-step"><span class="step-dot done"></span> Referenced Property Law Act 2007 s.226</div>
                <div class="processing-step"><span class="step-dot done"></span> Found 23 relevant tribunal decisions</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Referenced Property Law Act 2007 s.232 — Landlord obligations</div>
                <div class="processing-step"><span class="step-dot done"></span> Searched Tenancy Tribunal decisions — maintenance claims</div>
                <div class="processing-step"><span class="step-dot done"></span> Found 156 relevant commercial lease decisions</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Searched REA Complaints Assessment Committee decisions</div>
                <div class="processing-step"><span class="step-dot done"></span> Filtered for commercial agent disciplinary actions (2020-2026)</div>
                <div class="processing-step"><span class="step-dot done"></span> Found 38 relevant decisions</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Referenced ADLS 6th Edition — Second Schedule OPEX provisions</div>
                <div class="processing-step"><span class="step-dot done"></span> Searched tribunal decisions — OPEX capital vs operating disputes</div>
                <div class="processing-step"><span class="step-dot done"></span> Found 42 relevant cases</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Generating Strategy Cards for 4 Ponsonby properties</div>
                <div class="processing-step"><span class="step-dot done"></span> Queried CRM, LINZ, ICP, and NZBN data</div>
                <div class="processing-step"><span class="step-dot done"></span> Applied stickiness model and renewal predictions</div>
                <div class="processing-step"><span class="step-dot done"></span> Assigned to Zara for follow-up scheduling</div>
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
                <div class="processing-step"><span class="step-dot done"></span> Searched CRM, HR records, and NZBN</div>
                <div class="processing-step"><span class="step-dot done"></span> Cross-referenced 14 internal Slack channels</div>
                <div class="processing-step"><span class="step-dot done"></span> Consulted physics department (just in case)</div>
                <div class="processing-step"><span class="step-dot done"></span> Result: <em>inconclusive</em></div>
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
                <div class="processing-step"><span class="step-dot done"></span> Analysed query across database</div>
                <div class="processing-step"><span class="step-dot done"></span> Cross-referenced market data</div>
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

    // --- Chat: Document upload workflow ---
    const chatAttachBtn = document.getElementById('chatAttachBtn');
    const chatFileInput = document.getElementById('chatFileInput');

    chatAttachBtn?.addEventListener('click', () => chatFileInput?.click());

    chatFileInput?.addEventListener('change', () => {
        const file = chatFileInput.files[0];
        if (!file) return;

        // Remove welcome screen
        const welcome = chatMessages?.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        // Show user's file upload message
        const userMsg = document.createElement('div');
        userMsg.className = 'message message-user';
        userMsg.innerHTML = `
            <div class="message-bubble">
                <div class="chat-file-card">
                    <div class="chat-file-icon">PDF</div>
                    <div class="chat-file-info">
                        <div class="chat-file-name">${escapeHtml(file.name)}</div>
                        <div class="chat-file-meta">${(file.size / 1024).toFixed(0)} KB · Uploaded just now</div>
                    </div>
                    <div class="chat-file-check">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                </div>
                Analyse this document
            </div>
        `;
        chatMessages?.appendChild(userMsg);
        scrollChat();

        // Show thinking
        const thinking = document.createElement('div');
        thinking.className = 'message message-assistant';
        thinking.innerHTML = `
            <div class="message-avatar">W</div>
            <div class="message-bubble">
                <div class="thinking-indicator"><span></span><span></span><span></span></div>
            </div>
        `;
        chatMessages?.appendChild(thinking);
        scrollChat();

        // After "processing", show Walter's response with action chips
        setTimeout(() => {
            thinking.remove();

            const resp = document.createElement('div');
            resp.className = 'message message-assistant';
            resp.innerHTML = `
                <div class="message-avatar">W</div>
                <div class="message-bubble">
                    <div class="processing-steps">
                        <div class="processing-step"><span class="step-dot done"></span> Read ${file.name.includes('.pdf') ? 'PDF' : 'document'} — ${Math.floor(Math.random() * 30 + 15)} pages</div>
                        <div class="processing-step"><span class="step-dot done"></span> Extracted key terms and parties</div>
                        <div class="processing-step"><span class="step-dot done"></span> Identified document type: Lease Agreement</div>
                        <div class="processing-step"><span class="step-dot done"></span> Matched to property record in Vault RE</div>
                    </div>
                    <strong>I've read the document. What would you like me to do?</strong><br><br>
                    <div class="chat-action-chips">
                        <button class="chat-action-chip" data-chat-action="hot">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            Extract terms for a new Heads of Terms
                        </button>
                        <button class="chat-action-chip" data-chat-action="review">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                            Review for risks &amp; advisory
                        </button>
                        <button class="chat-action-chip" data-chat-action="file">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0018 0V5"/></svg>
                            File to property record via Brittany
                        </button>
                        <button class="chat-action-chip" data-chat-action="compare">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                            Compare to existing lease on file
                        </button>
                    </div>
                </div>
            `;
            chatMessages?.appendChild(resp);
            scrollChat();

            // Wire action chip clicks
            resp.querySelectorAll('.chat-action-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const action = chip.dataset.chatAction;
                    handleDocAction(action, file.name);
                });
            });
        }, 2400);

        // Reset input
        chatFileInput.value = '';
    });

    function handleDocAction(action, fileName) {
        // Show user's selection
        const labels = {
            hot: 'Extract terms for a new Heads of Terms',
            review: 'Review for risks & advisory',
            file: 'File to property record via Brittany',
            compare: 'Compare to existing lease on file'
        };

        const userMsg = document.createElement('div');
        userMsg.className = 'message message-user';
        userMsg.innerHTML = `<div class="message-bubble">${labels[action] || action}</div>`;
        chatMessages?.appendChild(userMsg);
        scrollChat();

        // Show thinking
        const thinking = document.createElement('div');
        thinking.className = 'message message-assistant';
        thinking.innerHTML = `
            <div class="message-avatar">W</div>
            <div class="message-bubble">
                <div class="thinking-indicator"><span></span><span></span><span></span></div>
            </div>
        `;
        chatMessages?.appendChild(thinking);
        scrollChat();

        setTimeout(() => {
            thinking.remove();

            let responseHtml = '';

            if (action === 'hot') {
                responseHtml = `
                    <div class="processing-steps">
                        <div class="processing-step"><span class="step-dot done"></span> Extracted 14 key lease terms</div>
                        <div class="processing-step"><span class="step-dot done"></span> Identified landlord, tenant, and guarantor</div>
                        <div class="processing-step"><span class="step-dot done"></span> Mapped rent, reviews, outgoings, and term structure</div>
                        <div class="processing-step"><span class="step-dot done"></span> Pre-populated a draft Heads of Terms</div>
                    </div>
                    <strong>Done — I've drafted a Heads of Terms from this lease.</strong><br><br>
                    Here's what I extracted:<br><br>
                    <strong>Landlord:</strong> Cuilam Industry Limited<br>
                    <strong>Tenant:</strong> Bluwave Galumoana Ltd<br>
                    <strong>Premises:</strong> Tenancy C, Level 2 — 278.82 sqm<br>
                    <strong>Term:</strong> 6 years with 2×2 year renewals<br>
                    <strong>Rent:</strong> $90,217.80 + GST ($290/sqm)<br>
                    <strong>Review:</strong> 3% fixed annually, market on renewal<br>
                    <strong>Outgoings:</strong> 5.6% proportionate share ($31,693.47)<br><br>
                    All fields have been pre-populated in a new Heads of Terms. You can review and edit before sending to both parties.<br><br>
                    <a class="chat-link-card" onclick="document.querySelector('.nav-item[data-view=\\'properties\\']')?.click(); setTimeout(() => { const btns = document.querySelectorAll('.prop-action-btn'); btns[0]?.click(); setTimeout(() => document.querySelectorAll('.prop-action-menu')[0]?.querySelector('button[data-pd=\\'hot\\']')?.click(), 200); }, 200);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Open Heads of Terms →
                    </a>
                `;
            } else if (action === 'review') {
                responseHtml = `
                    <div class="processing-steps">
                        <div class="processing-step"><span class="step-dot done"></span> Analysed against 14,200+ NZ lease precedents</div>
                        <div class="processing-step"><span class="step-dot done"></span> Identified 3 review items and 1 alert</div>
                    </div>
                    <strong>Walter Advisory — 4 items flagged</strong><br><br>
                    <strong style="color:var(--orange);">⬤ Review:</strong> CPI at 3% fixed exceeds RBNZ forecast of 2.1-2.4%<br>
                    <strong style="color:var(--orange);">⬤ Review:</strong> 6-year initial term is unusual — consider 5+2 structure<br>
                    <strong style="color:var(--red);">⬤ Alert:</strong> OPEX includes structural fencing (#7) and repaving (#10) — landlord liability under standard practice<br>
                    <strong style="color:var(--green);">⬤ Good:</strong> $290/sqm is within market range ($265-$310)<br><br>
                    For the full clause-by-clause review with a shareable client report:<br><br>
                    <a class="chat-link-card" onclick="switchView('documents'); setTimeout(() => document.querySelector('[data-result=\\'docResultReview\\']')?.click(), 200);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                        Open full Advisory review →
                    </a>
                `;
            } else if (action === 'file') {
                responseHtml = `
                    <div class="processing-steps">
                        <div class="processing-step"><span class="step-dot done"></span> Matched to: 15 Osterley Way, Manukau</div>
                        <div class="processing-step"><span class="step-dot done"></span> Tagged as: Lease Agreement (ADLS 6th Ed.)</div>
                        <div class="processing-step"><span class="step-dot done"></span> Filed to Vault RE property record</div>
                        <div class="processing-step"><span class="step-dot done"></span> Added to property timeline</div>
                    </div>
                    <strong>Filed by Brittany</strong> — the document has been automatically:<br><br>
                    ✓ Stored against the property record for <strong>15 Osterley Way</strong><br>
                    ✓ Tagged as "Lease Agreement" in Vault RE<br>
                    ✓ Added to the property's activity timeline<br>
                    ✓ Available for future reference by all AI agents<br><br>
                    <span style="font-size:12px;color:var(--text-tertiary);">Zero manual data entry required.</span>
                `;
            } else if (action === 'compare') {
                responseHtml = `
                    <div class="processing-steps">
                        <div class="processing-step"><span class="step-dot done"></span> Found existing lease on file: 15 Osterley Way (2022)</div>
                        <div class="processing-step"><span class="step-dot done"></span> Compared 12 key terms side-by-side</div>
                    </div>
                    <strong>Comparison: New terms vs. Existing lease</strong><br><br>
                    <strong>Rent:</strong> $90,217 → <span style="color:#047857;">same</span><br>
                    <strong>Term:</strong> 3+3 → <span style="color:var(--blue);">6 years (longer)</span><br>
                    <strong>Review:</strong> CPI → <span style="color:var(--orange);">3% fixed (higher)</span><br>
                    <strong>Outgoings:</strong> $28,400 → <span style="color:var(--orange);">$31,693 (+11.6%)</span><br>
                    <strong>Bond:</strong> 2 months → <span style="color:var(--blue);">3 months (increased)</span><br><br>
                    For a full comparison report you can share with the client:<br><br>
                    <a class="chat-link-card" onclick="switchView('documents'); setTimeout(() => document.querySelector('[data-result=\\'docResultCompare\\']')?.click(), 200);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/></svg>
                        Open full comparison →
                    </a>
                `;
            }

            const resp = document.createElement('div');
            resp.className = 'message message-assistant';
            resp.innerHTML = `
                <div class="message-avatar">W</div>
                <div class="message-bubble">${responseHtml}</div>
            `;
            chatMessages?.appendChild(resp);
            scrollChat();
        }, 2200);
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
                openPropDrill(addr || 'Property', 'history');
                mapPopup?.classList.remove('active');
            });
        }
    });

    // "Generate Strategy Card" in property modal
    document.getElementById('pdStrategyBtn')?.addEventListener('click', () => {
        propertyModal.classList.remove('active');
        strategyModal.classList.add('active');
    });

    // Ask Walter from property card — opens Walter popout alongside
    document.getElementById('pdAskWalter')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const addr = document.querySelector('#propDrillModal .pd-hero-content h2')?.textContent ||
                     document.querySelector('#propDrillModal #pdAddress')?.textContent || 'this property';
        // Open Walter FAB popout
        const popout = document.getElementById('walterPopout');
        const fab = document.getElementById('walterFab');
        if (popout && !popout.classList.contains('open')) {
            popout.classList.add('open');
            fab?.classList.add('popout-open');
        }
        // Pre-fill the popout input with property context
        const popInput = document.getElementById('walterPopoutInput');
        if (popInput) {
            popInput.value = 'Tell me about ' + addr;
            popInput.focus();
        }
    });

    // Add to My Properties from property card
    document.getElementById('pdAddProperty')?.addEventListener('click', function() {
        const addr = document.querySelector('#propDrillModal .pd-hero-content h2')?.textContent ||
                     document.querySelector('#propDrillModal #pdAddress')?.textContent || 'Property';
        const type = document.querySelector('#propDrillModal .pd-hero-chip')?.textContent?.trim()?.split('·')[0]?.trim() || 'Office';
        const tenant = document.querySelector('#propDrillModal .pd-ov-person-card:last-child .pd-ov-person-name')?.textContent || '—';

        // Add row to My Properties table
        const tbody = document.querySelector('#view-properties .properties-table tbody');
        if (tbody) {
            const tr = document.createElement('tr');
            tr.className = 'clickable-row';
            tr.innerHTML = `
                <td><span class="cell-primary">${addr}</span><span class="prop-deal-dot"><span class="prop-deal-indicator deal-new"></span><span class="prop-deal-tooltip">New</span></span></td>
                <td><span class="type-badge badge-${type.toLowerCase()}">${type}</span></td>
                <td>${tenant}</td>
                <td>—</td><td>—</td><td>—</td>
                <td><div class="pipeline-bar"><div class="pipeline-fill" style="width:0%"></div></div></td>
            `;
            tbody.prepend(tr);
            tr.addEventListener('click', () => openPropDrill(tr));
        }

        // Visual feedback
        this.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Added';
        this.disabled = true;
        this.style.background = '#059669';
        this.style.color = 'white';
        this.style.borderColor = '#059669';

        // Reset after 3s
        setTimeout(() => {
            this.innerHTML = 'Add to My Properties';
            this.disabled = false;
            this.style.background = '';
            this.style.color = '';
            this.style.borderColor = '';
        }, 3000);
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

    // --- Leaflet Map + Property Data ---
    const propertyData = {
        shortland: {
            img: 'sv-88-shortland.png', title: '88 Shortland Street, CBD', status: 'Office to Lease', statusColor: 'blue',
            details: [{l:'Area',v:'1,200 sqm'},{l:'$/sqm',v:'$435'},{l:'Listed',v:'14 days'},{l:'Grade',v:'A'}],
            tenant: { label: 'Predicted tenant:', text: 'TechFlow Ltd — ICP active Nov 2025' },
            lat: -36.8468, lng: 174.7692, type: 'office', count: '3'
        },
        queen: {
            img: 'sv-45-queen.png', title: '45 Queen Street, CBD', status: 'Retail to Lease', statusColor: 'purple',
            details: [{l:'Area',v:'420 sqm'},{l:'$/sqm',v:'$490'},{l:'Listed',v:'45 days'},{l:'Grade',v:'B+'}],
            tenant: { label: 'Current tenant:', text: 'Pacific Traders Ltd — Annual return overdue' },
            lat: -36.8485, lng: 174.7643, type: 'retail'
        },
        freemans: {
            img: 'sv-24-beaumont.png', title: '24-28 Beaumont Street, Freemans Bay', status: 'Expansion Opportunity', statusColor: 'blue',
            details: [{l:'Area',v:'480 sqm'},{l:'$/sqm',v:'$395'},{l:'Expiry',v:'Nov 2026'},{l:'Stickiness',v:'92%'}],
            tenant: { label: 'Tenant expanding:', text: 'Lumiere Design Group — 6 active Seek listings, $450k fit-out' },
            lat: -36.8440, lng: 174.7545, type: 'office', count: '2'
        },
        nelson: {
            img: 'sv-12-nelson.png', title: '12 Nelson Street, CBD', status: 'New Signal Detected', statusColor: 'orange',
            details: [{l:'Area',v:'180 sqm'},{l:'$/sqm',v:'—'},{l:'ICP',v:'Active'},{l:'Since',v:'Mar 2026'}],
            tenant: { label: 'Signal intelligence:', text: 'New ICP activation detected. NZBN lookup: TASK Group Ltd — IT services' },
            lat: -36.8445, lng: 174.7620, type: 'signal'
        },
        dalgety: {
            img: 'sv-47-dalgety.png', title: '47 Dalgety Drive, Wiri', status: 'Industrial to Lease', statusColor: 'green',
            details: [{l:'Area',v:'3,600 sqm'},{l:'$/sqm',v:'$182'},{l:'Listed',v:'8 days'},{l:'Yard',v:'Yes'}],
            tenant: { label: 'Current tenant:', text: 'Shaw NZ Limited — Lease expires Nov 2027' },
            lat: -36.9860, lng: 174.8560, type: 'industrial'
        },
        ponsonby: {
            img: 'sv-24-beaumont.png', title: 'Ponsonby Road, Ponsonby', status: 'Retail Cluster', statusColor: 'purple',
            details: [{l:'Properties',v:'5'},{l:'Avg $/sqm',v:'$480'},{l:'Expiring',v:'3'},{l:'Vacancy',v:'6%'}],
            tenant: { label: 'Cluster insight:', text: '3 leases expiring within 12 months. Mixed retail — cafes, boutiques, services.' },
            lat: -36.8405, lng: 174.7465, type: 'retail', count: '5'
        },
        newmarket: {
            img: 'sv-88-shortland.png', title: 'Newmarket Commercial', status: 'Office & Retail Hub', statusColor: 'blue',
            details: [{l:'Properties',v:'9+'},{l:'Avg $/sqm',v:'$410'},{l:'Expiring',v:'4'},{l:'Vacancy',v:'5%'}],
            tenant: { label: 'Area insight:', text: 'Strong demand. 4 renewal opportunities in next 18 months.' },
            lat: -36.8690, lng: 174.7780, type: 'office', count: '9+'
        },
        parnell: {
            img: 'parnell-01.jpg', title: 'Parnell Commercial', status: 'Retail & Office', statusColor: 'purple',
            details: [{l:'Properties',v:'3'},{l:'Avg $/sqm',v:'$450'},{l:'Expiring',v:'2'},{l:'Vacancy',v:'4%'}],
            tenant: { label: 'Area insight:', text: 'Premium retail strip with low vacancy and strong tenant demand.' },
            lat: -36.8530, lng: 174.7820, type: 'retail', count: '3'
        },
        mteden: {
            img: 'sv-88-shortland.png', title: 'Mt Eden Commercial', status: 'Office', statusColor: 'blue',
            details: [{l:'Area',v:'350 sqm'},{l:'$/sqm',v:'$340'},{l:'Grade',v:'B'},{l:'Vacancy',v:'8%'}],
            tenant: { label: 'Area insight:', text: 'Suburban office hub with improving transport links.' },
            lat: -36.8730, lng: 174.7570, type: 'office'
        },
        penrose: {
            img: 'sv-47-dalgety.png', title: 'Penrose Industrial', status: 'Industrial Hub', statusColor: 'green',
            details: [{l:'Properties',v:'12'},{l:'Avg $/sqm',v:'$175'},{l:'Vacancy',v:'3%'},{l:'Yield',v:'5.8%'}],
            tenant: { label: 'Area insight:', text: 'Tightly held industrial zone. Strong demand for sub-1000sqm units.' },
            lat: -36.9050, lng: 174.8100, type: 'industrial'
        },
        tamaki: {
            img: 'sv-47-dalgety.png', title: 'East Tamaki Industrial', status: 'Industrial Zone', statusColor: 'green',
            details: [{l:'Properties',v:'7'},{l:'Avg $/sqm',v:'$155'},{l:'Vacancy',v:'5%'},{l:'Yield',v:'6.2%'}],
            tenant: { label: 'Area insight:', text: 'Largest industrial precinct. 7 active listings, 2 new signals.' },
            lat: -36.9320, lng: 174.8780, type: 'industrial', count: '7'
        },
        greylynn: {
            img: 'sv-24-beaumont.png', title: '33 Crummer Road, Grey Lynn', status: 'Office', statusColor: 'blue',
            details: [{l:'Area',v:'280 sqm'},{l:'$/sqm',v:'$380'},{l:'Expiry',v:'Mar 2027'},{l:'Stickiness',v:'75%'}],
            tenant: { label: 'Tenant:', text: 'Creative agency — stable, approaching renewal.' },
            lat: -36.8580, lng: 174.7370, type: 'office'
        },
        // Additional scattered pins for density
        epsom: {
            img: 'sv-88-shortland.png', title: '15 Manukau Road, Epsom', status: 'Office', statusColor: 'blue',
            details: [{l:'Area',v:'220 sqm'},{l:'$/sqm',v:'$310'},{l:'Grade',v:'B'},{l:'Vacancy',v:'—'}],
            tenant: { label: 'Tenant:', text: 'Accountancy firm — long-term stable.' },
            lat: -36.8850, lng: 174.7710, type: 'office'
        },
        grafton: {
            img: 'sv-88-shortland.png', title: '8 Park Road, Grafton', status: 'Medical Office', statusColor: 'blue',
            details: [{l:'Area',v:'380 sqm'},{l:'$/sqm',v:'$420'},{l:'Grade',v:'A-'},{l:'Vacancy',v:'0%'}],
            tenant: { label: 'Tenant:', text: 'Specialist medical group — 12yr lease.' },
            lat: -36.8600, lng: 174.7700, type: 'office'
        },
        kingsland: {
            img: 'sv-24-beaumont.png', title: '461 New North Road, Kingsland', status: 'Retail', statusColor: 'purple',
            details: [{l:'Area',v:'140 sqm'},{l:'$/sqm',v:'$380'},{l:'Listed',v:'22 days'},{l:'Grade',v:'B'}],
            tenant: { label: 'Signal:', text: 'New café fitout underway — potential ICP.' },
            lat: -36.8680, lng: 174.7450, type: 'signal'
        },
        onehunga: {
            img: 'sv-47-dalgety.png', title: '81 Mays Road, Onehunga', status: 'Industrial', statusColor: 'green',
            details: [{l:'Area',v:'476 sqm'},{l:'$/sqm',v:'$177'},{l:'Lease',v:'5+3 yrs'},{l:'Stickiness',v:'95%'}],
            tenant: { label: 'Tenant:', text: 'DB International Trading Ltd — stable, expansion likely.' },
            lat: -36.9170, lng: 174.7850, type: 'industrial'
        },
        ellerslie: {
            img: 'sv-88-shortland.png', title: '195 Main Highway, Ellerslie', status: 'Office', statusColor: 'blue',
            details: [{l:'Area',v:'310 sqm'},{l:'$/sqm',v:'$295'},{l:'Grade',v:'B+'},{l:'Vacancy',v:'—'}],
            tenant: { label: 'Tenant:', text: 'Latitude Homes Ltd — approaching renewal.' },
            lat: -36.8960, lng: 174.8030, type: 'office'
        },
        ptchev: {
            img: 'sv-24-beaumont.png', title: '1179 Great North Road, Pt Chevalier', status: 'Retail', statusColor: 'purple',
            details: [{l:'Area',v:'94 sqm'},{l:'$/sqm',v:'$480'},{l:'Listed',v:'30 days'},{l:'Grade',v:'B'}],
            tenant: { label: 'Tenant:', text: 'Good Dog Holdings Ltd — new lease.' },
            lat: -36.8680, lng: 174.7270, type: 'retail'
        },
        howick: {
            img: 'sv-24-beaumont.png', title: '180 Moore Street, Howick', status: 'Retail', statusColor: 'purple',
            details: [{l:'Area',v:'568 sqm'},{l:'$/sqm',v:'$465'},{l:'Expiry',v:'Oct 2027'},{l:'Status',v:'Stable'}],
            tenant: { label: 'Tenant:', text: 'Pandher Enterprises Ltd — suburban retail.' },
            lat: -36.8990, lng: 174.9280, type: 'retail'
        },
        albany: {
            img: 'sv-88-shortland.png', title: '22 Corinthian Drive, Albany', status: 'Office', statusColor: 'blue',
            details: [{l:'Area',v:'740 sqm'},{l:'$/sqm',v:'$320'},{l:'Grade',v:'A'},{l:'Vacancy',v:'12%'}],
            tenant: { label: 'Signal:', text: 'New coworking operator scouting North Shore.' },
            lat: -36.7270, lng: 174.7060, type: 'signal'
        },
        milford: {
            img: 'sv-88-shortland.png', title: '145 Kitchener Road, Milford', status: 'Office', statusColor: 'blue',
            details: [{l:'Area',v:'170 sqm'},{l:'$/sqm',v:'$361'},{l:'Expiry',v:'Oct 2027'},{l:'Status',v:'Stable'}],
            tenant: { label: 'Tenant:', text: 'Enhance Physiotherapy Ltd — long-term.' },
            lat: -36.7680, lng: 174.7680, type: 'office'
        },
        flatbush: {
            img: 'sv-24-beaumont.png', title: 'K117 Ormiston Town Centre, Flat Bush', status: 'Retail', statusColor: 'purple',
            details: [{l:'Area',v:'100 sqm'},{l:'$/sqm',v:'$457'},{l:'Expiry',v:'Jan 2026'},{l:'Status',v:'Expiring'}],
            tenant: { label: 'Tenant:', text: 'Asaving Limited — renewal under review.' },
            lat: -36.9590, lng: 174.9080, type: 'retail'
        }
    };

    let activePropertyData = null;
    let walterMap = null;
    let walterMarkers = {};

    function initLeafletMap() {
        const mapEl = document.getElementById('leafletMap');
        if (!mapEl || walterMap) return;

        walterMap = L.map('leafletMap', {
            center: [-36.865, 174.775],
            zoom: 12,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(walterMap);

        // Add zoom control to top-right
        L.control.zoom({ position: 'topright' }).addTo(walterMap);

        // Add attribution to bottom-left
        L.control.attribution({ position: 'bottomleft', prefix: '' })
            .addAttribution('&copy; <a href="https://carto.com/">CARTO</a>')
            .addTo(walterMap);

        // Add markers
        const pinColors = { office: '#3b82f6', retail: '#8b5cf6', industrial: '#10b981', signal: '#f59e0b' };

        Object.entries(propertyData).forEach(([key, data]) => {
            if (!data.lat || !data.lng) return;
            const color = pinColors[data.type] || '#3b82f6';
            const countHtml = data.count ? `<span class="walter-pin-count">${data.count}</span>` : '';
            const icon = L.divIcon({
                className: 'walter-marker',
                html: `<div class="walter-pin pin-${data.type}">${countHtml}</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -14]
            });

            const marker = L.marker([data.lat, data.lng], { icon }).addTo(walterMap);

            const statusBg = { blue: '#dbeafe', purple: '#ede9fe', green: '#d1fae5', orange: '#fef3c7' };
            const statusFg = { blue: '#1d4ed8', purple: '#6d28d9', green: '#047857', orange: '#b45309' };

            const popupContent = `
                <img class="walter-popup-img" src="${data.img}" alt="" onerror="this.style.display='none'">
                <div class="walter-popup-body">
                    <div class="walter-popup-title">${data.title}</div>
                    <span class="walter-popup-status" style="background:${statusBg[data.statusColor]||'#dbeafe'};color:${statusFg[data.statusColor]||'#1d4ed8'}">${data.status}</span>
                    <div class="walter-popup-details">
                        ${data.details.map(d => `<strong>${d.l}:</strong> ${d.v}&nbsp;&nbsp;`).join('')}
                    </div>
                    <div class="walter-popup-tenant">${data.tenant.label} ${data.tenant.text}</div>
                    <div class="walter-popup-actions">
                        <button class="walter-popup-btn primary" onclick="document.getElementById('strategyModal')?.classList.add('active')">Strategy Card</button>
                        <button class="walter-popup-btn" onclick="openPropertyDetail()">Full details</button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, { maxWidth: 320, minWidth: 300, closeButton: true, className: 'walter-leaflet-popup' });

            marker.on('click', () => { activePropertyData = data; });

            walterMarkers[key] = marker;
        });

        // Two-way map ↔ signals sidebar link
        walterMap.on('popupopen', (e) => {
            document.querySelectorAll('.feed-item').forEach(fi => fi.classList.remove('feed-active'));
            Object.entries(walterMarkers).forEach(([k, m]) => {
                if (m.getPopup() === e.popup) {
                    const fi = document.querySelector(`.feed-item[data-pin="${k}"]`);
                    if (fi) {
                        fi.classList.add('feed-active');
                        fi.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                    // Auto-switch to signals tab
                    document.querySelectorAll('.intel-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.intel-content').forEach(c => c.classList.remove('active'));
                    document.querySelector('.intel-tab[data-tab="signals"]')?.classList.add('active');
                    document.querySelector('.intel-content[data-content="signals"]')?.classList.add('active');
                }
            });
        });
        walterMap.on('popupclose', () => {
            document.querySelectorAll('.feed-item').forEach(fi => fi.classList.remove('feed-active'));
        });
    }

    // Update property modal dynamically based on active property
    window.openPropertyDetail = function() {
        const data = activePropertyData;
        if (!data) return;
        const modal = document.getElementById('propertyModal');
        if (!modal) return;
        const heroImg = modal.querySelector('.pd-hero-img');
        const heroH2 = modal.querySelector('.pd-hero-info h2');
        if (heroImg) heroImg.src = data.img;
        if (heroH2) heroH2.textContent = data.title;
        modal.classList.add('active');
    };

    // Initialize map when Market page becomes visible
    const marketObserver = new MutationObserver(() => {
        const marketView = document.getElementById('view-market');
        if (marketView?.classList.contains('active')) {
            setTimeout(() => {
                initLeafletMap();
                if (walterMap) walterMap.invalidateSize();
            }, 100);
        }
    });
    const marketView = document.getElementById('view-market');
    if (marketView) marketObserver.observe(marketView, { attributes: true, attributeFilter: ['class'] });

    // Signals feed items trigger marker popup
    document.querySelectorAll('.feed-item[data-pin]').forEach(item => {
        item.addEventListener('click', () => {
            const pinId = item.dataset.pin;
            const marker = walterMarkers[pinId];
            if (marker && walterMap) {
                walterMap.setView(marker.getLatLng(), 14, { animate: true });
                marker.openPopup();
                activePropertyData = propertyData[pinId];
            }
        });
    });

    // --- Market Page Filters ---
    function applyMarketFilters() {
        const region = document.getElementById('filterRegion')?.value || 'auckland';
        const type = document.getElementById('filterType')?.value || 'all';
        const status = document.getElementById('filterStatus')?.value || 'all';
        const source = document.getElementById('filterSource')?.value || 'all';

        let visible = 0;
        const total = Object.keys(propertyData).length;

        // Status → type mapping for prototype
        const statusTypeMap = {
            'listings': ['office', 'retail', 'industrial'],
            'expiring': ['office', 'retail'],
            'occupied': ['industrial', 'office']
        };
        // Source → type mapping for prototype
        const sourceTypeMap = {
            'realestate': ['office', 'retail', 'industrial'],
            'bayleys': ['office', 'retail'],
            'icp': ['signal']
        };

        Object.entries(walterMarkers).forEach(([key, marker]) => {
            const data = propertyData[key];
            if (!data) return;

            let show = true;

            // Region filter
            if (region !== 'auckland' && region !== 'all') show = false;

            // Type filter
            if (type !== 'all' && data.type !== type) show = false;

            // Status filter
            if (status !== 'all') {
                const allowed = statusTypeMap[status] || [];
                if (!allowed.includes(data.type)) show = false;
            }

            // Source filter
            if (source !== 'all') {
                const allowed = sourceTypeMap[source] || [];
                if (!allowed.includes(data.type)) show = false;
            }

            if (show) {
                marker.addTo(walterMap);
                visible++;
            } else {
                walterMap.removeLayer(marker);
            }
        });

        // Update count
        const countEl = document.querySelector('.result-count');
        const totalPool = { auckland: 7561, wellington: 2340, christchurch: 1820, all: 11721 };
        const pool = totalPool[region] || 7561;
        if (countEl) countEl.textContent = `${visible} of ${pool.toLocaleString()} properties`;
    }

    ['filterRegion', 'filterType', 'filterStatus', 'filterSource'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', applyMarketFilters);
    });

    // --- Wallace Match Strategy Cards ---
    const WALLACE_MATCH_DATA = {
        'harbour-carlisle': {
            type: 'investment',
            score: 96,
            title: 'Harbour Capital → 170-174 Carlisle Rd',
            subtitle: 'Investment buyer matched to North Shore retail investment',
            leftLabel: 'Investment Buyer',
            left: {
                name: 'Harbour Capital Ltd',
                type: 'Private investment fund · Auckland',
                rows: [
                    ['Investment focus', 'Retail & mixed-use'],
                    ['Budget range', '$3.0M – $5.5M'],
                    ['Target yield', '5.5% – 6.5%'],
                    ['Preferred locations', 'North Shore, CBD fringe'],
                    ['Decision maker', 'James Chen, Director'],
                    ['Source', 'Bayleys CRM · Active buyer']
                ]
            },
            right: {
                name: '170-174 Carlisle Road, North Shore',
                type: 'Retail investment · For Sale',
                rows: [
                    ['Floor area', '1,050 sqm'],
                    ['Annual income', '$509k p.a.'],
                    ['Net yield', '6.1%'],
                    ['WALE', '4.8 years'],
                    ['Tenants', 'Magic Garden ECE (15yr lease)'],
                    ['Asking price', '$3.8M – $4.2M']
                ]
            },
            compat: [
                { label: 'Yield', status: 'pass' },
                { label: 'Location', status: 'pass' },
                { label: 'Tenant quality', status: 'pass' },
                { label: 'Price range', status: 'pass' },
                { label: 'Sector fit', status: 'pass' }
            ],
            rec: {
                title: 'Draft introduction email to James Chen',
                body: 'This is a strong match across all five criteria. The 6.1% yield exceeds Harbour Capital\'s minimum, the North Shore location is preferred, and the 15-year ECE lease provides the income security they require.',
                script: '"Hi James — I have a retail investment at 170-174 Carlisle Road that closely matches your brief. It\'s returning 6.1% on a 15-year lease to Magic Garden ECE, asking $3.8M–$4.2M. Would you like me to send through the investment summary?"'
            },
            actions: [
                { label: 'Send Introduction', primary: true },
                { label: 'Schedule Call', primary: false },
                { label: 'View Property', primary: false }
            ]
        },
        'techflow-shortland': {
            type: 'tenant',
            score: 89,
            title: 'TechFlow Ltd → 88 Shortland St',
            subtitle: 'Office tenant matched to CBD Grade A space',
            leftLabel: 'Prospective Tenant',
            left: {
                name: 'TechFlow Ltd',
                type: 'SaaS / Technology · Auckland CBD',
                rows: [
                    ['Industry', 'Technology / SaaS'],
                    ['Headcount', '45 (growing +30% YoY)'],
                    ['Space need', '400 – 600 sqm'],
                    ['Budget', '$380 – $450/sqm'],
                    ['ICP status', 'Active since Nov 2025'],
                    ['Decision maker', 'Sarah Park, COO']
                ]
            },
            right: {
                name: '88 Shortland Street, CBD',
                type: 'Office · Grade A · For Lease',
                rows: [
                    ['Floor area', '1,200 sqm (partitionable)'],
                    ['Asking rent', '$435/sqm + OPEX'],
                    ['Grade', 'A — recently refurbished'],
                    ['Fit-out', 'Open plan, modern amenities'],
                    ['Available', 'Immediate'],
                    ['Parking', '8 spaces available']
                ]
            },
            compat: [
                { label: 'Size match', status: 'pass' },
                { label: 'Budget fit', status: 'partial' },
                { label: 'Location', status: 'pass' },
                { label: 'Grade/amenities', status: 'pass' },
                { label: 'Growth capacity', status: 'pass' }
            ],
            rec: {
                title: 'Arrange a viewing for Sarah Park',
                body: 'TechFlow\'s ICP has been active for 5 months and their hiring growth suggests they\'ll outgrow their current space within 6 months. The 1,200sqm floor at 88 Shortland can be partitioned to 500sqm initially with expansion options — ideal for their trajectory.',
                script: '"Hi Sarah — I noticed TechFlow is growing rapidly and wanted to introduce a Grade A office at 88 Shortland Street. It\'s 1,200sqm with flexible partitioning, recently refurbished, at $435/sqm. I think it could suit your team\'s growth plans — would a viewing next week work?"'
            },
            actions: [
                { label: 'Send Space Profile', primary: true },
                { label: 'Arrange Viewing', primary: false },
                { label: 'View Listing', primary: false }
            ]
        },
        'meridian-parnell': {
            type: 'expansion',
            score: 84,
            title: 'Meridian Creative → 135 Parnell Rd',
            subtitle: 'Existing tenant showing expansion signals, matched to adjacent space',
            leftLabel: 'Expanding Tenant',
            left: {
                name: 'Meridian Creative Ltd',
                type: 'Design studio · Parnell',
                rows: [
                    ['Current lease', '85 Parnell Rd (180 sqm)'],
                    ['Lease expiry', 'May 2027'],
                    ['Stickiness', '91%'],
                    ['Seek listings', '6 active roles'],
                    ['Revenue signal', '+40% YoY (Companies Office)'],
                    ['Decision maker', 'Tom & Lisa Mercer, Directors']
                ]
            },
            right: {
                name: '135 Parnell Road, Parnell',
                type: 'Office · Character · For Lease',
                rows: [
                    ['Floor area', '320 sqm'],
                    ['Asking rent', '$395/sqm + OPEX'],
                    ['Character', 'Heritage conversion, exposed brick'],
                    ['Fit-out', 'Creative-ready, high stud'],
                    ['Available', 'From March 2027'],
                    ['Parking', '4 on-site']
                ]
            },
            compat: [
                { label: 'Growth signals', status: 'pass' },
                { label: 'Location match', status: 'pass' },
                { label: 'Space type', status: 'pass' },
                { label: 'Timing', status: 'pass' },
                { label: 'Budget estimate', status: 'partial' }
            ],
            rec: {
                title: 'Present relocation options to Tom & Lisa Mercer',
                body: 'Meridian Creative is showing strong expansion signals — 6 active Seek listings and 40% revenue growth. Their current 180sqm space at 85 Parnell Rd will be outgrown within 12 months. 135 Parnell Rd offers nearly double the space in a character building that matches their brand identity.',
                script: '"Hi Tom — congratulations on Meridian\'s growth this year. I wanted to flag 135 Parnell Road, which is coming available around the time your lease at 85 Parnell is up for renewal. It\'s a heritage conversion with 320sqm — nearly double your current space, and still in the Parnell creative precinct. Worth a look?"'
            },
            actions: [
                { label: 'Send Options Brief', primary: true },
                { label: 'Schedule Meeting', primary: false },
                { label: 'View Property', primary: false }
            ]
        }
    };

    function openWallaceMatch(matchId) {
        const data = WALLACE_MATCH_DATA[matchId];
        if (!data) return;

        document.getElementById('wmTitle').textContent = data.title;
        document.getElementById('wmSubtitle').textContent = data.subtitle;
        document.getElementById('wmScore').textContent = data.score + '%';
        document.getElementById('wmLeftLabel').textContent = data.leftLabel;

        // Left card (prospect)
        document.getElementById('wmLeftCard').innerHTML = `
            <div class="wm-card-name">${data.left.name}</div>
            <div class="wm-card-type">${data.left.type}</div>
            ${data.left.rows.map(r => `<div class="wm-card-row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}
        `;

        // Right card (property)
        document.getElementById('wmRightCard').innerHTML = `
            <div class="wm-card-name">${data.right.name}</div>
            <div class="wm-card-type">${data.right.type}</div>
            ${data.right.rows.map(r => `<div class="wm-card-row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}
        `;

        // Compatibility
        const compatEl = document.getElementById('wmCompatItems');
        compatEl.innerHTML = data.compat.map(c => {
            return `<span class="wm-compat-item ${c.status}"><span class="wm-compat-dot"></span>${c.label}</span>`;
        }).join('');

        // Recommendation
        document.getElementById('wmRecommendation').innerHTML = `
            <div class="wm-rec-label">
                <span class="agent-pip wallace" style="width:18px;height:18px;font-size:8px">W</span>
                Wallace Recommendation
            </div>
            <div class="wm-rec-title">${data.rec.title}</div>
            <div class="wm-rec-body">${data.rec.body}</div>
            <div class="wm-rec-script">${data.rec.script}</div>
        `;

        // Actions
        document.getElementById('wmActions').innerHTML = data.actions.map(a =>
            `<button class="wm-action-btn${a.primary ? ' primary' : ''}">${a.label}</button>`
        ).join('');

        // Bind action button feedback
        document.querySelectorAll('#wmActions .wm-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('primary')) {
                    // Navigate to Command Compose with pre-filled data from the match
                    document.getElementById('wallaceMatchModal')?.classList.remove('active');
                    const composeData = {
                        to: data.left.rows.find(r => r[0] === 'Decision maker')?.[1]?.split(',')[0] || '',
                        subject: data.title,
                        property: data.right.name,
                        body: data.rec.script.replace(/^"|"$/g, '').replace(/\\'/g, "'")
                    };
                    openCmdCompose(composeData);
                } else {
                    this.textContent = 'Done';
                    this.style.background = 'var(--bg-secondary)';
                    this.disabled = true;
                }
            });
        });

        document.getElementById('wallaceMatchModal')?.classList.add('active');
    }

    // Helper: open Command compose with pre-filled data
    function openCmdCompose(data) {
        switchView('command');
        setTimeout(() => {
            showCmdPanel('cmdComposeView');
            if (data.to) document.getElementById('cmdComposeTo').value = data.to;
            if (data.subject) document.getElementById('cmdComposeSubject').value = data.subject;
            if (data.body) document.getElementById('cmdComposeBody').value = data.body;
            if (data.property) {
                const sel = document.getElementById('cmdComposeProperty');
                // Try to match an option
                for (let opt of sel.options) {
                    if (opt.text.includes(data.property.split(',')[0])) { sel.value = opt.value; break; }
                }
            }
        }, 300);
    }

    // Close handler
    document.getElementById('wallaceMatchClose')?.addEventListener('click', () => {
        document.getElementById('wallaceMatchModal')?.classList.remove('active');
    });
    document.getElementById('wallaceMatchModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'wallaceMatchModal') e.target.classList.remove('active');
    });

    // Wire Review buttons
    document.querySelectorAll('.wallace-match-action[data-wmatch]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openWallaceMatch(btn.dataset.wmatch);
        });
    });

    // --- Command Centre ---
    const CMD_EMAILS = [
        { id: 'e1', from: 'Sophie Chen', fromOrg: 'Lumiere Design', email: 's.chen@lumiere.co.nz', subject: 'RE: Lease renewal discussion — 24 Beaumont St', preview: 'Hi Will, thanks for the call yesterday. We\'d like to explore the expansion option you mentioned...', property: '24 Beaumont St', category: 'client', time: '9:42 AM', unread: true,
          body: 'Hi Will,<br><br>Thanks for the call yesterday. We\'d like to explore the expansion option you mentioned — taking the ground floor as well as our existing first floor tenancy.<br><br>Could you send through the updated terms for the combined space? We\'re particularly interested in understanding the $/sqm impact and whether Des would consider a longer initial term (8 years) in exchange for a rent reduction.<br><br>Happy to meet this week if that helps move things along.<br><br>Kind regards,<br>Sophie Chen<br>Operations Director, Lumiere Design Group',
          aiReply: 'Hi Sophie,<br><br>Great to hear you\'re interested in the expansion. I\'ve run the numbers on the combined ground + first floor tenancy:<br><br>• Combined area: 480 sqm (currently 240 sqm)<br>• Proposed rate: $375/sqm (down from $395 reflecting the longer commitment)<br>• 8-year initial term with 2×4-year renewals<br>• Annual rent: $180,000 + GST<br><br>I\'ve discussed the concept with Des and he\'s supportive in principle, subject to seeing the formal terms. Shall I prepare a Heads of Terms for your review?<br><br>I\'m free Thursday afternoon if you\'d like to walk the ground floor space.<br><br>Best regards,<br>Will Alexander',
          zaraNote: 'Zara confirms: $375/sqm is within market range for Freemans Bay. The 8-year term is favourable for the landlord — recommend proceeding.' },
        { id: 'e2', from: 'Marcus Miller', fromOrg: 'Morrison Kent', email: 'm.miller@morrisonkent.co.nz', subject: 'Settlement conditions — 15 Osterley Way', preview: 'Will, the vendor\'s solicitor has confirmed the OIA condition is now unconditional...', property: '15 Osterley Way', category: 'property', time: '8:15 AM', unread: true,
          body: 'Will,<br><br>The vendor\'s solicitor has confirmed the OIA condition is now unconditional. We\'re clear to proceed to settlement.<br><br>Outstanding items:<br>1. Final settlement statement — expected by Wednesday<br>2. Body corporate levy apportionment — I\'ll confirm the daily rate<br>3. Keys and access codes — arrange with building manager<br><br>Settlement date remains 28 April. Please confirm your client is ready to proceed.<br><br>Regards,<br>Marcus Miller<br>Partner, Morrison Kent',
          aiReply: 'Hi Marcus,<br><br>Thanks for confirming the OIA clearance — great news.<br><br>On the outstanding items:<br>1. Settlement statement — we\'ll review as soon as it\'s through<br>2. Body corp levy — noted, please send the daily rate when available<br>3. Keys — I\'ll coordinate with the building manager at Crockers this week<br><br>My client is confirmed ready to settle on the 28th. No issues anticipated.<br><br>Best regards,<br>Will Alexander',
          zaraNote: 'Settlement on track. No contradictions with existing deal terms detected.' },
        { id: 'e3', from: 'James Chen', fromOrg: 'Harbour Capital', email: 'j.chen@harbourcap.co.nz', subject: 'Investment enquiry — Carlisle Road property', preview: 'Will, thanks for the introduction. The Carlisle Rd opportunity looks very interesting...', property: '170-174 Carlisle Rd', category: 'client', time: 'Yesterday', unread: false,
          body: 'Will,<br><br>Thanks for the introduction. The Carlisle Rd opportunity looks very interesting — the 6.1% yield and long-term ECE tenant are exactly what we\'re looking for.<br><br>A few questions:<br>1. Can you confirm the lease is a net lease or gross?<br>2. What\'s the building condition — any upcoming capex requirements?<br>3. Is there any development upside (zoning)?<br><br>If these stack up, we\'d like to arrange an inspection next week.<br><br>Regards,<br>James Chen<br>Director, Harbour Capital Ltd',
          aiReply: 'Hi James,<br><br>Great questions. Here are the details:<br><br>1. The lease is a net lease — tenant pays all outgoings including rates, insurance, and maintenance<br>2. Building condition is excellent — recent seismic strengthening to 80% NBS, roof replaced 2021. No material capex expected in the next 5 years<br>3. Zoning is Business — Mixed Use under Auckland Unitary Plan. There is development upside for a potential second level addition (subject to resource consent)<br><br>I\'d be happy to arrange an inspection. How does Wednesday or Thursday next week look?<br><br>Best regards,<br>Will Alexander',
          zaraNote: 'All property data verified against LINZ and council records. Development upside claim confirmed — Mixed Use zone permits up to 16m height.' },
        { id: 'e4', from: 'Sarah Park', fromOrg: 'TechFlow Ltd', email: 's.park@techflow.co.nz', subject: 'Office space requirements — follow up', preview: 'Hi Will, following our conversation, I\'ve discussed internally and we\'re keen to view...', property: '88 Shortland St', category: 'client', time: 'Yesterday', unread: false,
          body: 'Hi Will,<br><br>Following our conversation, I\'ve discussed internally and we\'re keen to view the 88 Shortland St space.<br><br>Key requirements:<br>• Minimum 450 sqm (we need room to grow to 60 staff by end of year)<br>• Modern fit-out or fit-out contribution<br>• Good natural light — our team does a lot of screen work<br>• Bike storage and end-of-trip facilities<br><br>Could you arrange a viewing for next week? Tuesday or Wednesday preferred.<br><br>Thanks,<br>Sarah Park<br>COO, TechFlow Ltd',
          aiReply: 'Hi Sarah,<br><br>That\'s great to hear. 88 Shortland St ticks all your boxes:<br><br>• The available floor is 1,200 sqm which can be partitioned to 500 sqm initially with expansion options as you grow<br>• Recently refurbished with modern open-plan fit-out — the landlord may consider a fit-out contribution for a 5+ year commitment<br>• North-facing with floor-to-ceiling glazing — excellent natural light<br>• Building has 24 bike parks in the basement plus showers and lockers<br><br>I\'ve provisionally booked a viewing for Tuesday 15th at 2:30 PM. Does that work for you?<br><br>Best regards,<br>Will Alexander',
          zaraNote: 'Viewing auto-added to calendar for Tue 15th. TechFlow ICP has been active 5 months — strong intent signal.' },
        { id: 'e5', from: 'Bayleys Research', fromOrg: 'Bayleys', email: 'research@bayleys.co.nz', subject: 'Weekly Market Digest — Auckland Commercial', preview: 'This week: Industrial yields tighten to 4.8%, CBD vacancy drops to 8.1%...', property: null, category: 'internal', time: 'Yesterday', unread: false,
          body: 'Weekly Market Digest — Auckland Commercial<br><br>Key movements this week:<br>• Industrial yields tighten to 4.8% average (South Auckland leading)<br>• CBD office vacancy drops to 8.1% from 8.4% last month<br>• 3 new retail listings in Ponsonby — combined value $4.2M<br>• Newmarket office demand strong — 4 new tenant requirements registered<br><br>Full report attached.',
          aiReply: null, zaraNote: null },
        { id: 'e6', from: 'Des Radonich', fromOrg: 'Des Radonich Ltd', email: 'des@radonich.co.nz', subject: 'Rent review — 33 Crummer Rd', preview: 'Will, the CPI review is due September. Can we discuss the approach...', property: '33 Crummer Rd', category: 'property', time: '2 days ago', unread: false,
          body: 'Will,<br><br>The CPI rent review for Glenn Cotterill\'s lease at 33 Crummer Rd is due September. Can we discuss the approach? Current rent is $92,412 and CPI is tracking around 3.1%.<br><br>I\'d prefer to keep Glenn happy — he\'s been a good tenant and the expansion signals suggest he may want more space.<br><br>Can you call me when you have a moment?<br><br>Des',
          aiReply: 'Hi Des,<br><br>Thanks for flagging the rent review. Based on current CPI at 3.1%, the adjusted annual rent would be approximately $95,278 (an increase of $2,866).<br><br>I agree with your approach — Glenn has been a reliable tenant with 91% stickiness, and our signals suggest his business is growing. A smooth review reinforces the relationship for a potential lease renewal conversation down the track.<br><br>I\'ll give you a call this afternoon to discuss. In the meantime, I\'ve asked Costello to prepare a market comparison for the Grey Lynn office submarket to support the CPI adjustment.<br><br>Best regards,<br>Will Alexander',
          zaraNote: 'CPI calculation verified: 3.1% on $92,412 = $95,278.77. Market comparison supports CPI-only adjustment — no ratchet clause in this lease.' },
        { id: 'e7', from: 'Tom Mercer', fromOrg: 'Meridian Creative', email: 'tom@meridiancreative.co.nz', subject: 'Expansion plans — confidential', preview: 'Hi Will, Lisa and I have been discussing our space needs. The team has grown to 22...', property: '135 Parnell Rd', category: 'client', time: '2 days ago', unread: false,
          body: 'Hi Will,<br><br>Lisa and I have been discussing our space needs. The team has grown to 22 and we\'re hiring another 6-8 this year. Our current space at 85 Parnell Rd (180 sqm) is getting very tight.<br><br>We love the Parnell area and would prefer to stay in the creative precinct. Can you show us what\'s available?<br><br>Budget is flexible but we\'re thinking $350-400/sqm range for the right space. Character buildings preferred — our brand is important to us.<br><br>This is confidential for now — we haven\'t told our current landlord yet.<br><br>Cheers,<br>Tom',
          aiReply: 'Hi Tom,<br><br>Thanks for thinking of me — exciting to hear about Meridian\'s growth.<br><br>I have two options that match your brief perfectly:<br><br>1. <strong>135 Parnell Road</strong> — 320 sqm, heritage conversion with exposed brick and high stud. Creative-ready fit-out. $395/sqm. Available from March 2027 — which aligns well with your lease expiry at 85 Parnell Rd.<br><br>2. <strong>Suite 2, 153B Parnell Road</strong> — 280 sqm, character villa conversion. $370/sqm. Available immediately.<br><br>Both are in the heart of the Parnell creative precinct. I\'d suggest viewing both — I can arrange them back-to-back one morning next week.<br><br>Absolutely understand the confidentiality. I won\'t engage with your current landlord until you\'re ready.<br><br>Best regards,<br>Will Alexander',
          zaraNote: 'Confidential flag noted. Zara has suppressed this from the CRM activity feed until Tom confirms readiness.' },
        { id: 'ai1', from: 'Zara', fromOrg: 'AI Agent', email: null, subject: 'Follow-up reminder: Glenn Cotterill re lease renewal', preview: 'Glenn hasn\'t responded to your lease renewal email sent 5 days ago. Recommend a phone call...', property: '33 Crummer Rd', category: 'ai', time: '7:30 AM', unread: true,
          body: '<div class="cmd-ai-body"><strong>Follow-up recommended</strong><br><br>Glenn Cotterill hasn\'t responded to your lease renewal discussion email sent 5 days ago. Based on his communication pattern, he typically responds within 2 days.<br><br>His lease at 33 Crummer Rd expires in 7 months. Given the expansion signals (6 Seek listings, 40% revenue growth), this is a time-sensitive opportunity.<br><br><strong>Recommended action:</strong> Phone call today. Glenn\'s mobile: 021 XXX XXXX<br><br><em>This reminder was generated by Zara based on your communication history and deal timeline.</em></div>',
          aiReply: null, zaraNote: null },
        { id: 'ai2', from: 'Wallace', fromOrg: 'AI Agent', email: null, subject: 'Introduction ready: Harbour Capital → 170-174 Carlisle Rd', preview: 'Wallace has drafted an introduction email for James Chen (Harbour Capital) regarding the 96% match...', property: '170-174 Carlisle Rd', category: 'ai', time: '6:45 AM', unread: true,
          body: '<div class="cmd-ai-body"><strong>Introduction draft ready</strong><br><br>Wallace matched Harbour Capital to 170-174 Carlisle Rd at <strong>96% compatibility</strong>. A personalised introduction email has been drafted for James Chen.<br><br><strong>Match summary:</strong><br>• Budget: $3.0M–$5.5M ✓ (Asking $3.8M–$4.2M)<br>• Target yield: 5.5–6.5% ✓ (Property yields 6.1%)<br>• Location: North Shore ✓<br>• Tenant quality: 15yr ECE lease ✓<br><br><em>Click "Send to James Chen" to open the pre-filled compose view, or edit before sending.</em></div>',
          aiReply: null, zaraNote: null, composeData: { to: 'j.chen@harbourcap.co.nz', subject: 'Investment opportunity — 170-174 Carlisle Road, North Shore', property: '170-174 Carlisle Rd, North Shore', body: 'Hi James,\n\nI have a retail investment at 170-174 Carlisle Road, North Shore that closely matches your investment brief.\n\nKey highlights:\n• Net yield: 6.1% on a 15-year lease to Magic Garden ECE\n• Asking price: $3.8M–$4.2M\n• WALE: 4.8 years\n• Building in excellent condition — recent seismic strengthening to 80% NBS\n\nThe long-term ECE tenant and North Shore location provide the income security and growth profile you outlined.\n\nWould you like me to send through the full investment summary, or shall we arrange an inspection?\n\nKind regards,\n\nWill Alexander\nHead of Innovation | Commercial\nBayleys Real Estate\nM: 021 XXX XXXX\nE: will.alexander@bayleys.co.nz' } },
        { id: 'ai3', from: 'Costello', fromOrg: 'AI Agent', email: null, subject: 'Weekly portfolio report ready — Des Radonich', preview: 'Costello has generated the weekly owner report for Des Radonich covering 33 Crummer Rd...', property: '33 Crummer Rd', category: 'ai', time: 'Yesterday', unread: false,
          body: '<div class="cmd-ai-body"><strong>Weekly owner report generated</strong><br><br>Costello has prepared the weekly portfolio report for Des Radonich covering:<br><br>• <strong>33 Crummer Road</strong> — Tenant stickiness stable at 48%, CPI review due Sep 2026, Glenn Cotterill showing expansion signals<br>• Market comparison: Grey Lynn office rents averaging $380/sqm (your property at $302/sqm — below market)<br>• Recommendation: Consider rent review to align closer to market during September CPI adjustment<br><br><em>Report is ready to send. Des typically prefers email delivery on Monday mornings.</em></div>',
          aiReply: null, zaraNote: null, composeData: { to: 'des@radonich.co.nz', subject: 'Weekly portfolio report — 33 Crummer Road', property: '33 Crummer Road, Grey Lynn', body: 'Hi Des,\n\nPlease find attached your weekly portfolio report for 33 Crummer Road.\n\nKey highlights this week:\n• Tenant stickiness remains stable at 48%\n• CPI rent review due September — current CPI tracking at 3.1%\n• Glenn Cotterill showing expansion signals (6 active Seek listings)\n• Grey Lynn office market averaging $380/sqm — your property at $302/sqm has room for adjustment\n\nI\'d recommend we discuss the September rent review approach. Happy to call this week.\n\nBest regards,\n\nWill Alexander\nHead of Innovation | Commercial\nBayleys Real Estate' } },
        { id: 'ai4', from: 'Wallace', fromOrg: 'AI Agent', email: null, subject: 'Expansion match: Meridian Creative → 135 Parnell Rd', preview: 'Wallace identified Meridian Creative as a high-probability expansion tenant for 135 Parnell Rd...', property: '135 Parnell Rd', category: 'ai', time: 'Yesterday', unread: false,
          body: '<div class="cmd-ai-body"><strong>Expansion opportunity identified</strong><br><br>Wallace identified Meridian Creative as an <strong>84% match</strong> for 135 Parnell Rd based on expansion signals:<br><br>• 6 active Seek listings (+40% YoY revenue growth)<br>• Current space at 85 Parnell Rd (180 sqm) — outgrowing within 12 months<br>• 135 Parnell Rd offers 320 sqm in a character building matching their brand<br>• Lease timing aligns — Meridian\'s expiry is May 2027, space available from March 2027<br><br><strong>This is confidential</strong> — Tom Mercer has not yet notified his current landlord.<br><br><em>Click to draft an approach email for Tom & Lisa Mercer.</em></div>',
          aiReply: null, zaraNote: null, composeData: { to: 'tom@meridiancreative.co.nz', subject: 'Space options in Parnell — confidential', property: '135 Parnell Rd, Parnell', body: 'Hi Tom,\n\nCongratulations on Meridian\'s growth this year — it\'s great to see the team expanding.\n\nI wanted to flag 135 Parnell Road, which is coming available around the time your lease at 85 Parnell is up for renewal. It\'s a heritage conversion with 320sqm of creative-ready space — exposed brick, high stud, natural light. Nearly double your current footprint, and still in the Parnell creative precinct.\n\nI also have a second option at Suite 2, 153B Parnell Road (280sqm, $370/sqm) if you\'d like to compare.\n\nHappy to arrange viewings at your convenience. Absolutely understand the confidentiality.\n\nKind regards,\n\nWill Alexander\nHead of Innovation | Commercial\nBayleys Real Estate' } }
    ];

    const CMD_CALENDAR = [
        { id: 'c1', time: '9:00', duration: '30 min', title: 'Team standup', type: 'm365', property: null, attendees: [{ name: 'Bayleys Commercial Team', initials: 'BT' }] },
        { id: 'c2', time: '10:30', duration: '45 min', title: 'Property viewing — 33 Crummer Rd', type: 'viewing', property: '33 Crummer Rd', attendees: [{ name: 'Glenn Cotterill', initials: 'GC', role: 'Tenant · Glenn Cotterill Company Trust' }, { name: 'Des Radonich', initials: 'DR', role: 'Owner · Des Radonich Ltd' }],
          prep: '<strong>Zara\'s meeting prep:</strong><ul><li>Glenn\'s lease expires Aug 2029 — but expansion signals suggest he may want to discuss early renewal for more space</li><li>Des is open to a longer term at reduced rate (per his email)</li><li>Building NBS is 67% — mention the seismic upgrade plan to reassure Glenn</li><li>Current rent $92,412 — CPI review due Sep, expect ~$95k adjusted</li></ul><strong>Talking points:</strong> Expansion needs, combined floor option, rent review approach, long-term commitment incentives.',
          transport: { address: '33 Crummer Road, Grey Lynn', driveTime: '25 min', distance: '8.2 km', leaveBy: '10:05 AM', cost: '$18–$24' } },
        { id: 'c3', time: '12:00', duration: '1 hr', title: 'Lunch with Marcus Miller', type: 'm365', property: '15 Osterley Way', attendees: [{ name: 'Marcus Miller', initials: 'MM', role: 'Partner · Morrison Kent Solicitors' }],
          prep: '<strong>Context:</strong> Settlement for 15 Osterley Way is 28 April. Marcus confirmed OIA is unconditional. Use lunch to confirm all outstanding items and discuss potential future instructions.' },
        { id: 'c4', time: '2:00', duration: '30 min', title: 'Harbour Capital intro call', type: 'zara', property: '170-174 Carlisle Rd', attendees: [{ name: 'James Chen', initials: 'JC', role: 'Director · Harbour Capital Ltd' }],
          prep: '<strong>Wallace matched this at 96%.</strong><ul><li>James is looking for $3-5.5M retail investment, 5.5-6.5% yield</li><li>Carlisle Rd returns 6.1% on a 15-year ECE lease — perfect match</li><li>He\'s asked about lease type (net), building condition, and development upside</li><li>Have answers ready from your AI-drafted reply</li></ul><strong>Goal:</strong> Arrange an inspection for next week.' },
        { id: 'c5', time: '3:30', duration: '15 min', title: 'Costello weekly report review', type: 'costello', property: null, attendees: [] },
        { id: 'c6', time: '4:30', duration: '45 min', title: 'TechFlow viewing — 88 Shortland St', type: 'viewing', property: '88 Shortland St', attendees: [{ name: 'Sarah Park', initials: 'SP', role: 'COO · TechFlow Ltd' }, { name: 'David Kim', initials: 'DK', role: 'Facilities Manager · TechFlow Ltd' }],
          prep: '<strong>Zara\'s viewing prep:</strong><ul><li>TechFlow has 45 staff, growing 30% YoY — need 450+ sqm</li><li>ICP active since Nov 2025 — strong intent</li><li>Key requirements: natural light, modern fit-out, bike storage, growth capacity</li><li>88 Shortland has all of these — emphasise the partitioning flexibility</li><li>Sarah asked about fit-out contribution — the landlord may consider this for a 5+ year term</li></ul><strong>Bring:</strong> Floor plans, fit-out options, parking details.',
          transport: { address: '88 Shortland Street, Auckland CBD', driveTime: '12 min', distance: '4.5 km', leaveBy: '4:15 PM', cost: '$12–$16' } }
    ];

    function renderCommandStream(filter) {
        const stream = document.getElementById('cmdStream');
        if (!stream) return;
        let items = [];

        if (filter === 'all') {
            // All = emails + AI notifications (no calendar in stream)
            CMD_EMAILS.forEach(e => items.push({ ...e, itemType: 'email' }));
        } else if (filter === 'email') {
            CMD_EMAILS.filter(e => e.category !== 'ai').forEach(e => items.push({ ...e, itemType: 'email' }));
        } else if (filter === 'calendar') {
            CMD_CALENDAR.forEach(c => items.push({ ...c, itemType: 'calendar', from: c.type === 'zara' ? 'Zara' : c.type === 'costello' ? 'Costello' : '', fromOrg: '' }));
        } else if (filter === 'ai') {
            CMD_EMAILS.filter(e => e.category === 'ai').forEach(e => items.push({ ...e, itemType: 'email' }));
        }

        stream.innerHTML = items.map(item => {
            if (item.itemType === 'calendar') {
                const dotClass = item.type === 'viewing' ? 'viewing' : item.type === 'zara' ? 'ai' : item.type === 'costello' ? 'ai' : 'calendar';
                const propTag = item.property ? `<span class="cmd-property-tag">${item.property}</span>` : '';
                return `<div class="cmd-stream-item" data-cmd-type="calendar" data-cmd-id="${item.id}">
                    <span class="cmd-item-dot ${dotClass}"></span>
                    <div class="cmd-item-content">
                        <div class="cmd-item-top"><span class="cmd-item-from">${item.time}</span><span class="cmd-item-time">${item.duration}</span></div>
                        <div class="cmd-item-subject">${item.title}</div>
                        <div class="cmd-item-tags">${propTag}</div>
                    </div>
                </div>`;
            } else {
                const dotClass = item.category === 'ai' ? 'ai' : item.category === 'client' ? 'email' : item.category === 'internal' ? 'internal' : 'viewing';
                const propTag = item.property ? `<span class="cmd-property-tag">${item.property}</span>` : '';
                const catTag = item.category !== 'ai' ? `<span class="cmd-category-tag ${item.category}">${item.category}</span>` : '';
                return `<div class="cmd-stream-item${item.unread ? ' unread' : ''}" data-cmd-type="email" data-cmd-id="${item.id}">
                    <span class="cmd-item-dot ${dotClass}"></span>
                    <div class="cmd-item-content">
                        <div class="cmd-item-top"><span class="cmd-item-from">${item.from}${item.fromOrg ? ' · ' + item.fromOrg : ''}</span><span class="cmd-item-time">${item.time}</span></div>
                        <div class="cmd-item-subject">${item.subject}</div>
                        <div class="cmd-item-preview">${item.preview}</div>
                        <div class="cmd-item-tags">${propTag}${catTag}</div>
                    </div>
                </div>`;
            }
        }).join('');

        // Bind clicks
        stream.querySelectorAll('.cmd-stream-item').forEach(el => {
            el.addEventListener('click', () => {
                stream.querySelectorAll('.cmd-stream-item').forEach(s => s.classList.remove('active'));
                el.classList.add('active');
                el.classList.remove('unread');
                const type = el.dataset.cmdType;
                const id = el.dataset.cmdId;
                if (type === 'email') openCmdEmail(id);
                else if (type === 'calendar') openCmdMeeting(id);
            });
        });
    }

    function renderCommandTimeline() {
        const tl = document.getElementById('cmdTimeline');
        if (!tl) return;
        tl.innerHTML = '<div class="cmd-timeline-title">Today\'s Schedule</div>' +
            CMD_CALENDAR.map(c => {
                const propChip = c.property ? `<div class="cmd-tl-property-chip">${c.property}</div>` : '';
                return `<div class="cmd-tl-item" data-cmd-cal="${c.id}">
                    <span class="cmd-tl-time">${c.time}</span>
                    <div class="cmd-tl-bar ${c.type}"></div>
                    <div class="cmd-tl-info">
                        <div class="cmd-tl-title">${c.title}</div>
                        <div class="cmd-tl-meta">${c.duration}${c.attendees.length ? ' · ' + c.attendees.map(a => a.name).join(', ') : ''}</div>
                        ${propChip}
                    </div>
                </div>`;
            }).join('');

        // Bind timeline clicks
        tl.querySelectorAll('.cmd-tl-item').forEach(el => {
            el.addEventListener('click', () => openCmdMeeting(el.dataset.cmdCal));
        });
    }

    function showCmdPanel(panel) {
        ['cmdToday', 'cmdEmailDetail', 'cmdMeetingDetail', 'cmdComposeView'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = id === panel ? '' : 'none';
        });
    }

    function openCmdEmail(id) {
        const email = CMD_EMAILS.find(e => e.id === id);
        if (!email) return;
        showCmdPanel('cmdEmailDetail');
        document.getElementById('cmdEmailSubject').textContent = email.subject;
        document.getElementById('cmdEmailPropertyTag').innerHTML = email.property ? `<span class="cmd-property-tag">${email.property}</span>` : '';
        document.getElementById('cmdEmailMeta').innerHTML = `<strong>${email.from}</strong> &lt;${email.email || 'system'}&gt; · ${email.time}`;
        document.getElementById('cmdEmailBody').innerHTML = email.body;
        document.getElementById('cmdAiDraft').style.display = 'none';

        // Agent compose button (for Wallace/Costello emails with composeData)
        const replySection = document.querySelector('.cmd-email-reply-section');
        if (replySection && email.composeData) {
            const recipientName = email.composeData.to.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            replySection.innerHTML = `
                <button class="cmd-draft-reply-btn" id="cmdAgentCompose">
                    <span class="agent-pip wallace" style="width:18px;height:18px;font-size:8px">W</span>
                    Send to ${recipientName}
                </button>
                <button class="cmd-reply-btn" id="cmdManualReply">Edit draft</button>
            `;
            document.getElementById('cmdAgentCompose')?.addEventListener('click', () => {
                openCmdCompose(email.composeData);
            });
        } else if (replySection && !email.composeData) {
            replySection.innerHTML = `
                <button class="cmd-draft-reply-btn" id="cmdDraftReply" style="${email.aiReply ? '' : 'display:none'}">
                    <span class="agent-pip wallace" style="width:18px;height:18px;font-size:8px">W</span>
                    Draft AI Reply
                </button>
                <button class="cmd-reply-btn" id="cmdManualReply">Reply</button>
                <button class="cmd-reply-btn">Forward</button>
            `;
        }

        // Draft reply button
        const draftBtn = document.getElementById('cmdDraftReply');
        if (draftBtn) {
            draftBtn.style.display = email.aiReply ? '' : 'none';
            draftBtn.onclick = () => {
                const draftEl = document.getElementById('cmdAiDraft');
                draftEl.style.display = '';
                document.getElementById('cmdAiDraftBody').innerHTML = email.aiReply;
                const zaraEl = document.getElementById('cmdZaraReview');
                const zaraText = document.getElementById('cmdZaraReviewText');
                if (email.zaraNote) {
                    zaraEl.style.display = '';
                    zaraText.textContent = email.zaraNote;
                } else {
                    zaraEl.style.display = 'none';
                }
                draftEl.scrollIntoView({ behavior: 'smooth' });
            };
        }

        // Send draft
        document.getElementById('cmdSendDraft').onclick = function() {
            this.textContent = 'Sent';
            this.style.background = '#059669';
            this.disabled = true;
            // Brittany auto-file confirmation
            const zaraEl = document.getElementById('cmdZaraReview');
            if (zaraEl) {
                setTimeout(() => {
                    zaraEl.innerHTML = '<span class="agent-pip brittany" style="width:16px;height:16px;font-size:7px;background:linear-gradient(135deg,#ec4899,#8b5cf6)">B</span><span>Brittany has filed this email to ' + (email.property || 'Vault RE') + ' and updated the CRM record.</span>';
                }, 800);
            }
        };
    }

    function openCmdMeeting(id) {
        const meeting = CMD_CALENDAR.find(c => c.id === id);
        if (!meeting) return;
        showCmdPanel('cmdMeetingDetail');
        document.getElementById('cmdMeetingTitle').textContent = meeting.title;
        document.getElementById('cmdMeetingTime').textContent = `${meeting.time} · ${meeting.duration}`;
        document.getElementById('cmdMeetingProperty').innerHTML = meeting.property ? `<span class="cmd-property-tag">${meeting.property}</span>` : '';
        document.getElementById('cmdMeetingAttendees').innerHTML = meeting.attendees.map(a =>
            `<div class="cmd-attendee-card"><div class="cmd-attendee-avatar">${a.initials}</div><div><div class="cmd-attendee-name">${a.name}</div><div class="cmd-attendee-role">${a.role || ''}</div></div></div>`
        ).join('');
        // Prep notes
        let prepHtml = meeting.prep ?
            `<div class="cmd-prep-label"><span class="agent-pip zara" style="width:18px;height:18px;font-size:8px">Z</span>Zara's Meeting Prep</div><div class="cmd-prep-body">${meeting.prep}</div>` : '';

        // Transport section for viewings
        if (meeting.transport) {
            const t = meeting.transport;
            prepHtml += `
                <div class="cmd-transport" id="cmdTransport">
                    <div class="cmd-transport-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>Transport to viewing</span>
                    </div>
                    <div class="cmd-transport-body">
                        <div class="cmd-transport-destination">
                            <span class="cmd-transport-address">${t.address}</span>
                        </div>
                        <div class="cmd-transport-stats">
                            <div class="cmd-transport-stat">
                                <span class="cmd-transport-stat-value">${t.driveTime}</span>
                                <span class="cmd-transport-stat-label">Drive time</span>
                            </div>
                            <div class="cmd-transport-stat">
                                <span class="cmd-transport-stat-value">${t.distance}</span>
                                <span class="cmd-transport-stat-label">Distance</span>
                            </div>
                            <div class="cmd-transport-stat">
                                <span class="cmd-transport-stat-value">${t.leaveBy}</span>
                                <span class="cmd-transport-stat-label">Leave by</span>
                            </div>
                            <div class="cmd-transport-stat">
                                <span class="cmd-transport-stat-value">${t.cost}</span>
                                <span class="cmd-transport-stat-label">Est. cost</span>
                            </div>
                        </div>
                        <div class="cmd-transport-actions">
                            <button class="cmd-transport-book" id="cmdBookUberMeeting">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                Book Uber
                            </button>
                            <span class="cmd-transport-note">Receipt auto-filed to Xero via Zara</span>
                        </div>
                        <div class="cmd-transport-booked" id="cmdTransportBooked" style="display:none">
                            <div class="cmd-transport-booked-header">
                                <span class="step-dot done" style="display:inline-block;width:8px;height:8px"></span>
                                <strong>Uber booked</strong>
                            </div>
                            <div class="cmd-transport-booked-details">
                                <div class="cmd-transport-driver">
                                    <div class="cmd-transport-driver-avatar">MR</div>
                                    <div>
                                        <span class="cmd-transport-driver-name">Michael R.</span>
                                        <span class="cmd-transport-driver-car">Toyota Camry · Grey · FXR 892</span>
                                    </div>
                                </div>
                                <div class="cmd-transport-eta">
                                    <span class="cmd-transport-eta-time">Arriving in 4 min</span>
                                    <span class="cmd-transport-eta-sub">ETA pickup: ${t.leaveBy}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        document.getElementById('cmdMeetingPrep').innerHTML = prepHtml || '<p style="color:var(--text-tertiary);font-size:13px;">No prep notes for this meeting.</p>';

        // Bind Uber book button
        document.getElementById('cmdBookUberMeeting')?.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
            document.getElementById('cmdTransportBooked').style.display = '';
        });
    }

    // Set today's date
    const cmdDateEl = document.getElementById('cmdTodayDate');
    if (cmdDateEl) {
        const now = new Date();
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        cmdDateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
    }

    // Tab switching
    document.querySelectorAll('.cmd-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.cmd-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderCommandStream(tab.dataset.cmdTab);
        });
    });

    // Back buttons
    document.getElementById('cmdBackBtn')?.addEventListener('click', () => showCmdPanel('cmdToday'));
    document.querySelectorAll('.cmd-back-meeting').forEach(b => b.addEventListener('click', () => showCmdPanel('cmdToday')));
    document.querySelectorAll('.cmd-back-compose').forEach(b => b.addEventListener('click', () => showCmdPanel('cmdToday')));

    // Compose
    document.getElementById('cmdCompose')?.addEventListener('click', () => showCmdPanel('cmdComposeView'));
    document.getElementById('cmdComposeSend')?.addEventListener('click', function() {
        this.textContent = 'Sent';
        this.style.background = '#059669';
        this.disabled = true;
        setTimeout(() => {
            showCmdPanel('cmdToday');
            this.textContent = 'Send';
            this.style.background = '';
            this.disabled = false;
        }, 2000);
    });

    // AI Assist in compose
    document.getElementById('cmdAiAssist')?.addEventListener('click', () => {
        const body = document.getElementById('cmdComposeBody');
        const prop = document.getElementById('cmdComposeProperty');
        const to = document.getElementById('cmdComposeTo');
        const subject = document.getElementById('cmdComposeSubject');
        const recipientName = to?.value?.split('@')[0]?.replace(/[._]/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || 'there';
        const propName = prop?.value || 'a property opportunity';

        if (body && !body.value) {
            body.value = `Hi ${recipientName},\n\nI hope this finds you well. I wanted to reach out regarding ${propName} that I believe would be of interest based on your current requirements.\n\nI'd be happy to arrange a viewing or send through the full property brief at your convenience.\n\nKind regards,\n\nWill Alexander\nHead of Innovation | Commercial\nBayleys Real Estate\nM: 021 XXX XXXX\nE: will.alexander@bayleys.co.nz\nbayleys.co.nz`;
        }
        if (subject && !subject.value && propName !== 'a property opportunity') {
            subject.value = `Property opportunity — ${propName}`;
        }
    });

    // Continuous calendar data — events by "year-month-day" key
    const calEvents = {};
    // April 2026
    const aprEvents = {
        1: [{ time: '10:00', title: 'Quarter review', type: 'm365' }, { time: '2:00', title: 'Planning session (Zara)', type: 'zara' }],
        2: [{ time: '9:30', title: 'Team standup', type: 'm365' }],
        3: [{ time: '12:00', title: 'Client lunch', type: 'm365' }],
        7: [{ time: '11:00', title: 'Landlord call — Des Radonich', type: 'm365' }],
        8: [{ time: '9:00', title: 'AI strategy meeting', type: 'm365' }, { time: '2:00', title: 'Alix RPM catch-up', type: 'm365' }, { time: '3:30', title: 'Call Marcus Miller (Zara)', type: 'zara' }],
        9: [{ time: '10:30', title: 'Property viewing', type: 'viewing' }, { time: '3:00', title: 'Follow-up Sophie Chen (Zara)', type: 'zara' }],
        12: CMD_CALENDAR.map(c => ({ time: c.time, title: c.title, type: c.type })),
        13: [{ time: '9:00', title: 'Team planning', type: 'm365' }, { time: '11:00', title: '135 Parnell Rd viewing', type: 'viewing' }],
        14: [{ time: '12:30', title: 'Client lunch', type: 'm365' }, { time: '3:00', title: 'Follow-up calls (Zara)', type: 'zara' }],
        15: [{ time: '2:30', title: 'TechFlow — 88 Shortland St', type: 'viewing' }],
        16: [{ time: '10:00', title: 'Quarterly review', type: 'm365' }, { time: '4:00', title: 'Portfolio report (Costello)', type: 'costello' }],
        17: [{ time: '10:00', title: 'Beaumont St — Sophie Chen', type: 'viewing' }],
        21: [{ time: '9:00', title: 'Market update call', type: 'm365' }],
        22: [{ time: '11:00', title: 'Osterley Way settlement prep', type: 'm365' }],
        23: [{ time: '2:00', title: 'Harbour Capital follow-up', type: 'zara' }],
        27: [{ time: '10:00', title: 'Monthly team sync', type: 'm365' }],
        28: [{ time: '10:00', title: 'Settlement — 15 Osterley Way', type: 'm365' }],
        29: [{ time: '9:00', title: 'Rent review — Crummer Rd', type: 'm365' }],
        30: [{ time: '2:00', title: 'End of month reporting', type: 'costello' }]
    };
    Object.entries(aprEvents).forEach(([d, evts]) => { calEvents['2026-4-' + d] = evts; });
    // May 2026
    calEvents['2026-5-5'] = [{ time: '10:00', title: 'Portfolio quarterly review', type: 'm365' }];
    calEvents['2026-5-7'] = [{ time: '9:00', title: 'Lease renewal — Crummer Rd', type: 'viewing' }, { time: '2:00', title: 'Wallace matching review', type: 'zara' }];
    calEvents['2026-5-12'] = [{ time: '11:00', title: 'Client presentation', type: 'm365' }];
    calEvents['2026-5-14'] = [{ time: '10:00', title: '135 Parnell Rd — Meridian viewing', type: 'viewing' }];
    calEvents['2026-5-19'] = [{ time: '9:30', title: 'Team sync', type: 'm365' }, { time: '3:00', title: 'Costello monthly report', type: 'costello' }];
    calEvents['2026-5-21'] = [{ time: '10:00', title: 'Osterley Way — post-settlement', type: 'm365' }];
    calEvents['2026-5-26'] = [{ time: '2:00', title: 'Harbour Capital follow-up', type: 'zara' }];
    calEvents['2026-5-28'] = [{ time: '9:00', title: 'Market update call', type: 'm365' }];
    // June 2026
    calEvents['2026-6-2'] = [{ time: '10:00', title: 'Mid-year planning', type: 'm365' }];
    calEvents['2026-6-4'] = [{ time: '11:00', title: 'New listing — Ponsonby', type: 'viewing' }];
    calEvents['2026-6-9'] = [{ time: '9:00', title: 'Team standup', type: 'm365' }];
    calEvents['2026-6-11'] = [{ time: '2:00', title: 'Investor presentation', type: 'm365' }];
    calEvents['2026-6-16'] = [{ time: '10:00', title: 'Zara quarterly review', type: 'zara' }];
    calEvents['2026-6-23'] = [{ time: '9:30', title: 'Rent review — Beaumont', type: 'viewing' }];
    calEvents['2026-6-30'] = [{ time: '4:00', title: 'End of quarter reporting', type: 'costello' }];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    function renderContinuousWeeks() {
        const container = document.getElementById('cmdWeekView');
        if (!container) return;
        const today = new Date(2026, 3, 12); // April 12, 2026
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday of current week
        let html = '';

        for (let w = 0; w < 4; w++) {
            const weekStart = new Date(startOfWeek);
            weekStart.setDate(startOfWeek.getDate() + w * 7);
            const weekLabel = w === 0 ? 'This Week' : w === 1 ? 'Next Week' : `Week of ${weekStart.getDate()} ${monthNames[weekStart.getMonth()]}`;
            html += `<div class="cmd-week-label">${weekLabel}</div><div class="cmd-week-grid">`;

            for (let d = 0; d < 7; d++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + d);
                const isToday = date.getDate() === 12 && date.getMonth() === 3;
                const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                const events = calEvents[key] || [];

                html += `<div class="cmd-week-day">`;
                html += `<div class="cmd-week-day-header${isToday ? ' today' : ''}"><span class="cmd-week-day-name">${isToday ? 'Today' : dayNames[date.getDay()]}</span><span class="cmd-week-day-num">${date.getDate()}</span></div>`;
                events.forEach(e => {
                    html += `<div class="cmd-week-event ${e.type}">${e.title}<span>${e.time}</span></div>`;
                });
                html += `</div>`;
            }
            html += `</div>`;
        }
        container.innerHTML = html;
    }

    function renderContinuousMonths() {
        const container = document.getElementById('cmdMonthView');
        if (!container) return;
        let html = '';

        for (let m = 0; m < 3; m++) {
            const month = 3 + m; // April=3, May=4, June=5
            const year = 2026;
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const prevDays = new Date(year, month, 0).getDate();

            html += `<div class="cmd-month-block">`;
            html += `<div class="cmd-month-header">${monthNames[month]} ${year}</div>`;
            html += `<div class="cmd-month-grid">`;
            html += `<div class="cmd-month-dayname">S</div><div class="cmd-month-dayname">M</div><div class="cmd-month-dayname">T</div><div class="cmd-month-dayname">W</div><div class="cmd-month-dayname">T</div><div class="cmd-month-dayname">F</div><div class="cmd-month-dayname">S</div>`;

            // Previous month padding
            for (let p = firstDay - 1; p >= 0; p--) {
                html += `<div class="cmd-month-cell muted">${prevDays - p}</div>`;
            }

            // Days of the month
            for (let d = 1; d <= daysInMonth; d++) {
                const key = `${year}-${month + 1}-${d}`;
                const hasEvent = calEvents[key] ? ' has-event' : '';
                const isToday = month === 3 && d === 12 ? ' today' : '';
                html += `<div class="cmd-month-cell${isToday}${hasEvent}" data-cmd-month-date="${key}">${d}</div>`;
            }

            // Next month padding
            const totalCells = firstDay + daysInMonth;
            const remaining = (7 - totalCells % 7) % 7;
            for (let n = 1; n <= remaining; n++) {
                html += `<div class="cmd-month-cell muted">${n}</div>`;
            }

            html += `</div></div>`;
        }

        // Day detail container
        html += `<div class="cmd-month-day-detail" id="cmdMonthDayDetail" style="display:none"><div class="cmd-month-day-detail-header" id="cmdMonthDayDetailHeader"></div><div class="cmd-month-day-detail-events" id="cmdMonthDayDetailEvents"></div></div>`;
        container.innerHTML = html;

        // Bind date clicks
        container.querySelectorAll('.cmd-month-cell:not(.muted)').forEach(cell => {
            cell.addEventListener('click', () => {
                const key = cell.dataset.cmdMonthDate;
                if (!key) return;
                container.querySelectorAll('.cmd-month-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');

                const parts = key.split('-');
                const day = parseInt(parts[2]);
                const monthIdx = parseInt(parts[1]) - 1;
                const dayEvents = calEvents[key];
                const detail = document.getElementById('cmdMonthDayDetail');
                const header = document.getElementById('cmdMonthDayDetailHeader');
                const eventsEl = document.getElementById('cmdMonthDayDetailEvents');

                header.textContent = `${day} ${monthNames[monthIdx]} 2026` + (dayEvents ? ` — ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : '');
                eventsEl.innerHTML = dayEvents ? dayEvents.map(e =>
                    `<div class="cmd-month-detail-event ${e.type}"><span class="cmd-month-detail-time">${e.time}</span><span class="cmd-month-detail-title">${e.title}</span></div>`
                ).join('') : '<p style="font-size:12px;color:var(--text-tertiary);padding:8px 0;">No events scheduled</p>';
                detail.style.display = '';
                detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        });
    }

    // Day/Week/Month view toggle
    document.querySelectorAll('.cmd-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cmd-view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.dataset.cmdView;
            const timeline = document.getElementById('cmdTimeline');
            const weekView = document.getElementById('cmdWeekView');
            const monthView = document.getElementById('cmdMonthView');
            if (timeline) timeline.style.display = view === 'day' ? '' : 'none';
            if (weekView) {
                weekView.style.display = view === 'week' ? '' : 'none';
                if (view === 'week') renderContinuousWeeks();
            }
            if (monthView) {
                monthView.style.display = view === 'month' ? '' : 'none';
                if (view === 'month') renderContinuousMonths();
            }
        });
    });

    // monthDayEvents used by continuous calendar renderer (defined above in calEvents)

    // Vault RE button
    document.querySelector('.cmd-vault-btn')?.addEventListener('click', function() {
        this.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> Filed';
        this.style.background = '#059669';
        this.style.color = 'white';
        this.style.borderColor = '#059669';
    });

    // Initialize on view switch
    const cmdObserver = new MutationObserver(() => {
        if (document.getElementById('view-command')?.classList.contains('active')) {
            renderCommandStream('all');
            renderCommandTimeline();
            showCmdPanel('cmdToday');
        }
    });
    const cmdView = document.getElementById('view-command');
    if (cmdView) cmdObserver.observe(cmdView, { attributes: true, attributeFilter: ['class'] });

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

    // Zara Schedule: Open Command link
    document.getElementById('zaraSchedLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('command');
    });

    // Zara Schedule: Book Uber buttons
    document.querySelectorAll('.zara-sched-action').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Booked';
            this.style.background = '#059669';
            this.style.color = 'white';
            this.style.borderColor = '#059669';
            this.disabled = true;
        });
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

    // ============ LISTING DEEP DIVE MODAL — data-driven for all 6 listings ============
    const carlisleModal = document.getElementById('carlisleModal');
    const carlisleClose = document.getElementById('carlisleClose');

    // Full listing data — each property has its own complete content set
    const LISTING_DATA = {
        carlisle: {
            badge: 'Office · Investment',
            badgeClass: 'office',
            breadCity: 'North Shore',
            breadType: 'Office Investment',
            title: '170-174 Carlisle Road',
            sub: 'Northcross, North Shore City, Auckland · Listing #1507246',
            priceLabel: 'Method of sale',
            priceValue: 'Deadline Sale',
            priceSub: 'Closes 4:00 PM, 30 April 2026',
            images: [
                'carlisle-01.jpg','carlisle-02.jpg','carlisle-03.jpg','carlisle-04.jpg',
                'carlisle-05.jpg','carlisle-06.jpg','carlisle-07.jpg','carlisle-08.jpg',
                'carlisle-09.jpg','carlisle-10.jpg','carlisle-11.jpg','carlisle-12.jpg','carlisle-13.jpg'
            ],
            heroFallback: 'listing-carlisle.jpg',
            metrics: [
                ['Floor Area', '1,050', 'sqm'],
                ['Land Area', '3,143', 'sqm'],
                ['Net Income', '$509', 'k'],
                ['Lease Term', '15', 'years'],
                ['Rent Review', '2', '% p.a.'],
                ['Zoning', 'Mixed', 'Housing Urban']
            ],
            overviewTitle: 'Investment Highlights',
            overview: `<p class="cl-body-text">A rare long-WALE commercial investment offering passive income security with built-in growth. New 15-year lease commencing 1 February 2026 to <strong>Magic Garden Early Childhood Education</strong> &mdash; a well-established operator with strong financial covenant backed by bank guarantees.</p>
                       <p class="cl-body-text">The substantial 3,143 sqm corner site provides significant land banking value under Mixed Housing Urban zoning, offering long-term development potential in addition to secure holding income.</p>`,
            summaryTitle: 'Lease Summary',
            summary: [
                ['Tenant', 'Magic Garden Early Childhood Education'],
                ['Lease Start', '1 February 2026'],
                ['Term', '15 years'],
                ['Annual Rent', '$509,600 + GST and outgoings'],
                ['Rent Reviews', '2% annual fixed + 5-yearly market'],
                ['Security', 'Bank guarantees in place'],
                ['Rights of Renewal', 'Further terms available']
            ],
            agent: { initials: 'MN', name: 'Michael Nees', role: 'Licensee Salesperson', office: 'Bayleys North Shore C&I', agency: 'Bayleys', phone: '021 182 3085' },
            locStats: [
                ['Schools within 1km', '7'],
                ['Residential within 500m', '480+'],
                ['Median household income', '$118k'],
                ['ECE demand (waitlist)', 'High']
            ],
            aiScanText: 'Visual analysis complete · 13 images processed',
            aiDesc: "Walter's computer vision model analysed every listing image to extract property attributes, condition, and fit-out characteristics. These insights power the Wallace matching engine below.",
            aiFeatures: [
                'Purpose-built childcare fit-out with nature-inspired design',
                'Professional outdoor play area with artificial turf, pergolas, shade sails',
                'Sandpit, garden beds, nature play structures — premium ECE spec',
                'High-ceiling interiors with abundant natural light',
                'Modern commercial kitchen facilities',
                'Dedicated on-site parking — est. 25+ spaces (aerial count)',
                'Full perimeter fencing and secure entry points',
                'Corner site with dual street frontage'
            ],
            aiScores: [
                ['Interior finish', 0.88],
                ['Exterior condition', 0.82],
                ['Outdoor amenity', 0.94],
                ['Fit-out specification', 0.91],
                ['Overall PCI', 0.89, 'highlight']
            ],
            aiSummary: "This is a <strong>top-tier ECE asset</strong> &mdash; the visual analysis places it in the 95th percentile of North Shore childcare properties. Combined with the 15-year lease and bank guarantees, this represents one of the lowest-risk commercial investments currently in the Auckland market. The 3,143 sqm landholding adds substantial underlying asset value that isn't fully reflected in the yield-based pricing.",
            wallaceTitle: 'Wallace has matched 6 prospects from the Bayleys network',
            wallaceDesc: 'Based on visual analysis, lease structure, and database criteria. Even though this is a Bayleys listing, Wallace continuously scans your entire contact network to find the right buyer.',
            wallaceCta: 'Send all 6 intros via Zara',
            wallaceHigh: [
                { score: 96, name: 'Harbour Capital Partners', tag: 'Passive investor · Auckland · Syndicate', criteria: ['Long WALE mandate (10+ yrs)','$7-12M budget','ECE sector preference','North Shore focus'], contact: 'David Chen · 021 XXX 8421' },
                { score: 92, name: 'Meridian Family Office', tag: 'HNWI · Passive income · Healthcare/ECE', criteria: ['Commercial yield 5-6%','Bank guarantee backing','Bayleys Reserve Private client','Active in last 30 days'], contact: 'Via Matt Bayley' },
                { score: 88, name: 'Tauranga Property Trust', tag: 'Diversifying portfolio · Auckland entry', criteria: ['Long-income focus','Under-leveraged ($15M cash)','Mixed-use zoning preferred','Seeking first AKL asset'], contact: 'Sarah Thompson · 027 XXX 5512' }
            ],
            wallaceLow: [
                { score: 78, name: 'Ngā Puna Wai Iwi Trust', tag: 'Iwi investment arm · Social + commercial return', criteria: ['ECE aligns with whānau outcomes','Long-term hold strategy'], cons: ['First commercial purchase'], contact: 'Via Jamie Nuku' },
                { score: 73, name: 'Pacific Childcare Group Ltd', tag: 'Existing ECE operator · Vertical integration', criteria: ['Sector expertise','Owner-operator exit preferred'], cons: ["Tenanted doesn't suit owner-occupy"], contact: 'Via Sunil Bhana' },
                { score: 68, name: 'North Shore Developer Consortium', tag: 'Land-bank play · Mixed Housing Urban zoning', criteria: ['3,143 sqm developable site','Long lease provides holding income'], cons: ['Long-term play (15 yr lease)'], contact: 'Walter signal · Not yet contacted' }
            ],
            molloyDesc: "Based on visual analysis, zoning, and comparable sales, Molloy has identified 4 pathways to enhance the asset's long-term value beyond the current yield play.",
            molloyCards: [
                { title: 'Residential development upside', body: 'The 3,143 sqm site under Mixed Housing Urban zoning supports up to <strong>18 dwellings</strong> or a 3-storey townhouse development at end-of-lease. Current ECE income effectively funds the land bank.', impactLabel: 'Est. residential land value', impactValue: '$3.2M – $4.1M' },
                { title: 'Rent-to-market opportunity (Year 5)', body: 'Current rent of $485/sqm is slightly below the North Shore prime ECE benchmark of <strong>$510–$540/sqm</strong>. The 5-yearly market review in 2031 presents a structured uplift opportunity.', impactLabel: 'Potential rental uplift', impactValue: '+$26k – $58k p.a.' },
                { title: 'Solar + EV infrastructure', body: 'The large north-facing roofline and open car park area suit solar PV + EV charging installation. Can be offered as a tenant incentive or sub-let to a third-party operator for additional income.', impactLabel: 'Capital cost vs annual return', impactValue: '$180k / ~$22k p.a.' },
                { title: 'Seismic strengthening sign-off', body: 'Visual analysis suggests the building is modern construction. A formal IEP assessment confirming 100% NBS would unlock <strong>premium institutional buyers</strong> (KiwiSaver funds, corporate investment trusts) who require 100% NBS minimum.', impactLabel: 'Capital value uplift from buyer pool expansion', impactValue: '+5% – 8%' }
            ],
            molloySummary: [
                ['Current asking (implied)', '~$8.5M'],
                ['Post value-add projection', '$9.8M – $11.2M'],
                ['Total upside opportunity', '+$1.3M – $2.7M', 'highlight']
            ]
        },

        parnell: {
            badge: 'Retail · For Lease',
            badgeClass: 'retail',
            breadCity: 'Auckland Central',
            breadType: 'Retail Lease',
            title: '135 Parnell Road',
            sub: 'Parnell, Auckland · Listing #67033709',
            priceLabel: 'Lease type',
            priceValue: 'By Negotiation',
            priceSub: 'Available immediately · Vacant possession',
            images: ['listing-parnell.jpg', 'parnell-01.jpg', 'parnell-02.jpg'],
            heroFallback: 'listing-parnell.jpg',
            metrics: [
                ['Floor Area', '208', 'sqm'],
                ['Frontage', 'Wide', 'main road'],
                ['Car Parks', '4', 'stacked'],
                ['Position', 'Ground', 'floor'],
                ['Use', 'Retail /', 'Hospitality'],
                ['Zoning', 'Business', 'Mixed Use']
            ],
            overviewTitle: 'Leasing Highlights',
            overview: `<p class="cl-body-text">Prime ground-floor retail space in the heart of Parnell Village &mdash; one of Auckland's most affluent and high-foot-traffic commercial precincts. Excellent main road frontage on Parnell Road with established hospitality and retail neighbours including <strong>Smashed It, Tank, Papa Viet Eatery, Toshi Sushi, The Healthy Habit, Portofino and Nottinghill</strong>.</p>
                       <p class="cl-body-text">208 sqm of versatile space ideal for a hospitality operator, premium retailer or boutique service business. Includes 4 stacked car parks &mdash; rare for Parnell Village &mdash; with bus and train links and major state highway access immediately adjacent.</p>`,
            summaryTitle: 'Lease Terms',
            summary: [
                ['Floor Area', '208 sqm'],
                ['Type', 'Ground floor retail premises'],
                ['Rent', 'Negotiable — contact agent'],
                ['Lease Term', 'Negotiable'],
                ['Possession', 'Vacant — available now'],
                ['Outgoings', 'Tenant share + GST'],
                ['Listing Source', 'Colliers New Zealand']
            ],
            agent: { initials: 'DM', name: 'Danielle McLaughlin', role: 'Commercial Lease Specialist', office: 'Colliers New Zealand', agency: 'Colliers', phone: '021 029 91107' },
            locStats: [
                ['Daily foot traffic (Parnell Rd)', '8,400'],
                ['Cafés / restaurants within 200m', '24+'],
                ['Median household income', '$152k'],
                ['Walk score', '92 / 100']
            ],
            aiScanText: 'Visual + locational analysis complete',
            aiDesc: "Walter's vision model analysed the listing imagery and combined it with Parnell Village street-level data, foot-traffic counts, and the 24+ surrounding F&B operators to score the leasability of this premises.",
            aiFeatures: [
                'Wide frontage with double-shopfront glazing — high visibility',
                'High-stud interior with structural columns — open floor plate',
                'Existing kitchen rough-in suggests prior F&B fit-out',
                'Rear loading access via service lane',
                'Heritage-style awning typical of Parnell precinct',
                'Adjacent to high-performing Smashed It and Tank tenancies',
                '4 stacked car parks — rare retention asset for Parnell',
                'Bus stops within 50m, Parnell train station 600m'
            ],
            aiScores: [
                ['Foot traffic exposure', 0.94],
                ['Frontage / visibility', 0.88],
                ['Fit-out flexibility', 0.79],
                ['F&B suitability', 0.85],
                ['Overall leasability', 0.86, 'highlight']
            ],
            aiSummary: 'This is a <strong>top-decile Parnell Village retail premise</strong>. The wide frontage, evidence of prior F&B fit-out, and 4 included car parks make it well-suited for a hospitality operator. Walter rates this in the 88th percentile of Parnell retail vacancies over the last 24 months. Strong likelihood of leasing within 4-6 weeks if marketed to the right operator pool.',
            wallaceTitle: 'Wallace has matched 5 tenant prospects',
            wallaceDesc: 'Wallace cross-referenced this Parnell Village location with active tenant searches, growing F&B operators, and flagged retailers with expansion signals from the Bayleys CRM, LinkedIn hiring data, and OpenClaw business activity feeds.',
            wallaceCta: 'Send all 5 tenant intros via Zara',
            wallaceHigh: [
                { score: 94, name: 'Bestie Café Group', tag: 'Boutique café operator · Expanding · 4 sites', criteria: ['Active Parnell search','Fit-out budget $200k+','Existing F&B fit-out preferred','High foot-traffic mandate'], contact: 'Olivia Park · 021 442 8801' },
                { score: 89, name: 'Honest Burgers NZ', tag: 'UK chain entering NZ · 6-site Auckland rollout', criteria: ['Parnell shortlisted','Wants 180-250 sqm','Ground-floor priority','3-year fit-out amortisation'], contact: 'Via Anish Mehta' },
                { score: 85, name: 'Major & Tom Boutique', tag: 'Premium fashion retailer · Ponsonby flagship', criteria: ['Second site planned','Wide-frontage requirement','Affluent catchment'], contact: 'Sasha Reed · 027 XXX 6633' }
            ],
            wallaceLow: [
                { score: 76, name: 'Coco Espresso', tag: 'Specialty coffee · 3 cafés', criteria: ['Active Parnell scout','Strong covenant'], cons: ['Budget below market for premises'], contact: 'Via Wallace signal' },
                { score: 68, name: 'Nordic Kitchen Concept', tag: 'Pop-up to permanent F&B', criteria: ['Parnell resonance','First permanent site'], cons: ['No previous F&B operator history','Bond may need to be increased'], contact: 'Walter signal · Cold' }
            ],
            molloyDesc: 'Molloy has identified 4 ways to maximise the rent and capital position of this premises through targeted leasing strategy.',
            molloyCards: [
                { title: 'Hospitality fit-out incentive package', body: 'Marketing as a turn-key F&B opportunity with a <strong>$60-80k landlord contribution</strong> to fit-out can attract a higher-quality covenant and command a 15-20% rent premium over a vanilla retail letting.', impactLabel: 'Net rent uplift over 6yr term', impactValue: '+$120k – $180k' },
                { title: 'Bundle parking as a revenue line', body: 'The 4 stacked car parks can be offered separately at <strong>$40-50/wk per bay</strong> to nearby office tenants outside hospitality hours. Alternatively, charge them into the lease as an inclusion premium.', impactLabel: 'Additional annual income', impactValue: '+$8.3k – $10.4k p.a.' },
                { title: 'Mezzanine / first-floor add-on', body: 'High stud interior allows for a structural mezzanine adding ~60 sqm of ancillary space. Particularly suits a café/restaurant needing back-of-house storage or office.', impactLabel: 'Capital cost vs uplift', impactValue: '$140k / +$32k rent p.a.' },
                { title: 'Heritage awning + facade refresh', body: 'A coordinated facade refresh ($45-65k) lifts the leasability rating from 0.86 to ~0.93 and signals to operators that the landlord invests in their tenancies.', impactLabel: 'Lease-up time saving', impactValue: '~3 weeks faster' }
            ],
            molloySummary: [
                ['Standard market rent (est.)', '$520 / sqm'],
                ['Optimised rent target', '$595 – $640 / sqm'],
                ['Total revenue uplift', '+$15.6k – $25k p.a.', 'highlight']
            ]
        },

        henrytayler: {
            badge: 'Retail · Investment',
            badgeClass: 'retail',
            breadCity: 'Rodney',
            breadType: 'Retail Investment',
            title: '2 & 12 Henry Tayler Rise',
            sub: 'Wainui, Rodney, Auckland · Listing #67039188',
            priceLabel: 'Method of sale',
            priceValue: 'By Negotiation',
            priceSub: '6.0% net yield · Two freehold titles',
            images: ['listing-wainui.jpg', 'wainui-01.jpg', 'wainui-02.jpg', 'wainui-03.jpg', 'wainui-04.jpg', 'wainui-05.jpg'],
            heroFallback: 'listing-wainui.jpg',
            metrics: [
                ['Combined Floor', '1,337', 'sqm'],
                ['Combined Land', '1,798', 'sqm'],
                ['Net Income', '$754', 'k p.a.'],
                ['Yield', '6.0', '% net'],
                ['Tenants', '14', 'in total'],
                ['Zoning', 'Local', 'Centre']
            ],
            overviewTitle: 'Investment Highlights',
            overview: `<p class="cl-body-text">Two fully-leased freehold neighbourhood retail investments on adjacent prominent corner sites directly opposite Waterloo Reserve. Combined annual income of <strong>$754,903 p.a. + GST</strong> from 14 essential-services tenants including <strong>Juno Café, Pizza Hut, Superette, Ray White, Fulton Hogan</strong> and others.</p>
                       <p class="cl-body-text">Located in the Milldale growth corridor, with the local catchment forecasted to reach 15,000+ residents and 4,000+ dwellings on completion. Mix of cash bonds and bank guarantees, fixed annual or CPI-linked rent reviews. High-quality development by Broadway Property Group.</p>`,
            summaryTitle: 'Investment Summary',
            summary: [
                ['Sites', '2 & 12 Henry Tayler Rise (separate titles)'],
                ['Combined Floor Area', '1,337 sqm (819 + 518)'],
                ['Combined Land Area', '1,798 sqm (994 + 804)'],
                ['Total Tenants', '14 (8 + 6)'],
                ['Annual Income', '$754,903 + GST'],
                ['Yield', '6.0% net'],
                ['Lease Security', 'Cash bonds + bank guarantees'],
                ['Rent Reviews', 'Fixed annual or CPI-linked']
            ],
            agent: { initials: 'SC', name: 'Shoneet Chand', role: 'Licensee Salesperson', office: 'Colliers New Zealand', agency: 'Colliers', phone: '021 400 765' },
            locStats: [
                ['Forecast catchment population', '15,000+'],
                ['Forecast dwellings', '4,000+'],
                ['Distance to Waterloo Reserve', '0m (opposite)'],
                ['Tenancy occupancy', '100%']
            ],
            aiScanText: 'Visual + tenancy mix analysis complete',
            aiDesc: "Walter's models analysed both buildings together with the surrounding Milldale growth corridor demographics to score this as a defensive neighbourhood retail income asset.",
            aiFeatures: [
                'Two adjacent corner sites with dual street frontage',
                'Modern build by Broadway Property Group (2021)',
                'Prominent positioning opposite reserve',
                'Essential-services tenant mix (food, services, real estate)',
                'Generous on-site parking across both sites',
                'Anchor tenants: Juno Café, Pizza Hut, Superette',
                'High-traffic intersection with good sightlines',
                'Within Milldale master-planned community'
            ],
            aiScores: [
                ['Tenant covenant strength', 0.86],
                ['Location resilience', 0.92],
                ['Lease length distribution', 0.78],
                ['Building condition (modern build)', 0.95],
                ['Overall PCI', 0.88, 'highlight']
            ],
            aiSummary: 'This is a <strong>defensive neighbourhood retail investment</strong> in one of Rodney\'s fastest-growing master-planned communities. The combination of essential-services tenant mix, modern build, and forecast 4,000+ dwellings nearby gives it strong income resilience. Walter rates the asset class in the 90th percentile for syndicated buyers and family offices targeting $10-15M passive investments.',
            wallaceTitle: 'Wallace has matched 6 buyer prospects',
            wallaceDesc: 'Wallace identified buyers actively searching for sub-$15M passive neighbourhood retail with strong tenant covenants and growing demographic catchments.',
            wallaceCta: 'Send all 6 intros via Zara',
            wallaceHigh: [
                { score: 95, name: 'Northland Syndicate Partners', tag: 'Passive investor · Sub-$15M tickets · Yield-driven', criteria: ['Active retail mandate','6%+ yield target','Multi-tenant preferred','Auckland fringe focus'], contact: 'Andrew Carmichael · 021 XXX 9912' },
                { score: 91, name: 'Oyster Property Group', tag: 'Property fund manager · Diversified retail', criteria: ['Looking for Rodney exposure','Expansion phase','Buys $10-25M','Modern build preferred'], contact: 'Via Mark Schiele' },
                { score: 87, name: 'Maitland Family Office', tag: 'HNWI · Generational hold strategy', criteria: ['Defensive income preference','Essential-services tenants','Dual title appeal','15-20yr horizon'], contact: 'Sarah Maitland · 027 XXX 4422' }
            ],
            wallaceLow: [
                { score: 79, name: 'Augusta Capital', tag: 'Listed property fund · Retail subsection', criteria: ['Auckland fringe interest','Yield mandate'], cons: ['Typically buys $20M+'], contact: 'Via Mark Francis' },
                { score: 74, name: 'PMG Generation Fund', tag: 'Diversified syndicate', criteria: ['Active retail buyer','Growth corridor focus'], cons: ['Currently fully deployed'], contact: 'Via Daniel Lem' },
                { score: 69, name: 'Hong Kong Family Office', tag: 'Offshore HNWI · OIA approval needed', criteria: ['Strong AKL appetite','Yield 6%+ matches mandate'], cons: ['OIA process adds 60-90 days'], contact: 'Walter signal · OIA flagged' }
            ],
            molloyDesc: 'Molloy has identified 4 value-add pathways to take this from a 6.0% passive yield play to a 6.8-7.4% optimised position over the next 24 months.',
            molloyCards: [
                { title: 'Lease re-gear: extend WALE on top 4 tenants', body: 'Approach <strong>Juno Café, Pizza Hut, Superette and Ray White</strong> with extension proposals 6 months before their first review. Locking in 5-year extensions adds significant capital value via WALE expansion.', impactLabel: 'WALE uplift impact on cap rate', impactValue: '~25 bps tightening' },
                { title: 'Single-title consolidation', body: 'Two separate freehold titles add legal complexity for buyers. Consolidating into a single title before sale (or marketing as a parcel) appeals to a wider institutional buyer pool.', impactLabel: 'Buyer pool expansion', impactValue: '+30% interest est.' },
                { title: 'Solar PV + tenant rebill', body: 'Modern build with large north-facing rooflines suits a 80-100kW solar installation. Sub-meter and rebill tenants at retail rate &mdash; net positive cash flow plus ESG marketing edge.', impactLabel: 'Annual net income', impactValue: '+$18-24k p.a.' },
                { title: 'Outdoor seating activation (Juno + Pizza Hut)', body: 'Convert footpath area opposite the reserve into licensed outdoor seating for the F&B tenants. Increases their rent capacity at next review by 8-12%.', impactLabel: 'Rent uplift at next review', impactValue: '+$12-18k p.a.' }
            ],
            molloySummary: [
                ['Current net income', '$754,903'],
                ['Optimised position (24 months)', '$795k – $815k'],
                ['Implied capital value uplift', '+$700k – $1.0M', 'highlight']
            ]
        },

        jervois: {
            badge: 'Development · Tender',
            badgeClass: 'retail',
            breadCity: 'Auckland Central',
            breadType: 'Development Site',
            title: '10-12 Jervois Road',
            sub: 'Ponsonby, Auckland · Listing #1780211',
            priceLabel: 'Method of sale',
            priceValue: 'Tender',
            priceSub: 'Resource consent granted · Freehold development site',
            images: ['listing-jervois.jpg'],
            heroFallback: 'listing-jervois.jpg',
            metrics: [
                ['Existing Floor', '307', 'sqm'],
                ['Land Area', '847', 'sqm'],
                ['Consent', '5', 'storey'],
                ['Apartments', '15', 'units'],
                ['Retail', '4', 'units'],
                ['Position', 'Three', 'Lamps corner']
            ],
            overviewTitle: 'Development Highlights',
            overview: `<p class="cl-body-text">A rare freehold development site in one of central Ponsonby's last remaining sizeable holdings. High-profile corner position within the popular <strong>Three Lamps precinct</strong> with extensive frontages to both Jervois Road and Redmond Street.</p>
                       <p class="cl-body-text">Resource Consent has been granted for the construction of a <strong>five-storey apartment building with basement car parking</strong>. The ground floor comprises 4 retail units with 15 apartment units across the upper levels. Strategically centered amongst an array of upmarket cafés, bars and retail with a surrounding population that is both established and affluent.</p>`,
            summaryTitle: 'Site & Consent Summary',
            summary: [
                ['Site Area', '847 sqm freehold'],
                ['Existing Building', '307 sqm (vacant possession)'],
                ['Consent Status', 'Granted'],
                ['Consent Type', '5-storey mixed-use + basement parking'],
                ['Approved Apartments', '15 units'],
                ['Approved Retail', '4 ground-floor units'],
                ['Sale Method', 'Tender'],
                ['Holding Position', 'Three Lamps corner']
            ],
            agent: { initials: 'JM', name: 'James Macready', role: 'Director, Commercial', office: 'Bayleys Auckland Central', agency: 'Bayleys', phone: '021 415 091' },
            locStats: [
                ['Three Lamps daily traffic', '14,200 vehicles'],
                ['Cafés / bars within 300m', '38'],
                ['Median household income (Ponsonby)', '$148k'],
                ['Apartment median sale (300m)', '$1.45M']
            ],
            aiScanText: 'Visual + zoning + comparable site analysis complete',
            aiDesc: "Walter's models analysed the consented scheme drawings, the comparable Ponsonby development sales, and apartment absorption rates in the surrounding 500m to value this development opportunity.",
            aiFeatures: [
                'Corner site with dual frontage (Jervois Rd + Redmond St)',
                'High-profile Three Lamps positioning',
                'Existing 1920s commercial villa — character demolition pathway clear',
                'Resource consent granted — 4-6 month time saving for buyer',
                'Five-storey scheme maximises height envelope',
                'Basement car parking = 16-18 spaces',
                'Walking distance to Ponsonby Road retail strip',
                'Positioned amongst upmarket F&B operators'
            ],
            aiScores: [
                ['Site geometry / efficiency', 0.91],
                ['Location desirability', 0.96],
                ['Consent value (time saving)', 0.88],
                ['Apartment absorption potential', 0.89],
                ['Overall development score', 0.91, 'highlight']
            ],
            aiSummary: 'This is a <strong>top-tier Ponsonby development opportunity</strong>. The combination of the consented scheme, the corner site, and the Three Lamps location places it in the 95th percentile of central Auckland development sites. Strong matches across local boutique developers and value-add residential funds. Apartment yield in the area supports an end-value of $22-26M based on consented unit count.',
            wallaceTitle: 'Wallace has matched 5 developer prospects',
            wallaceDesc: 'Wallace cross-referenced active boutique developer searches, value-add residential funds, and known Ponsonby specialists across the Bayleys network.',
            wallaceCta: 'Send all 5 developer intros via Zara',
            wallaceHigh: [
                { score: 96, name: 'Williams Corporation', tag: 'Boutique residential developer · Multi-site', criteria: ['Active Ponsonby search','Consent-ready preference','15-25 unit sweet spot','$8-12M land budget'], contact: 'Matthew Horncastle · 021 XXX 7711' },
                { score: 92, name: 'Conrad Properties', tag: 'Mixed-use specialist · Consent expertise', criteria: ['Three Lamps focus','5-storey scheme expertise','Strong banking position'], contact: 'Via Conrad Brown' },
                { score: 88, name: 'Wallace Development Fund', tag: 'Closed-end residential development fund', criteria: ['Currently raising new fund','Consent-derisked sites only','15-20 unit profile fit'], contact: 'Sarah Wallace · 027 XXX 3344' }
            ],
            wallaceLow: [
                { score: 78, name: 'Du Val Group', tag: 'BTR specialist · Ponsonby track record', criteria: ['Active development pipeline','Three Lamps area expertise'], cons: ['Currently focused on larger sites'], contact: 'Via Charlotte Connell' },
                { score: 71, name: 'Singapore Family Office', tag: 'Offshore developer · OIA approval needed', criteria: ['NZ entry mandate','Premium AKL focus'], cons: ['OIA timeline risk','First NZ project'], contact: 'Walter signal · OIA flagged' }
            ],
            molloyDesc: 'Molloy has identified 4 ways to extract maximum value from this development site beyond the as-consented scheme.',
            molloyCards: [
                { title: 'Plan-change to 6-storey scheme', body: 'The Auckland Unitary Plan supports up to 6 storeys in this precinct subject to design controls. A variation to add <strong>3-4 additional apartments</strong> via a 6th storey could be lodged within 6 months at a cost of ~$120k consent fees.', impactLabel: 'End-value uplift', impactValue: '+$2.4M – $3.2M' },
                { title: 'Pre-sell apartments off-the-plan', body: 'Ponsonby off-plan apartments are achieving <strong>$14,500 – $16,800/sqm</strong>. Pre-selling 50% before construction reduces banking margins and accelerates the project IRR significantly.', impactLabel: 'Equity reduction', impactValue: '~40% less capital required' },
                { title: 'Premium retail tenancy positioning', body: 'The 4 retail units sit on a Three Lamps corner. Marketing to <strong>premium F&B operators</strong> (not chains) targets $700-850/sqm rents vs the $480-520/sqm assumed in the consent feasibility.', impactLabel: 'Annual retail rent uplift', impactValue: '+$95k – $130k p.a.' },
                { title: 'Heritage facade retention pathway', body: 'Retaining and restoring the existing 1920s villa facade reduces objector risk, fast-tracks consent variations, and may unlock heritage incentives. Adds character that lifts apartment pricing by 4-7%.', impactLabel: 'Apartment pricing premium', impactValue: '+$880k – $1.5M' }
            ],
            molloySummary: [
                ['Current land value (as consented)', '$8.2M – $9.4M'],
                ['Optimised value-add pathway', '$11.0M – $13.8M'],
                ['Total upside opportunity', '+$2.8M – $4.4M', 'highlight']
            ]
        },

        dacre: {
            badge: 'Office · CBD Fringe',
            badgeClass: 'office',
            breadCity: 'Auckland Central',
            breadType: 'Office / Development',
            title: '31-35 Dacre Street',
            sub: 'Newton, Auckland · Listing #1780259',
            priceLabel: 'Method of sale',
            priceValue: 'By Negotiation',
            priceSub: 'Last sold $7.4M · Mostly vacant possession',
            images: ['listing-dacre.jpg'],
            heroFallback: 'listing-dacre.jpg',
            metrics: [
                ['Floor Area', '1,533', 'sqm'],
                ['Land Area', '912', 'sqm'],
                ['Office (L1)', '870', 'sqm'],
                ['Warehouse', '318', 'sqm'],
                ['Height Limit', '35', 'metres'],
                ['Zoning', 'City', 'Centre']
            ],
            overviewTitle: 'Site & Building Highlights',
            overview: `<p class="cl-body-text">A two-level freehold standalone office/warehouse building with car parking on a 912 sqm landholding with wide road frontage. The building features <strong>870 sqm of contemporary first-floor office</strong> plus 318 sqm of warehousing &mdash; an extensively refurbished 1960s structure offering immediate occupier or holding-income utility.</p>
                       <p class="cl-body-text">Zoned <strong>City Centre</strong>, enabling the most intensive development permitted under the Auckland Unitary Plan up to a height limit of 35 metres. Strategic CBD-fringe positioning a few hundred metres from the future Karangahape CRL station &mdash; expected to drive significant uplift in surrounding commercial property activity.</p>`,
            summaryTitle: 'Property Summary',
            summary: [
                ['Building Type', 'Two-level office + warehouse'],
                ['Total Floor Area', '1,533 sqm'],
                ['First Floor Office', '870 sqm contemporary'],
                ['Warehouse', '318 sqm'],
                ['Land Area', '912 sqm freehold'],
                ['Zoning', 'City Centre · 35m height'],
                ['Last Sold', '$7.4M (mostly vacant)'],
                ['Possession', 'Mostly vacant — owner occupier ready']
            ],
            agent: { initials: 'TR', name: 'Tonia Robertson', role: 'Director, Commercial', office: 'Bayleys Auckland Central', agency: 'Bayleys', phone: '021 466 094' },
            locStats: [
                ['Distance to K Rd CRL station', '~400m'],
                ['CRL opening', '2026'],
                ['Office vacancy (Newton/CBD fringe)', '6.8%'],
                ['Average $/sqm (CBD fringe office)', '$385']
            ],
            aiScanText: 'Visual + zoning + CRL impact analysis complete',
            aiDesc: "Walter's models analysed the building condition, the City Centre zoning envelope, and the Karangahape CRL station's projected uplift on surrounding sites to score this as a dual-use opportunity.",
            aiFeatures: [
                'Wide road frontage with strong sightlines',
                'Contemporary first-floor office refurb (recently completed)',
                'Original 1960s structural shell — sound condition',
                'On-site car parking',
                'Warehouse component allows mixed occupier use',
                'Two-level configuration with separate access',
                'Within walking distance of K Road CRL station',
                'City Centre zoning unlocks 35m height envelope'
            ],
            aiScores: [
                ['Office finish quality', 0.84],
                ['Building structural integrity', 0.78],
                ['Site development potential', 0.94],
                ['CRL proximity impact', 0.92],
                ['Overall opportunity score', 0.87, 'highlight']
            ],
            aiSummary: 'This is a <strong>dual-purpose CBD-fringe asset</strong>. In the short-term it offers an owner-occupier or income holder a refurbished office with warehousing &mdash; in the medium-term it presents a major development site one block from the Karangahape CRL station. Walter places it in the 92nd percentile of City Centre zoned sites for development optionality, with expected land value uplift of 12-18% over 24 months as CRL opens.',
            wallaceTitle: 'Wallace has matched 5 buyer prospects across two strategies',
            wallaceDesc: "Wallace identified two distinct buyer pools: owner-occupiers needing CBD-fringe office now, and developers/funds positioning ahead of the CRL station's opening.",
            wallaceCta: 'Send all 5 intros via Zara',
            wallaceHigh: [
                { score: 94, name: 'Acme Architects Ltd', tag: 'Owner-occupier · Outgrowing K Rd lease', criteria: ['800-1,200 sqm requirement','CBD fringe priority','Owner-occupy budget $7-9M','Q3 occupation target'], contact: 'David Linton · 021 XXX 5566' },
                { score: 90, name: 'Newcrest Property Fund', tag: 'Value-add development fund · CRL play', criteria: ['Active K Rd CRL search','Holding income required','3-5 year develop horizon','$6-10M land value mandate'], contact: 'Via Henry Cooper' },
                { score: 86, name: 'Lockwood Industries Ltd', tag: 'ASX-listed firm · NZ HQ relocation', criteria: ['1,200-1,500 sqm need','Brand visibility important','Long-stay occupier'], contact: 'Sasha Bishop · 027 XXX 8800' }
            ],
            wallaceLow: [
                { score: 78, name: 'CrL-Proximity Land Trust', tag: 'Land bank syndicate · CRL stations focus', criteria: ['Specifically targeting K Rd','Long horizon hold','Holding income tolerance'], cons: ['Slower decision-making'], contact: 'Via Walter signal' },
                { score: 72, name: 'Korean Construction Group', tag: 'Offshore developer · NZ entry', criteria: ['Active AKL site search','Strong financial position'], cons: ['OIA process','First NZ project'], contact: 'Via Walter signal' }
            ],
            molloyDesc: 'Molloy has identified 4 value-add pathways across the dual office-occupier and development scenarios.',
            molloyCards: [
                { title: 'Lease + hold strategy', body: 'Lease the refurbished office at <strong>$420-450/sqm</strong> for a 3-year term with right to terminate for development. Generates ~$390k holding income while CRL completes and surrounding sites trade up.', impactLabel: '36-month holding income', impactValue: '$1.17M – $1.25M' },
                { title: 'Resource consent application now', body: 'Lodging a resource consent for a <strong>9-storey mixed-use scheme</strong> (residential above podium retail) before CRL opens captures the development upside without exposure to construction. A consented site is worth 25-35% more.', impactLabel: 'Land value uplift on consent', impactValue: '+$1.8M – $2.6M' },
                { title: 'Ground-floor warehouse → retail conversion', body: 'The 318 sqm warehouse can be reconfigured as <strong>2 retail units</strong> with frontage to Dacre Street. K Rd-style operators (specialty F&B, boutique fitness) will pay $550-620/sqm rents.', impactLabel: 'Annual rent uplift on warehouse area', impactValue: '+$80k – $115k p.a.' },
                { title: 'CRL-station-opening sale window', body: 'The optimum sale window is <strong>6-12 months after CRL opens</strong>. Walter\'s models suggest sites within 500m of new CRL stations have historically appreciated 14-22% in the year following opening.', impactLabel: 'Capital value uplift (CRL effect)', impactValue: '+$1.0M – $1.6M' }
            ],
            molloySummary: [
                ['Current asking (estimated)', '$8.5M – $9.2M'],
                ['Post value-add + CRL opening', '$11.5M – $13.6M'],
                ['Total upside opportunity', '+$3.0M – $4.4M', 'highlight']
            ]
        },

        manukau: {
            badge: 'Retail · Investment',
            badgeClass: 'industrial',
            breadCity: 'Franklin',
            breadType: 'Retail Investment',
            title: '162 Manukau Road',
            sub: 'Pukekohe, Franklin · Listing #1906577',
            priceLabel: 'Method of sale',
            priceValue: 'By Negotiation',
            priceSub: 'Fully tenanted · High-profile main road position',
            images: ['listing-manukau.jpg'],
            heroFallback: 'listing-manukau.jpg',
            metrics: [
                ['Floor Area', '389', 'sqm'],
                ['Annual Income', '$55', 'k + GST'],
                ['Tenancy', 'Fully', 'leased'],
                ['Position', 'Main', 'road'],
                ['Type', 'Retail', 'investment'],
                ['Title', 'Free', 'hold']
            ],
            overviewTitle: 'Investment Highlights',
            overview: `<p class="cl-body-text">A <strong>fully tenanted commercial investment</strong> in a high-profile position on Pukekohe's busiest road. 389 sqm of retail space returning <strong>$55,000 + GST</strong> per annum from established local operators with long-standing tenancy histories.</p>
                       <p class="cl-body-text">Entry-level pricing makes this an ideal first commercial asset for new investors entering the market. Pukekohe is the fastest-growing satellite town in the Auckland region, with the local industrial and retail sectors both seeing sustained rental growth driven by population inflows and the Franklin growth corridor.</p>`,
            summaryTitle: 'Investment Summary',
            summary: [
                ['Floor Area', '389 sqm'],
                ['Annual Income', '$55,000 + GST'],
                ['Tenancies', 'Fully leased'],
                ['Tenant Type', 'Local established operators'],
                ['Position', 'Pukekohe main road'],
                ['Title', 'Freehold'],
                ['Sale Method', 'By Negotiation'],
                ['Listing Source', 'Bayleys Pukekohe']
            ],
            agent: { initials: 'GG', name: 'Gareth Gibson', role: 'Sales Manager, Pukekohe', office: 'Bayleys Pukekohe', agency: 'Bayleys', phone: '021 822 200' },
            locStats: [
                ['Pukekohe population (2025)', '32,400'],
                ['Pop growth (5yr)', '+18.4%'],
                ['Manukau Rd daily traffic', '21,800 vehicles'],
                ['Retail vacancy (Pukekohe)', '3.1%']
            ],
            aiScanText: 'Visual + Pukekohe market analysis complete',
            aiDesc: "Walter's models analysed Pukekohe retail trends, Manukau Road foot/vehicle traffic, and comparable entry-level investment sales to score this opportunity for first-time commercial investors.",
            aiFeatures: [
                'Wide street frontage on Pukekohe\'s arterial road',
                'Multi-tenant configuration (income diversification)',
                'Free-standing or attached retail (visual analysis)',
                'On-street parking + likely rear parking',
                'Established tenants with operating histories',
                'Modern signage opportunities',
                'Walking distance to Pukekohe town centre',
                'Surrounded by complementary retail/services'
            ],
            aiScores: [
                ['Tenant covenant strength', 0.74],
                ['Location traffic exposure', 0.88],
                ['Building condition', 0.72],
                ['Entry-level affordability', 0.96],
                ['Overall opportunity score', 0.82, 'highlight']
            ],
            aiSummary: 'A solid <strong>entry-level commercial investment</strong> in NZ\'s fastest-growing satellite town. The 3.1% retail vacancy rate, 18.4% population growth, and high traffic exposure on Manukau Road make this a defensible income asset. Walter rates this in the 78th percentile of sub-$1.5M commercial investments nationally. Best fit for first-time commercial investors and SMSF buyers seeking yield with growth.',
            wallaceTitle: 'Wallace has matched 5 buyer prospects',
            wallaceDesc: 'Wallace cross-referenced first-time commercial investors, SMSF buyers seeking sub-$1.5M assets, and Pukekohe-focused regional investors across the Bayleys CRM.',
            wallaceCta: 'Send all 5 intros via Zara',
            wallaceHigh: [
                { score: 92, name: 'Patel Family SMSF', tag: 'First commercial purchase · Self-managed super', criteria: ['Sub-$1.5M budget','Yield-focused','Auckland fringe acceptable','Hands-off preference'], contact: 'Raj Patel · 021 XXX 4422' },
                { score: 88, name: 'Franklin Retail Trust', tag: 'Local syndicate · Pukekohe portfolio', criteria: ['Active Manukau Rd search','Local operator preference','Long hold mandate','5-7% yield range'], contact: 'Via Mike Reid' },
                { score: 84, name: 'Stevens Investments Ltd', tag: 'Doctor SMSF buyer · 4 commercial assets', criteria: ['Adding to existing portfolio','Manukau Rd familiarity','Modest covenant tolerance'], contact: 'Dr Greg Stevens · 027 XXX 9921' }
            ],
            wallaceLow: [
                { score: 76, name: 'First-Time Buyer Pipeline', tag: '14 first-time investors on Bayleys watchlist', criteria: ['Sub-$1.5M criteria match','Pukekohe interest from 5'], cons: ['Education cycle required'], contact: 'Walter signal · Group nurture' },
                { score: 70, name: 'Franklin Maori Land Trust', tag: 'Iwi commercial diversification', criteria: ['Local rohe asset','Cultural alignment'], cons: ['Slow decision process'], contact: 'Via Te Aroha Henare' }
            ],
            molloyDesc: 'Molloy has identified 4 ways to optimise this entry-level retail investment for income and capital growth over 5 years.',
            molloyCards: [
                { title: 'Rent review benchmarking', body: 'Current rent of <strong>$141/sqm</strong> is below the Pukekohe Manukau Road benchmark of $165-$185/sqm. Restructuring leases to market on next review unlocks meaningful uplift.', impactLabel: 'Rent uplift on next reviews', impactValue: '+$9k – $17k p.a.' },
                { title: 'Signage rental income', body: 'Manukau Road sees <strong>21,800 vehicles per day</strong>. The roof and side wall support a leased billboard or pole-sign tenancy at $4-7k p.a. &mdash; pure incremental income.', impactLabel: 'Annual signage income', impactValue: '+$4k – $7k p.a.' },
                { title: 'Cosmetic refurbishment', body: 'Visual analysis suggests the building would benefit from a <strong>$25-40k cosmetic refresh</strong> (paint, signage, awning). This protects existing rents and enables a market-rate review at next renewal.', impactLabel: 'Rent retention + uplift', impactValue: '~$8k p.a. avoided loss' },
                { title: 'Subdivide title for resale', body: 'The 389 sqm building could be strata-titled into 2 separate retail units, broadening the buyer pool and enabling an arbitrage between bulk and individual sale values.', impactLabel: 'Strata sale uplift', impactValue: '+$120k – $180k' }
            ],
            molloySummary: [
                ['Current asking (estimated)', '$1.05M – $1.20M'],
                ['Post value-add 5yr position', '$1.40M – $1.65M'],
                ['Total upside opportunity', '+$350k – $550k', 'highlight']
            ]
        }
    };

    let clCurrentListing = 'carlisle';
    let clCurrentImgIdx = 0;

    const clHeroImg = document.getElementById('clHeroImg');
    const clImgCounter = document.getElementById('clImgCounter');
    const clImgTotal = document.getElementById('clImgTotal');
    const clCounterWrap = document.getElementById('clCounterWrap');
    const clThumbsContainer = document.getElementById('clThumbs');
    const clPrevBtn = document.getElementById('clPrevImg');
    const clNextBtn = document.getElementById('clNextImg');

    function clShowImg(idx) {
        const data = LISTING_DATA[clCurrentListing];
        if (!data) return;
        const imgs = data.images || [data.heroFallback];
        if (idx < 0) idx = imgs.length - 1;
        if (idx >= imgs.length) idx = 0;
        clCurrentImgIdx = idx;
        if (clHeroImg) clHeroImg.src = imgs[idx];
        if (clImgCounter) clImgCounter.textContent = idx + 1;
        document.querySelectorAll('#clThumbs .cl-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
    }

    function clRenderGallery(data) {
        const imgs = data.images || [data.heroFallback];
        // Hero image
        if (clHeroImg) clHeroImg.src = imgs[0];
        // Thumb strip
        if (clThumbsContainer) {
            if (imgs.length > 1) {
                clThumbsContainer.innerHTML = imgs.map((src, i) =>
                    `<img src="${src}" alt="" class="cl-thumb${i === 0 ? ' active' : ''}" data-img="${src}">`
                ).join('');
                clThumbsContainer.style.display = '';
                // Wire thumb clicks
                clThumbsContainer.querySelectorAll('.cl-thumb').forEach((thumb, i) => {
                    thumb.addEventListener('click', () => clShowImg(i));
                });
                // Show counter, prev/next
                if (clCounterWrap) clCounterWrap.style.display = '';
                if (clPrevBtn) clPrevBtn.style.display = '';
                if (clNextBtn) clNextBtn.style.display = '';
                if (clImgTotal) clImgTotal.textContent = imgs.length;
                if (clImgCounter) clImgCounter.textContent = '1';
            } else {
                clThumbsContainer.innerHTML = '';
                clThumbsContainer.style.display = 'none';
                if (clCounterWrap) clCounterWrap.style.display = 'none';
                if (clPrevBtn) clPrevBtn.style.display = 'none';
                if (clNextBtn) clNextBtn.style.display = 'none';
            }
        }
    }

    function clRenderMatch(m, isHigh) {
        const score = m.score;
        const cls = score >= 85 ? 'high' : 'medium';
        const criteriaHtml = (m.criteria || []).map(c => `<span><span class="step-dot done" style="display:inline-block;width:6px;height:6px;margin-right:4px;vertical-align:middle"></span>${c}</span>`).join('');
        const consHtml = (m.cons || []).map(c => `<span>&#10008; ${c}</span>`).join('');
        return `
            <div class="cl-match-row">
                <div class="cl-match-score ${cls}">${score}%</div>
                <div class="cl-match-info">
                    <div class="cl-match-name">${m.name}</div>
                    <div class="cl-match-tag">${m.tag}</div>
                    <div class="cl-match-criteria">
                        ${criteriaHtml}
                        ${consHtml}
                    </div>
                </div>
                <div class="cl-match-actions">
                    <div class="cl-match-contact">${m.contact}</div>
                    <button class="cl-match-btn">Send intro</button>
                </div>
            </div>
        `;
    }

    function populateListingModal(id) {
        const data = LISTING_DATA[id];
        if (!data) return;
        clCurrentListing = id;
        clCurrentImgIdx = 0;

        // Gallery
        clRenderGallery(data);

        // Hero badge
        const heroBadge = document.getElementById('clHeroBadge');
        if (heroBadge) {
            heroBadge.textContent = data.badge;
            heroBadge.className = 'cl-gallery-badge ' + (data.badgeClass || 'office');
        }

        // Header
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText('clBreadCity', data.breadCity);
        setText('clBreadType', data.breadType);
        setText('clTitle', data.title);
        setText('clSubMeta', data.sub);
        setText('clPriceLabel', data.priceLabel);
        setText('clPriceValue', data.priceValue);
        setText('clPriceSub', data.priceSub);

        // Metrics
        const metricsEl = document.getElementById('clMetrics');
        if (metricsEl) {
            metricsEl.innerHTML = (data.metrics || []).map(([label, value, unit]) =>
                `<div class="cl-metric">
                    <span class="cl-metric-label">${label}</span>
                    <span class="cl-metric-value">${value} <em>${unit}</em></span>
                </div>`
            ).join('');
        }

        // Overview tab
        setText('clOverviewTitle', data.overviewTitle);
        const overviewBody = document.getElementById('clOverviewBody');
        if (overviewBody) overviewBody.innerHTML = data.overview;

        setText('clSummaryTitle', data.summaryTitle);
        const summaryDL = document.getElementById('clSummaryDL');
        if (summaryDL) {
            summaryDL.innerHTML = (data.summary || []).map(([dt, dd]) =>
                `<dt>${dt}</dt><dd>${dd}</dd>`
            ).join('');
        }

        // Agent
        if (data.agent) {
            setText('clAgentInitials', data.agent.initials);
            setText('clAgentName', data.agent.name);
            setText('clAgentRole', data.agent.role);
            setText('clAgentOffice', data.agent.office);
            setText('clAgentPhone', data.agent.phone);
            const agencyEl = document.getElementById('clAgentAgency');
            if (agencyEl) {
                agencyEl.textContent = data.agent.agency;
                agencyEl.className = 'agency-tag ' + (data.agent.agency === 'Bayleys' ? 'bayleys' : 'colliers');
            }
        }

        // Location stats
        const locStatsEl = document.getElementById('clLocStats');
        if (locStatsEl) {
            locStatsEl.innerHTML = (data.locStats || []).map(([label, val]) =>
                `<div class="cl-loc-stat"><span>${label}</span><strong>${val}</strong></div>`
            ).join('');
        }

        // AI tab
        setText('clAiScanText', data.aiScanText);
        setText('clAiDesc', data.aiDesc);
        const aiFeaturesEl = document.getElementById('clAiFeatures');
        if (aiFeaturesEl) {
            aiFeaturesEl.innerHTML = (data.aiFeatures || []).map(f =>
                `<li><span class="cl-ai-dot positive"></span>${f}</li>`
            ).join('');
        }
        const aiScoresEl = document.getElementById('clAiScores');
        if (aiScoresEl) {
            aiScoresEl.innerHTML = (data.aiScores || []).map(([label, score, mod]) => {
                const pct = Math.round(score * 100);
                const isHighlight = mod === 'highlight';
                return `<div class="cl-ai-score${isHighlight ? ' highlight' : ''}">
                    <div class="cl-ai-score-top"><span>${isHighlight ? '<strong>' + label + '</strong>' : label}</span><strong>${score.toFixed(2)}</strong></div>
                    <div class="cl-ai-score-bar"><div class="cl-ai-score-fill${isHighlight ? ' premium' : ''}" style="width:${pct}%"></div></div>
                </div>`;
            }).join('');
        }
        const aiSummaryEl = document.getElementById('clAiSummary');
        if (aiSummaryEl) aiSummaryEl.innerHTML = data.aiSummary;

        // Wallace tab
        setText('clWallaceTitle', data.wallaceTitle);
        setText('clWallaceDesc', data.wallaceDesc);
        const wallaceCtaEl = document.getElementById('clWallaceCta');
        if (wallaceCtaEl) wallaceCtaEl.textContent = data.wallaceCta;
        const wallaceHighEl = document.getElementById('clWallaceHigh');
        if (wallaceHighEl) wallaceHighEl.innerHTML = (data.wallaceHigh || []).map(m => clRenderMatch(m, true)).join('');
        const wallaceLowEl = document.getElementById('clWallaceLow');
        if (wallaceLowEl) wallaceLowEl.innerHTML = (data.wallaceLow || []).map(m => clRenderMatch(m, false)).join('');

        // Molloy tab
        setText('clMolloyDesc', data.molloyDesc);
        const molloyCardsEl = document.getElementById('clMolloyCards');
        if (molloyCardsEl) {
            molloyCardsEl.innerHTML = (data.molloyCards || []).map((card, i) =>
                `<div class="cl-molloy-card">
                    <div class="cl-molloy-rank">${i + 1}</div>
                    <div class="cl-molloy-body">
                        <h5>${card.title}</h5>
                        <p>${card.body}</p>
                        <div class="cl-molloy-impact">
                            <span>${card.impactLabel}</span>
                            <strong>${card.impactValue}</strong>
                        </div>
                    </div>
                </div>`
            ).join('');
        }
        const molloySummaryEl = document.getElementById('clMolloySummary');
        if (molloySummaryEl) {
            molloySummaryEl.innerHTML = (data.molloySummary || []).map(([label, value, mod]) =>
                `<div class="cl-molloy-summary-row${mod === 'highlight' ? ' highlight' : ''}">
                    <span>${label}</span>
                    <strong>${value}</strong>
                </div>`
            ).join('');
        }

        // Reset to Overview tab
        document.querySelectorAll('.cl-tab').forEach(t => t.classList.toggle('active', t.dataset.clTab === 'overview'));
        document.querySelectorAll('.cl-tab-panel').forEach(p => p.classList.toggle('active', p.dataset.clPanel === 'overview'));
    }

    // Wire all listing cards to open the shared modal with their data
    document.querySelectorAll('.listing-card[data-listing]').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const id = card.dataset.listing;
            populateListingModal(id);
            carlisleModal?.classList.add('active');
        });
    });

    carlisleClose?.addEventListener('click', () => carlisleModal?.classList.remove('active'));
    carlisleModal?.addEventListener('click', (e) => {
        if (e.target === carlisleModal) carlisleModal.classList.remove('active');
    });

    clPrevBtn?.addEventListener('click', () => clShowImg(clCurrentImgIdx - 1));
    clNextBtn?.addEventListener('click', () => clShowImg(clCurrentImgIdx + 1));

    // Listing modal tabs (Overview / AI Analysis / Wallace / Molloy)
    document.querySelectorAll('.cl-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.cl-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.cl-tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panelKey = tab.dataset.clTab;
            document.querySelector(`.cl-tab-panel[data-cl-panel="${panelKey}"]`)?.classList.add('active');
        });
    });

    // Populate Carlisle by default
    populateListingModal('carlisle');

    // --- Listing action buttons ---
    // Strategy Card → close listing modal, open strategy card modal
    document.getElementById('clStrategyBtn')?.addEventListener('click', () => {
        carlisleModal?.classList.remove('active');
        document.getElementById('strategyModal')?.classList.add('active');
    });

    // Share with client → switch to a share confirmation in the modal
    document.getElementById('clShareBtn')?.addEventListener('click', () => {
        const title = document.getElementById('clTitle')?.textContent || 'Property';
        const btn = document.getElementById('clShareBtn');
        btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Email sent to client`;
        btn.style.background = '#10b981';
        btn.style.color = 'white';
        btn.style.borderColor = '#10b981';
        setTimeout(() => {
            btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share with client`;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2500);
    });

    // Book viewing → show a confirmation with Zara scheduling
    document.getElementById('clBookBtn')?.addEventListener('click', () => {
        const btn = document.getElementById('clBookBtn');
        btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Zara scheduling viewing`;
        btn.style.background = '#8b5cf6';
        btn.style.color = 'white';
        btn.style.borderColor = '#8b5cf6';
        setTimeout(() => {
            btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Viewing booked · Thu 2:30 PM`;
            btn.style.background = '#10b981';
            btn.style.borderColor = '#10b981';
        }, 1800);
    });

    // Export PDF → show download confirmation
    document.getElementById('clExportBtn')?.addEventListener('click', () => {
        const btn = document.getElementById('clExportBtn');
        btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> PDF downloaded`;
        btn.style.background = '#10b981';
        btn.style.color = 'white';
        btn.style.borderColor = '#10b981';
        setTimeout(() => {
            btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export PDF`;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2500);
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
            const addrEl = row.querySelector('.cell-primary');
            const addr = addrEl?.childNodes[0]?.textContent?.trim() || addrEl?.textContent?.trim() || '';
            // Extract row data for the overview
            const cells = row.querySelectorAll('td');
            const type = cells[1]?.textContent?.trim() || '';
            const tenant = cells[2]?.textContent?.trim() || '';
            const area = cells[3]?.textContent?.trim() || '';
            const rate = cells[4]?.textContent?.trim() || '';
            const expiry = cells[5]?.textContent?.trim() || '';
            const stickPct = row.querySelector('.stickiness-fill')?.style.width || '';
            const status = row.querySelector('.status-badge')?.textContent?.trim() || '';

            // Update meta chips
            const metaEl = document.getElementById('pdMeta');
            if (metaEl) {
                metaEl.innerHTML = `
                    <span class="pd-meta-chip"><strong>${type}</strong> · ${area} sqm</span>
                    <span class="pd-meta-chip">Tenant: ${tenant}</span>
                    <span class="pd-meta-chip">Stickiness: ${stickPct}</span>
                    <span class="pd-meta-chip">Lease expiry: ${expiry}</span>
                `;
            }

            // Update metrics row
            const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setText('pdMetricArea', area + ' sqm');
            setText('pdMetricRate', rate);
            setText('pdMetricStick', stickPct);
            setText('pdMetricStatus', status);

            openPropDrill(addr || 'Property', 'overview');
        });
    });

    // --- Deal Pipeline widget clicks ---
    document.querySelectorAll('.deal-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.dealAction;
            const property = item.dataset.dealProperty;
            if (action === 'hot') {
                openHeadsOfTerms(property);
            } else if (action === 'lease') {
                openLeaseAgreement(property);
            }
        });
    });

    // --- My Properties: add deal status indicators to matching rows ---
    const dealStatuses = [
        { address: 'Crummer', type: 'hot', status: 'hot-active', tooltip: 'HoT pending' },
        { address: 'Beaumont', type: 'lease', status: 'lease-active', tooltip: 'Lease signing' },
        { address: 'Osterley', type: 'hot', status: 'deal-complete', tooltip: 'HoT complete' },
        { address: 'Parnell', type: 'lease', status: 'deal-draft', tooltip: 'Lease draft' }
    ];

    document.querySelectorAll('#view-properties .properties-table tbody tr').forEach(row => {
        const addrCell = row.querySelector('.cell-primary');
        if (!addrCell) return;
        const addr = addrCell.textContent;
        const match = dealStatuses.find(d => addr.includes(d.address));
        if (match) {
            const dot = document.createElement('span');
            dot.className = 'prop-deal-dot';
            dot.innerHTML = `<span class="prop-deal-indicator ${match.status}"></span><span class="prop-deal-tooltip">${match.tooltip}</span>`;
            addrCell.appendChild(dot);
        }
    });

    // --- Wallace: activity action links ---
    document.querySelectorAll('.activity-action[data-listing]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.dataset.listing;
            switchView('listings');
            setTimeout(() => {
                const card = document.querySelector(`.listing-card[data-listing="${id}"]`);
                card?.click();
                // Switch to Wallace tab inside the modal
                setTimeout(() => {
                    const wallaceTab = document.querySelector('.cl-tab[data-cl-tab="wallace"]');
                    wallaceTab?.click();
                }, 400);
            }, 200);
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

    // --- Lease Agreement — Full Page View ---

    function openLeaseAgreement(address) {
        const titleEl = document.getElementById('laTitle');
        if (titleEl) titleEl.textContent = address || 'Property';
        // Reset to first section (Front Page)
        document.querySelectorAll('.la-sec-btn').forEach(b => b.classList.toggle('active', b.dataset.laSec === 'frontpage'));
        document.querySelectorAll('.la-section').forEach(s => s.classList.remove('active'));
        document.querySelector('.la-section[data-la-panel="frontpage"]')?.classList.add('active');
        // Switch to the lease view
        switchView('lease');
        generateLeasePreview();
    }

    // Back button returns to My Properties
    document.getElementById('laBackBtn')?.addEventListener('click', () => {
        switchView('properties');
    });

    // View HoT button — opens Heads of Terms modal from lease builder
    document.getElementById('laHotBtn')?.addEventListener('click', () => {
        const addr = document.getElementById('laTitle')?.textContent || '33 Crummer Road, Grey Lynn';
        openHeadsOfTerms(addr);
    });

    // Section nav — show ALL panels matching the key (schedule1 has multiple sub-panels)
    document.querySelectorAll('.la-sec-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.la-sec-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.la-section').forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            const key = btn.dataset.laSec;
            document.querySelectorAll(`.la-section[data-la-panel="${key}"]`).forEach(p => p.classList.add('active'));
            // Scroll to top of new section
            const formPane = document.querySelector('.la-form-pane');
            if (formPane) formPane.scrollTop = 0;
            generateLeasePreview();
        });
    });

    // Second Schedule clause counter
    function updateS2Count() {
        const checks = document.querySelectorAll('#laS2Clauses input[type="checkbox"]');
        const checked = Array.from(checks).filter(c => c.checked).length;
        const el = document.getElementById('laS2Count');
        if (el) el.textContent = `${checked} of ${checks.length} clauses retained`;
    }
    document.querySelectorAll('#laS2Clauses input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateS2Count);
    });

    // Progress tracker (no live preview pane — removed)
    function generateLeasePreview() {
        const allInputs = document.querySelectorAll('.la-input[data-la]');
        let filled = 0;
        allInputs.forEach(inp => { if ((inp.value || '').trim()) filled++; });
        const total = allInputs.length;
        const pct = Math.round((filled / total) * 100);
        const progressText = document.getElementById('laProgressText');
        const progressFill = document.getElementById('laProgressFill');
        if (progressText) progressText.textContent = `${filled} of ${total} fields complete`;
        if (progressFill) progressFill.style.width = pct + '%';
    }

    // Update preview on any input change
    document.querySelectorAll('.la-input[data-la]').forEach(inp => {
        inp.addEventListener('input', generateLeasePreview);
    });

    // Chattels toggle counter
    function updateChattelsCount() {
        const checks = document.querySelectorAll('#laChattelsGrid input[type="checkbox"]');
        const checked = Array.from(checks).filter(c => c.checked).length;
        const custom = document.querySelectorAll('.la-chattel-custom-item').length;
        const total = checks.length + custom;
        const included = checked + custom;
        const el = document.getElementById('laChattelsCount');
        if (el) el.textContent = `${included} of ${total} items included`;
    }
    document.querySelectorAll('#laChattelsGrid input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateChattelsCount);
    });
    // Custom chattel add
    document.getElementById('laChattelAddBtn')?.addEventListener('click', () => {
        const input = document.getElementById('laChattelCustomInput');
        const text = input?.value.trim();
        if (!text) return;
        input.value = '';
        const list = document.getElementById('laChattelCustomList');
        const item = document.createElement('div');
        item.className = 'la-chattel-custom-item';
        item.innerHTML = `<span>${text}</span><button class="la-chattel-custom-remove" title="Remove">&times;</button>`;
        list?.appendChild(item);
        item.querySelector('.la-chattel-custom-remove')?.addEventListener('click', () => {
            item.remove();
            updateChattelsCount();
        });
        updateChattelsCount();
    });

    // Outgoings toggle counter
    function updateOutgoingsCount() {
        const checks = document.querySelectorAll('#laOutgoingsGrid input[type="checkbox"]');
        const checked = Array.from(checks).filter(c => c.checked).length;
        const summaryEl = document.getElementById('laOgSummary');
        if (summaryEl) summaryEl.textContent = `${checked} of ${checks.length} categories included`;
        generateLeasePreview();
    }
    document.querySelectorAll('#laOutgoingsGrid input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateOutgoingsCount);
    });

    // Populate the review document (full ADLS)
    function populateReviewDoc() {
        const getVal = (key) => {
            const inp = document.querySelector(`.la-input[data-la="${key}"]`);
            return inp ? (inp.value || inp.textContent || '') : '';
        };

        // Front page fields
        const frontAddr = document.getElementById('laFrontAddress');
        if (frontAddr) frontAddr.textContent = getVal('premisesDesc') || getVal('landlordAddr') || '—';

        // Parties (front page + execution)
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
        setEl('laDocLandlord', getVal('landlord'));
        setEl('laDocTenant', getVal('tenant'));
        setEl('laDocGuarantor', getVal('guarantor'));
        setEl('laExecLandlord', getVal('landlord'));
        setEl('laExecTenant', getVal('tenant'));
        setEl('laExecGuarantor', getVal('guarantor'));

        // First Schedule table
        const reviewTable = document.getElementById('laReviewTable');
        if (reviewTable) {
            // Get ALL outgoings — full ADLS wording for the review document, struck-through if excluded
            const OUTGOINGS_FULL = [
                'Rates or levies payable to any local authority.',
                'Charges for water, gas, electricity, telecommunications and other utilities or services, including line charges and increases in charges attributable to increase in consumption of those utilities or services from the premises, but excluding any capital charges.',
                'Rubbish collection and recycling charges.',
                'Fire and Emergency levies and the maintenance charges in respect of all fire detection and firefighting equipment.',
                'Insurance premiums and related valuation fees, and any excess applied to the cost of repairs under clause 24.4 of the Lease.',
                'Service maintenance contract charges for air conditioning, lifts, other building services, security services, and roller doors and automatic doors, but excluding charges for inherent defects and renewal or replacement of building services.',
                'Cleaning, maintenance and repair charges including charges for repainting the exterior of the building and fences, decorative repairs and the maintenance and repair of building services to the extent that such charges do not comprise part of the cost of a service maintenance contract, but excluding charges for structural repairs to the building (more than minor repairs to the roof of the building or fences are structural repairs), repairs due to defects in design or construction, inherent defects and renewal or replacement of building services.',
                'The provisioning of toilets and other shared facilities.',
                'The cost of maintenance of lawns, gardens and planted areas including plant hire and replacement.',
                'Yard, car parking area and accessway maintenance and repair charges and minor repairs to those areas (including repairs to potholes) but excluding charges for repaving or resealing.',
                'Body Corporate charges for any insurance premiums under any insurance policy effected by the Body Corporate and related valuation fees.',
                'Management expenses and, in the case of a body corporate, includes reasonable management administration expenses (subject to clauses 3.9 and 3.10 of the Lease).',
                'The costs incurred and payable by the Landlord in supplying to the territorial authority a building warrant of fitness and obtaining reports as required by sections 108 and 110 of the Building Act 2004 but excluding the costs of upgrading or other work to make the building comply with the Building Act 2004.'
            ];
            const ogChecks = document.querySelectorAll('#laOutgoingsGrid input[type="checkbox"]');
            const ogText = OUTGOINGS_FULL.map((text, i) => {
                const excluded = ogChecks[i] && !ogChecks[i].checked;
                const num = `(${i + 1})`;
                if (excluded) {
                    return `<span style="text-decoration:line-through;color:#aaa;">${num} ${text}</span>`;
                }
                return `${num} ${text}`;
            }).join('<br><br>');

            const items = [
                ['1', 'Premises', getVal('premisesDesc')],
                ['', 'Record of Title', getVal('title')],
                ['', 'Legal Description', getVal('legalDesc')],
                ['', 'Lettable Area', getVal('area')],
                ['2', 'Car Parks', getVal('carparks')],
                ['3', 'Term', getVal('term')],
                ['4', 'Commencement Date', getVal('commDate')],
                ['5', 'Rights of Renewal', getVal('renewals')],
                ['6', 'Renewal Date(s)', getVal('renewalDates')],
                ['7', 'Renewal Notice Period', getVal('renewalNotice')],
                ['8', 'Final Expiry Date', getVal('finalExpiry')],
                ['9', 'Annual Rent (premises)', getVal('annualRentPremises')],
                ['', 'Annual Rent (car parks)', getVal('annualRentCarparks')],
                ['', 'Total Annual Rent', getVal('annualRentTotal')],
                ['10', 'Monthly Rent', getVal('monthlyRent')],
                ['11', 'Rent Payment Dates', getVal('paymentDates')],
                ['12', 'Rent Review Dates', getVal('reviewDates')],
                ['13', 'Lower Rent Limit', getVal('lowerLimit')],
                ['', 'Upper Rent Limit', getVal('upperLimit')],
                ['14', 'Interim Rent', getVal('interimRent')],
                ['15', 'Fixed Rent Adjustment', getVal('fixedAdj')],
                ['16', 'Proportion of Outgoings', getVal('outgoingsProportion')],
                ['17', 'Outgoings', ogText.replace(/\n/g, '<br>')],
                ['18', 'Default Interest Rate', getVal('defaultInterest')],
                ['19', 'Business Use', getVal('businessUse')],
                ['20', 'Landlord\'s Insurance', getVal('insuranceType')],
                ['21', 'Insurance Excess', getVal('excess')],
                ['22', 'Fair Proportion of Rent', getVal('fairProportion')],
                ['23', 'No Access Period', getVal('noAccess')],
                ['24', 'Bank Guarantee', getVal('bankGuarantee')],
                ['25', 'Bank Guarantee Amount', getVal('bankGuaranteeAmt')],
                ['26', 'Rental Bond', getVal('rentalBond')],
                ['27', 'Rental Bond Amount', getVal('rentalBondAmt')],
                ['28', 'Seismic Rating', getVal('seismic')],
                ['29', 'Mortgagee\'s Consent', getVal('mortgageeConsent')],
                ['31', 'Email (Landlord)', getVal('emailLandlord')],
                ['', 'Email (Tenant)', getVal('emailTenant')],
                ['32', 'Deposit', getVal('deposit')]
            ];
            reviewTable.innerHTML = items.map(([num, label, val]) =>
                `<tr><td>${num}</td><td>${label}</td><td>${val || '—'}</td></tr>`
            ).join('');
        }

        // Third Schedule further terms + AI-added clauses
        const furtherEl = document.getElementById('laReviewFurther');
        if (furtherEl) {
            const furtherTerms = [
                ['Rent-free Period', getVal('rentFree')],
                ['Make Good / Reinstatement', getVal('makeGood')],
                ['Assignment / Subletting', getVal('assignment')]
            ].filter(([, v]) => v);
            // Also include any AI-added clauses
            const addedClauses = [];
            document.querySelectorAll('.la-added-item').forEach(item => {
                const title = item.querySelector('.la-added-item-title')?.textContent || '';
                const text = item.querySelector('.la-added-item-text')?.textContent || '';
                if (title && text) addedClauses.push([title, text]);
            });
            const allTerms = [...furtherTerms, ...addedClauses];
            let clauseNum = 9;
            furtherEl.innerHTML = allTerms.map(([title, text]) =>
                `<div class="la-adls-further-item"><strong>${clauseNum++}.0 ${title}</strong><p>${text}</p></div>`
            ).join('') || '<p style="color:#888;font-style:italic;">No further terms specified.</p>';
        }

        // Fourth Schedule — chattels
        const chattelsEl = document.getElementById('laReviewChattels');
        if (chattelsEl) {
            const items = [];
            document.querySelectorAll('#laChattelsGrid input[type="checkbox"]:checked').forEach(cb => {
                const label = cb.closest('.la-chattel-item')?.querySelector('span:last-child')?.textContent || '';
                if (label) items.push(label);
            });
            document.querySelectorAll('.la-chattel-custom-item span').forEach(sp => {
                if (sp.textContent.trim()) items.push(sp.textContent.trim());
            });
            chattelsEl.innerHTML = items.length
                ? items.map(item => `<div class="la-adls-chattel-item">${item}</div>`).join('')
                : '<p style="color:#888;font-style:italic;">No fixtures, fittings or chattels specified.</p>';
        }

        // Back page — party details
        const setEl2 = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
        setEl2('laBackLandlord', getVal('landlord'));
        setEl2('laBackTenant', getVal('tenant'));
        setEl2('laBackLandlordEmail', getVal('emailLandlord'));
        setEl2('laBackTenantEmail', getVal('emailTenant'));
    }

    // Brand review pages with Bayleys header/footer
    function brandReviewPages() {
        const pages = document.querySelectorAll('#laReviewDoc .la-adls-page');
        const scheduleNames = ['Front Page', 'First Schedule', 'Second Schedule', 'Second Schedule (cont.)', 'Third Schedule', 'Fourth Schedule', 'Back Page'];
        pages.forEach((page, i) => {
            // Skip if already branded
            if (page.querySelector('.la-page-header')) return;
            // Wrap existing content in la-page-body
            if (!page.querySelector('.la-page-body')) {
                const body = document.createElement('div');
                body.className = 'la-page-body';
                while (page.firstChild) {
                    if (page.firstChild.classList?.contains('la-page-header') || page.firstChild.classList?.contains('la-page-footer')) break;
                    body.appendChild(page.firstChild);
                }
                // Remove DRAFT mark from body and re-add outside
                const draftMark = body.querySelector('.la-adls-draft-mark');
                if (draftMark) body.removeChild(draftMark);
                page.insertBefore(body, page.firstChild);
            }
            // Add header
            const header = document.createElement('div');
            header.className = 'la-page-header';
            header.innerHTML = `<img src="bayleys-logo.png" alt="Bayleys" class="la-page-header-logo"><div class="la-page-header-right">${scheduleNames[i] || 'Agreement to Lease'}</div>`;
            page.insertBefore(header, page.firstChild);
            // Move header after ::before pseudo-element (CSS handles this)

            // Add footer
            if (!page.querySelector('.la-page-footer')) {
                const footer = document.createElement('div');
                footer.className = 'la-page-footer';
                footer.innerHTML = `<span class="la-page-footer-left">Bayleys Real Estate Limited · Licensed under the REAA 2008 · Prepared by Walter AI</span><span class="la-page-footer-right">Page ${i + 1}</span>`;
                page.appendChild(footer);
            }
            // Re-add DRAFT mark
            if (!page.querySelector('.la-adls-draft-mark')) {
                const draft = document.createElement('div');
                draft.className = 'la-adls-draft-mark';
                draft.textContent = 'DRAFT';
                page.querySelector('.la-page-body')?.appendChild(draft);
            }
        });
    }

    // Generate button — now also populates the review doc
    document.getElementById('laGenerateBtn')?.addEventListener('click', () => {
        generateLeasePreview();
        populateReviewDoc();
        setTimeout(brandReviewPages, 100);
        const sendBtn = document.getElementById('laSendBtn');
        if (sendBtn) sendBtn.disabled = false;
    });

    // Approve button → switch to send tab
    document.getElementById('laApproveBtn')?.addEventListener('click', () => {
        document.querySelectorAll('.la-sec-btn').forEach(b => b.classList.toggle('active', b.dataset.laSec === 'send'));
        document.querySelectorAll('.la-section').forEach(s => s.classList.toggle('active', s.dataset.laPanel === 'send'));
    });

    // When switching to review tab, auto-populate
    const reviewSectionObs = new MutationObserver(() => {
        const reviewPanel = document.querySelector('.la-section[data-la-panel="review"]');
        if (reviewPanel?.classList.contains('active')) { populateReviewDoc(); setTimeout(brandReviewPages, 100); }
    });
    const reviewPanel = document.querySelector('.la-section[data-la-panel="review"]');
    if (reviewPanel) reviewSectionObs.observe(reviewPanel, { attributes: true, attributeFilter: ['class'] });

    // Send button
    document.getElementById('laSendBtn')?.addEventListener('click', () => {
        const signStatus = document.getElementById('laSignStatus');
        if (signStatus) signStatus.style.display = '';
        const statusEl = document.getElementById('laStatus');
        if (statusEl) {
            statusEl.className = 'hot-status sent';
            statusEl.innerHTML = '<span class="hot-status-dot sent"></span>Sent';
        }
        // Add sent confirmation to Command inbox
        const leaseAddr = document.getElementById('laTitle')?.textContent || 'Property';
        CMD_EMAILS.unshift({
            id: 'lease-sent-' + Date.now(), from: 'Walter', fromOrg: 'Sent', email: null,
            subject: 'Agreement to Lease sent for signing — ' + leaseAddr,
            preview: 'TLANZ Agreement to Lease (6th Edition 2024) sent via LuminPDF. Awaiting 3 signatures.',
            property: leaseAddr.split(',')[0], category: 'ai', time: 'Just now', unread: true,
            body: '<div class="cmd-ai-body"><strong>Agreement to Lease — Sent for Signing</strong><br><br>The TLANZ Agreement to Lease (6th Edition 2024) for <strong>' + leaseAddr + '</strong> has been sent to all parties via LuminPDF.<br><br><strong>Signing status:</strong><br>• Landlord: Pending<br>• Tenant: Pending<br>• Guarantor: Pending<br><br>All schedules (First through Fourth) and the Further Terms are included. Estimated completion: 3–5 business days.<br><br><em>Brittany has filed this agreement against the property record in Vault RE and notified the solicitors on record.</em></div>',
            aiReply: null, zaraNote: null
        });
    });

    // Wire HoT → Lease Agreement flow
    document.querySelector('.hot-next-btn')?.addEventListener('click', function() {
        if (this.disabled) return;
        hotModal?.classList.remove('active');
        const address = document.getElementById('hotTitle')?.textContent || 'Property';
        setTimeout(() => openLeaseAgreement(address), 150);
    });

    // --- Lease Agreement: Additional Clauses (Walter clause chat) ---
    const laClauseMessages = document.getElementById('laClauseMessages');
    const laClauseForm = document.getElementById('laClauseForm');
    const laClauseInput = document.getElementById('laClauseInput');
    const laAddedList = document.getElementById('laAddedList');
    const laClauseCount = document.getElementById('laClauseCount');
    let addedClauseNum = 0;

    const CLAUSE_RESPONSES = {
        'make-good': {
            title: 'Reinstatement / Make-Good',
            text: 'The Tenant shall, at the expiration or sooner determination of this Lease, reinstate the Premises to the condition they were in at the Commencement Date (fair wear and tear excepted), including the removal of all tenant fixtures, fittings and signage. A make-good assessment shall be conducted by mutual agreement no later than 6 months prior to the expiry of the Term or any renewal thereof.',
            source: '92% of comparable Grey Lynn office leases include this clause'
        },
        'signage': {
            title: 'Signage Rights',
            text: 'The Tenant shall be entitled to install signage on the exterior of the Premises and within any common area directory board, subject to the Landlord\'s prior written approval (not to be unreasonably withheld) and compliance with all applicable council and building regulations. All signage costs, including installation, maintenance and removal, shall be borne by the Tenant. The Tenant shall remove all signage and make good any damage caused by such removal at the expiry or sooner determination of this Lease.',
            source: 'Standard clause — ADLS 7th Edition cl 20'
        },
        'nocompete': {
            title: 'Non-Compete Radius',
            text: 'The Landlord covenants that for the duration of the Term and any renewal thereof, the Landlord shall not lease, licence or otherwise permit any other premises owned or controlled by the Landlord within a 2 kilometre radius of the Premises to be used for the same or substantially similar business purpose as the Tenant\'s permitted use under this Lease, without the Tenant\'s prior written consent.',
            source: 'Used in 34% of retail leases — less common in office'
        },
        'access': {
            title: '24/7 Access Rights',
            text: 'The Tenant shall have unrestricted access to the Premises 24 hours per day, 7 days per week, 365 days per year, including all public holidays. The Landlord shall provide the Tenant with access credentials (keys, security codes, access cards) sufficient to enable such unrestricted access at all times. Any restriction of access by the Landlord (other than in an emergency or for scheduled maintenance with 5 working days\' notice) shall entitle the Tenant to an abatement of rent for the period of restriction.',
            source: '76% of Auckland CBD/fringe office leases include 24/7 access'
        },
        'damage': {
            title: 'Damage & Abatement',
            text: 'If the Premises or any part thereof are damaged or destroyed so as to render the Premises or any part thereof unfit for the Tenant\'s use, then the rent and outgoings (or a fair proportion thereof having regard to the nature and extent of the damage) shall abate from the date of the damage until the Premises are reinstated to a condition fit for the Tenant\'s use. If the Premises are not reinstated within 9 months of the date of damage, either party may terminate this Lease by giving 20 working days\' notice.',
            source: 'Based on ADLS 7th Edition cl 29 — 9-month no-access default'
        },
        'hns': {
            title: 'Health & Safety Obligations',
            text: 'The Landlord and the Tenant shall each comply with all obligations imposed on them respectively under the Health and Safety at Work Act 2015 (HSWA) in relation to the Premises and the Building. The parties shall cooperate in good faith to ensure that all persons at the Premises are not exposed to health and safety risks arising from the Premises. The Tenant shall notify the Landlord promptly of any health and safety incident, notifiable event (as defined in HSWA), or hazard identified at the Premises.',
            source: '7th Edition addition — required under HSWA 2015'
        }
    };

    function addClauseMessage(type, html) {
        const msg = document.createElement('div');
        msg.className = 'la-clause-msg ' + type;
        msg.innerHTML = `
            <div class="la-clause-msg-avatar">${type === 'walter' ? 'W' : 'You'}</div>
            <div class="la-clause-msg-body">${html}</div>
        `;
        laClauseMessages?.appendChild(msg);
        laClauseMessages?.scrollTo({ top: laClauseMessages.scrollHeight, behavior: 'smooth' });
    }

    function handleClauseRequest(key) {
        const resp = CLAUSE_RESPONSES[key];
        if (!resp) {
            // Generic response for unrecognised requests
            addClauseMessage('walter', `
                <p>I can draft that for you. Based on the property type (Office) and location (Grey Lynn), here's a standard clause:</p>
                <p style="padding:10px 14px;background:rgba(255,255,255,0.04);border-left:2px solid #8b5cf6;border-radius:6px;font-style:italic;">"The parties agree to [your requested term] in accordance with standard commercial practice for properties of this class in the Auckland region, subject to the terms and conditions of this Lease."</p>
                <p style="font-size:11px;color:rgba(255,255,255,0.5);">This is a placeholder — refine your request for a more specific clause.</p>
            `);
            return;
        }

        // Show thinking briefly
        addClauseMessage('walter', '<p style="color:rgba(255,255,255,0.6);">Searching 14,200 lease precedents for the best match&hellip;</p>');
        setTimeout(() => {
            // Replace the thinking message with the real clause
            const lastMsg = laClauseMessages?.lastElementChild;
            if (lastMsg) lastMsg.remove();

            addClauseMessage('walter', `
                <p><strong>${resp.title}</strong></p>
                <p style="padding:12px 16px;background:rgba(255,255,255,0.04);border-left:2px solid #10b981;border-radius:6px;font-style:italic;line-height:1.6;">${resp.text}</p>
                <p style="font-size:11px;color:rgba(255,255,255,0.5);">${resp.source}</p>
                <button class="la-clause-add-btn" data-clause-title="${resp.title}" data-clause-text="${resp.text.replace(/"/g, '&quot;')}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add to agreement
                </button>
            `);

            // Wire the add button
            const addBtn = laClauseMessages?.querySelector('.la-clause-add-btn:last-of-type');
            addBtn?.addEventListener('click', () => {
                addClauseToAgreement(addBtn.dataset.clauseTitle, addBtn.dataset.clauseText);
                addBtn.textContent = '✓ Added';
                addBtn.disabled = true;
                addBtn.style.background = '#047857';
            });
        }, 1200);
    }

    function addClauseToAgreement(title, text) {
        addedClauseNum++;
        const emptyMsg = laAddedList?.querySelector('.la-added-empty');
        if (emptyMsg) emptyMsg.remove();

        const item = document.createElement('div');
        item.className = 'la-added-item';
        item.innerHTML = `
            <div class="la-added-item-num">${addedClauseNum}</div>
            <div class="la-added-item-body">
                <div class="la-added-item-title">${title}</div>
                <div class="la-added-item-text">${text}</div>
            </div>
            <button class="la-added-item-remove">Remove</button>
        `;
        laAddedList?.appendChild(item);
        if (laClauseCount) laClauseCount.textContent = `${addedClauseNum} clause${addedClauseNum === 1 ? '' : 's'}`;

        item.querySelector('.la-added-item-remove')?.addEventListener('click', () => {
            item.remove();
            addedClauseNum--;
            if (laClauseCount) laClauseCount.textContent = `${addedClauseNum} clause${addedClauseNum === 1 ? '' : 's'}`;
            if (addedClauseNum === 0 && laAddedList) {
                laAddedList.innerHTML = '<div class="la-added-empty">No additional clauses yet. Use Walter above to draft and add clauses.</div>';
            }
        });
    }

    // Suggestion chip clicks
    document.querySelectorAll('.la-clause-suggest').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.clause;
            addClauseMessage('user', `<p>${btn.textContent}</p>`);
            handleClauseRequest(key);
        });
    });

    // Free-text clause input
    laClauseForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = laClauseInput?.value.trim();
        if (!text) return;
        laClauseInput.value = '';
        addClauseMessage('user', `<p>${text}</p>`);
        // Try to match to known clause types
        const t = text.toLowerCase();
        const matchKey = Object.keys(CLAUSE_RESPONSES).find(k => {
            const resp = CLAUSE_RESPONSES[k];
            return resp.title.toLowerCase().split(/\s+/).some(w => t.includes(w));
        });
        handleClauseRequest(matchKey || null);
    });

    // --- Lease Agreement: Peer Review ---
    const laPeerReviewer = document.getElementById('laPeerReviewer');
    const laPeerEmailField = document.getElementById('laPeerEmailField');
    const laPeerSendBtn = document.getElementById('laPeerSendBtn');
    const laPeerTimeline = document.getElementById('laPeerTimeline');
    const laPeerComments = document.getElementById('laPeerComments');
    const laPeerBadge = document.getElementById('laPeerBadge');

    // Show/hide custom email field
    laPeerReviewer?.addEventListener('change', () => {
        if (laPeerEmailField) laPeerEmailField.style.display = laPeerReviewer.value === 'custom' ? '' : 'none';
    });

    // Send for review
    laPeerSendBtn?.addEventListener('click', () => {
        if (!laPeerReviewer?.value) return;
        if (laPeerBadge) { laPeerBadge.textContent = 'Reviewing'; laPeerBadge.className = 'la-peer-status-badge reviewing'; }
        if (laPeerTimeline) laPeerTimeline.style.display = '';
        if (laPeerComments) laPeerComments.style.display = '';
        laPeerSendBtn.textContent = '✓ Sent';
        laPeerSendBtn.disabled = true;
        laPeerSendBtn.style.opacity = '0.5';
    });

    // Resolve button clicks
    document.querySelectorAll('.la-peer-resolve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const comment = btn.closest('.la-peer-comment');
            if (comment) {
                comment.style.opacity = '0.5';
                comment.style.borderColor = '#10b981';
                btn.textContent = '✓ Resolved';
                btn.disabled = true;
                btn.style.color = '#047857';
            }
        });
    });

    // --- Heads of Terms Generator Modal ---
    const hotModal = document.getElementById('hotModal');
    const hotClose = document.getElementById('hotClose');

    function openHeadsOfTerms(address) {
        const titleEl = document.getElementById('hotTitle');
        if (titleEl) titleEl.textContent = address || 'Property';
        // Reset to edit tab
        document.querySelectorAll('.hot-tab').forEach(t => t.classList.toggle('active', t.dataset.hotTab === 'edit'));
        document.querySelectorAll('.hot-panel').forEach(p => p.classList.toggle('active', p.dataset.hotPanel === 'edit' || (!p.dataset.hotPanel && p.classList.contains('active'))));
        // Set first panel active
        const firstPanel = document.querySelector('.hot-panel');
        document.querySelectorAll('.hot-panel').forEach(p => p.classList.remove('active'));
        firstPanel?.classList.add('active');
        hotModal?.classList.add('active');
    }

    hotClose?.addEventListener('click', () => hotModal?.classList.remove('active'));
    hotModal?.addEventListener('click', (e) => {
        if (e.target === hotModal) hotModal?.classList.remove('active');
    });

    // Tab switching
    document.querySelectorAll('.hot-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.hot-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.hot-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const key = tab.dataset.hotTab;
            const panel = document.querySelector(`.hot-panel[data-hot-panel="${key}"]`);
            if (!panel) {
                // First panel (edit) doesn't have data attribute
                document.querySelector('.hot-panel')?.classList.add('active');
            } else {
                panel.classList.add('active');
            }
            // Generate preview when switching to preview tab
            if (key === 'preview') generateHotPreview();
        });
    });

    function generateHotPreview() {
        const bodyEl = document.getElementById('hotDocBody');
        if (!bodyEl) return;
        const fields = {};
        document.querySelectorAll('.hot-input[data-hot]').forEach(inp => {
            fields[inp.dataset.hot] = inp.value || inp.textContent || '';
        });
        bodyEl.innerHTML = `
            <table>
                <tr><th colspan="2">PARTIES</th></tr>
                <tr><td>Landlord</td><td>${fields.landlord || ''}</td></tr>
                <tr><td>Landlord Solicitor</td><td>${fields.landlordSolicitor || ''}</td></tr>
                <tr><td>Tenant</td><td>${fields.tenant || ''}</td></tr>
                <tr><td>Tenant Solicitor</td><td>${fields.tenantSolicitor || ''}</td></tr>
            </table>
            <table>
                <tr><th colspan="2">PREMISES</th></tr>
                <tr><td>Address</td><td>${fields.address || ''}</td></tr>
                <tr><td>Area</td><td>${fields.area || ''} sqm (subject to BOMA measurement)</td></tr>
                <tr><td>Type</td><td>${fields.type || ''}</td></tr>
                <tr><td>Car Parks</td><td>${fields.carparks || ''}</td></tr>
                <tr><td>Permitted Use</td><td>${fields.use || ''}</td></tr>
            </table>
            <table>
                <tr><th colspan="2">TERM & RENEWALS</th></tr>
                <tr><td>Initial Term</td><td>${fields.term || ''}</td></tr>
                <tr><td>Rights of Renewal</td><td>${fields.renewals || ''}</td></tr>
                <tr><td>Commencement</td><td>${fields.commDate || ''}</td></tr>
                <tr><td>Final Expiry</td><td>${fields.expiryDate || ''}</td></tr>
            </table>
            <table>
                <tr><th colspan="2">RENT</th></tr>
                <tr><td>Annual Rent</td><td>${fields.annualRent || ''}</td></tr>
                <tr><td>Rate</td><td>${fields.rate || ''}/sqm</td></tr>
                <tr><td>Rent Free Period</td><td>${fields.rentFree || ''}</td></tr>
                <tr><td>Payment</td><td>${fields.payment || ''}</td></tr>
            </table>
            <table>
                <tr><th colspan="2">RENT REVIEWS</th></tr>
                <tr><td>Annual Review</td><td>${fields.annualReview || ''}</td></tr>
                <tr><td>Market Review</td><td>${fields.marketReview || ''}</td></tr>
            </table>
            <table>
                <tr><th colspan="2">OUTGOINGS & INSURANCE</th></tr>
                <tr><td>Outgoings</td><td>${fields.outgoings || ''}</td></tr>
                <tr><td>Tenant Insurance</td><td>${fields.tenantInsurance || ''}</td></tr>
                <tr><td>Bond / Guarantee</td><td>${fields.bond || ''}</td></tr>
            </table>
            <table>
                <tr><th colspan="2">ADDITIONAL TERMS</th></tr>
                <tr><td>Fit-out & Works</td><td>${fields.fitout || ''}</td></tr>
                <tr><td>Make Good</td><td>${fields.makeGood || ''}</td></tr>
                <tr><td>Assignment</td><td>${fields.assignment || ''}</td></tr>
                <tr><td>Default Interest</td><td>${fields.defaultInterest || ''}</td></tr>
            </table>
        `;
    }

    // Send button simulation
    document.getElementById('hotSendBtn')?.addEventListener('click', () => {
        // Switch to status tab
        document.querySelectorAll('.hot-tab').forEach(t => t.classList.toggle('active', t.dataset.hotTab === 'status'));
        document.querySelectorAll('.hot-panel').forEach(p => p.classList.remove('active'));
        document.querySelector('.hot-panel[data-hot-panel="status"]')?.classList.add('active');
        // Update status badge
        const statusEl = document.getElementById('hotStatus');
        if (statusEl) {
            statusEl.className = 'hot-status sent';
            statusEl.innerHTML = '<span class="hot-status-dot sent"></span><span>Sent</span>';
        }
        // Add sent confirmation to Command inbox
        const hotAddr = document.getElementById('hotTitle')?.textContent || 'Property';
        CMD_EMAILS.unshift({
            id: 'hot-sent-' + Date.now(), from: 'Walter', fromOrg: 'Sent', email: null,
            subject: 'Heads of Terms sent — ' + hotAddr,
            preview: 'HoT document sent via LuminPDF for digital signature. Awaiting tenant and owner signatures.',
            property: hotAddr.split(',')[0], category: 'ai', time: 'Just now', unread: true,
            body: '<div class="cmd-ai-body"><strong>Heads of Terms — Sent for Signing</strong><br><br>The Heads of Terms for <strong>' + hotAddr + '</strong> has been sent to all parties via LuminPDF digital signature.<br><br><strong>Status:</strong><br>• Tenant: Pending signature<br>• Owner: Pending signature<br><br>You will be notified when each party signs. Estimated completion: 2–3 business days.<br><br><em>Brittany has filed this document against the property record in Vault RE.</em></div>',
            aiReply: null, zaraNote: null
        });
    });

    // Add to Escape handler
    // (hotModal is already handled via the generic modal close below)

    // --- My Properties: per-row action menu + drill-down modal ---
    const propDrillModal = document.getElementById('propDrillModal');
    const propDrillClose = document.getElementById('propDrillClose');
    const pdAddress = document.getElementById('pdAddress');

    // Property image lookup — maps address keywords to listing images
    const PROPERTY_IMAGES = {
        'Crummer': 'listing-carlisle.jpg', // Using carlisle as placeholder
        'Beaumont': 'carlisle-01.jpg',
        'Dalgety': 'listing-manukau.jpg',
        'Bryce': 'listing-wainui.jpg',
        'Birmingham': 'listing-dacre.jpg',
        'Mays': 'listing-manukau.jpg',
        'Rosedale': 'listing-jervois.jpg',
        'Earl Richardson': 'listing-wainui.jpg',
        'Aviemore': 'listing-parnell.jpg',
        'Cook': 'listing-jervois.jpg',
        'Kellow': 'listing-dacre.jpg',
        'Parnell': 'listing-parnell.jpg',
        'Spring': 'listing-jervois.jpg',
        'Remuera': 'listing-parnell.jpg',
        'Kitchener': 'listing-dacre.jpg',
        'Ellerslie': 'listing-dacre.jpg',
        'Ormiston': 'listing-wainui.jpg',
        'Shortland': 'sv-88-shortland.png',
        'Ponsonby': 'listing-jervois.jpg',
        'Fanshawe': 'listing-dacre.jpg',
        'Westgate': 'listing-wainui.jpg',
        'Chonny': 'listing-manukau.jpg',
        'Galway': 'listing-manukau.jpg',
        'Patiki': 'listing-dacre.jpg',
        'High Street': 'listing-jervois.jpg',
        'Pukemiro': 'listing-manukau.jpg',
        'Manukau': 'listing-manukau.jpg',
        'Moore': 'listing-dacre.jpg'
    };

    function getPropertyImage(address) {
        for (const [key, img] of Object.entries(PROPERTY_IMAGES)) {
            if (address.includes(key)) return img;
        }
        return 'sv-88-shortland.png'; // default
    }

    function openPropDrill(address, tab) {
        if (pdAddress && address) pdAddress.textContent = address;
        // Set hero image
        const heroImg = document.getElementById('pdHeroImg');
        if (heroImg) heroImg.src = getPropertyImage(address);
        // Activate the selected tab (default: overview)
        const targetTab = tab || 'overview';
        document.querySelectorAll('.pd-tab').forEach(t => t.classList.toggle('active', t.dataset.pdTab === targetTab));
        document.querySelectorAll('.pd-panel').forEach(p => p.classList.toggle('active', p.id === 'pdPanel' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)));
        propDrillModal?.classList.add('active');
    }

    propDrillClose?.addEventListener('click', () => propDrillModal.classList.remove('active'));
    propDrillModal?.addEventListener('click', (e) => {
        if (e.target === propDrillModal) propDrillModal.classList.remove('active');
    });

    // Ask Walter from propDrill hero
    document.getElementById('pdDrillAskWalter')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const addr = document.getElementById('pdAddress')?.textContent || 'this property';
        const popout = document.getElementById('walterPopout');
        const fab = document.getElementById('walterFab');
        if (popout && !popout.classList.contains('open')) {
            popout.classList.add('open');
            fab?.classList.add('popout-open');
        }
        const popInput = document.getElementById('walterPopoutInput');
        if (popInput) {
            popInput.value = 'Tell me about ' + addr;
            popInput.focus();
        }
    });

    // Add Property from propDrill hero
    document.getElementById('pdDrillAddProp')?.addEventListener('click', function() {
        const addr = document.getElementById('pdAddress')?.textContent || 'Property';
        const chips = document.querySelectorAll('#propDrillModal .pd-meta-chip');
        const type = chips[0]?.textContent?.split('·')[0]?.trim() || 'Office';

        const tbody = document.querySelector('#view-properties .properties-table tbody');
        if (tbody) {
            // Check if already in table
            const exists = Array.from(tbody.querySelectorAll('.cell-primary')).some(c => c.childNodes[0]?.textContent?.trim() === addr);
            if (exists) {
                this.textContent = 'Already added';
                setTimeout(() => { this.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Property'; }, 2000);
                return;
            }
            const tr = document.createElement('tr');
            tr.className = 'clickable-row';
            tr.innerHTML = `
                <td><span class="cell-primary">${addr}</span><span class="prop-deal-dot"><span class="prop-deal-indicator deal-new"></span><span class="prop-deal-tooltip">New</span></span></td>
                <td><span class="type-badge badge-${type.toLowerCase()}">${type}</span></td>
                <td>—</td><td>—</td><td>—</td><td>—</td>
                <td><div class="pipeline-bar"><div class="pipeline-fill" style="width:0%"></div></div></td>
            `;
            tbody.prepend(tr);
            tr.addEventListener('click', () => openPropDrill(tr));
        }
        this.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Added';
        this.style.background = 'rgba(5,150,105,0.9)';
        setTimeout(() => {
            this.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Property';
            this.style.background = '';
        }, 3000);
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
                <button data-pd="hot">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span class="pam-label">Generate Heads of Terms</span>
                </button>
                <button data-pd="lease">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    <span class="pam-label">Lease Agreement</span>
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
                const addrEl = row.querySelector('.cell-primary');
                const address = (addrEl?.childNodes[0]?.textContent || addrEl?.textContent || 'Property').trim();
                menu.classList.remove('open');
                btn.classList.remove('open');
                if (tab === 'summary') {
                    if (address.includes('Crummer')) {
                        document.getElementById('crummerModal')?.classList.add('active');
                    } else {
                        openPropDrill('Property', 'history');
                    }
                } else if (tab === 'hot') {
                    openHeadsOfTerms(address);
                } else if (tab === 'lease') {
                    openLeaseAgreement(address);
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

    // --- My Properties: Export to CSV ---
    document.querySelector('.mp-export-btn')?.addEventListener('click', () => {
        const rows = document.querySelectorAll('#view-properties .properties-table tbody tr');
        const headers = ['Address', 'Type', 'Tenant', 'Area (sqm)', '$/SQM', 'Expiry', 'Status'];
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            if (row.style.display === 'none') return;
            const cells = row.querySelectorAll('td');
            if (cells.length < 7) return;
            const addr = (cells[0]?.childNodes[0]?.textContent || cells[0]?.textContent || '').trim().replace(/,/g, ' ');
            const type = (cells[1]?.textContent || '').trim();
            const tenant = (cells[2]?.textContent || '').trim().replace(/,/g, ' ');
            const area = (cells[3]?.textContent || '').trim();
            const psqm = (cells[4]?.textContent || '').trim();
            const expiry = (cells[5]?.textContent || '').trim();
            const status = (cells[6]?.textContent || '').trim();
            csv += `"${addr}","${type}","${tenant}","${area}","${psqm}","${expiry}","${status}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'my-properties-export.csv';
        a.click();
        URL.revokeObjectURL(a.href);
    });

    // --- My Properties: Add Property Modal ---
    const addPropModal = document.getElementById('addPropertyModal');
    const addPropSearch = document.getElementById('addPropSearch');
    const addPropResults = document.getElementById('addPropResults');
    const addPropSearchBtn = document.getElementById('addPropSearchBtn');

    document.querySelector('.mp-add-btn')?.addEventListener('click', () => {
        addPropModal?.classList.add('active');
        setTimeout(() => addPropSearch?.focus(), 200);
    });
    document.getElementById('addPropClose')?.addEventListener('click', () => {
        addPropModal?.classList.remove('active');
    });
    addPropModal?.addEventListener('click', (e) => {
        if (e.target === addPropModal) addPropModal.classList.remove('active');
    });

    const sampleProperties = [
        { address: '45 Queen Street, Auckland CBD', type: 'Office', area: '820', psqm: '$420', owner: 'Queen Street Holdings Ltd', tenant: 'Vacant', cv: '$4.2M (2021)', zoning: 'Business — City Centre', nbs: '85%' },
        { address: '12 Queen Street, Auckland CBD', type: 'Retail', area: '340', psqm: '$580', owner: 'Precinct Properties Ltd', tenant: 'Cotton On Group', cv: '$2.8M (2021)', zoning: 'Business — City Centre', nbs: '100%' },
        { address: '155 Queen Street, Auckland CBD', type: 'Office', area: '1,200', psqm: '$395', owner: 'Goodman Property Trust', tenant: 'Multiple', cv: '$8.5M (2021)', zoning: 'Business — City Centre', nbs: '67%' },
        { address: '78 Victoria Street West, Auckland CBD', type: 'Office', area: '560', psqm: '$350', owner: 'Victoria Park Holdings', tenant: 'Tech Startup Ltd', cv: '$3.1M (2021)', zoning: 'Business — City Centre', nbs: '72%' },
        { address: '22 Customs Street East, Auckland CBD', type: 'Retail', area: '280', psqm: '$490', owner: 'Britomart Group', tenant: 'Vacant', cv: '$2.2M (2021)', zoning: 'Business — City Centre', nbs: '100%' },
        { address: '91 Albert Street, Auckland CBD', type: 'Office', area: '1,450', psqm: '$410', owner: 'Mansons TCLM Ltd', tenant: 'Fisher & Paykel Healthcare', cv: '$7.8M (2021)', zoning: 'Business — City Centre', nbs: '90%' },
        { address: '8 Commerce Street, Auckland CBD', type: 'Industrial', area: '680', psqm: '$195', owner: 'Commerce Holdings Ltd', tenant: 'NZ Post', cv: '$1.9M (2021)', zoning: 'Business — Mixed Use', nbs: '55%' },
        { address: '200 Great South Road, Greenlane', type: 'Retail', area: '950', psqm: '$310', owner: 'Greenlane Properties Ltd', tenant: 'Briscoes Group', cv: '$4.5M (2021)', zoning: 'Business — Mixed Use', nbs: '78%' },
        { address: '14 Anzac Avenue, Auckland CBD', type: 'Office', area: '720', psqm: '$375', owner: 'Anzac Properties Trust', tenant: 'Deloitte NZ', cv: '$5.2M (2021)', zoning: 'Business — City Centre', nbs: '82%' },
    ];

    function searchAddProperties(query) {
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return sampleProperties.filter(p =>
            p.address.toLowerCase().includes(q) ||
            p.owner.toLowerCase().includes(q) ||
            p.tenant.toLowerCase().includes(q) ||
            p.type.toLowerCase().includes(q)
        );
    }

    function renderAddPropResults(results, query) {
        if (!addPropResults) return;
        if (!query) {
            addPropResults.innerHTML = '<div class="add-prop-empty">Search by address, owner name, or business name</div>';
            return;
        }
        if (results.length === 0) {
            addPropResults.innerHTML = '<div class="add-prop-empty">No properties found matching "' + query + '"</div>';
            return;
        }
        addPropResults.innerHTML = `<div class="add-prop-count">${results.length} properties found</div>` +
            results.map((p, i) => `
                <div class="add-prop-card" data-idx="${i}">
                    <div class="add-prop-card-header">
                        <div>
                            <div class="add-prop-address">${p.address}</div>
                            <div class="add-prop-meta">
                                <span class="type-badge badge-${p.type.toLowerCase()}">${p.type}</span>
                                <span>${p.area} sqm</span>
                                <span>${p.psqm}/sqm</span>
                            </div>
                        </div>
                        <button class="add-prop-add-btn" data-idx="${i}">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add to My Properties
                        </button>
                    </div>
                    <div class="add-prop-details">
                        <div class="add-prop-detail"><span>Owner</span><strong>${p.owner}</strong></div>
                        <div class="add-prop-detail"><span>Tenant</span><strong>${p.tenant}</strong></div>
                        <div class="add-prop-detail"><span>CV</span><strong>${p.cv}</strong></div>
                        <div class="add-prop-detail"><span>Zoning</span><strong>${p.zoning}</strong></div>
                        <div class="add-prop-detail"><span>NBS</span><strong>${p.nbs}</strong></div>
                    </div>
                </div>
            `).join('');

        // Bind add buttons
        addPropResults.querySelectorAll('.add-prop-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                const prop = results[idx];
                addPropertyToTable(prop);
                btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Added';
                btn.disabled = true;
                btn.style.background = '#059669';
                btn.style.borderColor = '#059669';
            });
        });
    }

    function addPropertyToTable(prop) {
        const tbody = document.querySelector('#view-properties .properties-table tbody');
        if (!tbody) return;
        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        const statusColors = { 'Office': '#4285f4', 'Retail': '#e8590c', 'Industrial': '#059669' };
        tr.innerHTML = `
            <td><span class="cell-primary">${prop.address}</span><span class="prop-deal-dot"><span class="prop-deal-indicator deal-new"></span><span class="prop-deal-tooltip">New</span></span></td>
            <td><span class="type-badge badge-${prop.type.toLowerCase()}">${prop.type}</span></td>
            <td>${prop.tenant}</td>
            <td>${prop.area}</td>
            <td>${prop.psqm}</td>
            <td>—</td>
            <td><div class="pipeline-bar"><div class="pipeline-fill" style="width:0%;background:${statusColors[prop.type] || '#888'}"></div></div></td>
        `;
        tbody.prepend(tr);
        // Update count
        const cnt = document.getElementById('propCountDisplay');
        const total = tbody.querySelectorAll('tr').length;
        if (cnt) cnt.textContent = `Showing ${total} of ${total}`;
        // Add row click for drill modal
        tr.addEventListener('click', () => openPropDrill(tr));
        // Flash highlight
        tr.style.background = '#f0fdf4';
        setTimeout(() => tr.style.background = '', 2000);
    }

    function doAddPropSearch() {
        const query = addPropSearch?.value || '';
        if (!query.trim()) return;
        addPropResults.innerHTML = '<div class="add-prop-loading"><div class="add-prop-spinner"></div>Searching Walter database, LINZ, Companies Office...</div>';
        setTimeout(() => {
            const results = searchAddProperties(query);
            renderAddPropResults(results, query);
        }, 1200);
    }

    addPropSearchBtn?.addEventListener('click', doAddPropSearch);
    addPropSearch?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doAddPropSearch();
    });
    // Suggestion chip clicks
    document.querySelectorAll('.add-prop-suggestion').forEach(chip => {
        chip.addEventListener('click', () => {
            if (addPropSearch) addPropSearch.value = chip.dataset.q;
            doAddPropSearch();
        });
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
        actions.innerHTML = '<span class="step-dot done" style="display:inline-block;width:6px;height:6px;vertical-align:middle;margin-right:4px"></span> Booked &mdash; Uber arrives 10:48 AM &middot; receipt to Xero';
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
        fbStageDeploy?.classList.remove('active');
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

    // --- Brittany auto-deploy triage logic ---
    const fbStageDeploy = document.getElementById('fbStageDeploy');

    // Deployable feedback patterns — each with a simulated code diff and deploy description
    const DEPLOYABLE_FEEDBACK = [
        {
            keywords: ['sort', 'order', 'alphabetical', 'a-z'],
            count: 7,
            complexity: 'Low · Sort order change',
            desc: 'Added alphabetical sort option to the properties table. Agents can now click any column header to sort A-Z or Z-A.',
            filename: 'app.js',
            code: `<span class="code-comment">// Sort toggle on properties table</span>\n<span class="code-add">+ const headers = document.querySelectorAll('.properties-table th');</span>\n<span class="code-add">+ headers.forEach(th => {</span>\n<span class="code-add">+   th.style.cursor = 'pointer';</span>\n<span class="code-add">+   th.addEventListener('click', () => sortTable(th));</span>\n<span class="code-add">+ });</span>`
        },
        {
            keywords: ['colour', 'color', 'theme', 'contrast', 'readability'],
            count: 6,
            complexity: 'Low · CSS variable update',
            desc: 'Increased text contrast on secondary labels from 0.55 to 0.7 opacity. Better readability across all views.',
            filename: 'styles.css',
            code: `<span class="code-comment">/* Improved text contrast per agent feedback */</span>\n<span class="code-remove">- --text-secondary: #6b7280;</span>\n<span class="code-add">+ --text-secondary: #4b5563;</span>\n<span class="code-remove">- --text-tertiary: #9ca3af;</span>\n<span class="code-add">+ --text-tertiary: #6b7280;</span>`
        },
        {
            keywords: ['font', 'text size', 'small text', 'too small', 'bigger', 'larger'],
            count: 9,
            complexity: 'Low · Font scale adjustment',
            desc: 'Bumped the base font size from 14px to 15px across all views. Tables and cards now render at a more comfortable reading size.',
            filename: 'styles.css',
            code: `<span class="code-comment">/* Font size bump — 9 agents requested */</span>\n<span class="code-remove">- html { font-size: 14px; }</span>\n<span class="code-add">+ html { font-size: 15px; }</span>\n<span class="code-remove">- .properties-table td { font-size: 12.5px; }</span>\n<span class="code-add">+ .properties-table td { font-size: 13.5px; }</span>`
        },
        {
            keywords: ['filter', 'search', 'find', 'can\'t find', 'hard to find'],
            count: 5,
            complexity: 'Low · UI addition',
            desc: 'Added a persistent search bar to the top of the properties table. Live-filters across address, tenant, and region as you type.',
            filename: 'index.html',
            code: `<span class="code-comment">&lt;!-- Search bar added to properties --&gt;</span>\n<span class="code-add">+ &lt;input type="text" class="mp-search"</span>\n<span class="code-add">+   placeholder="Search address, tenant..."</span>\n<span class="code-add">+   id="propQuickSearch"&gt;</span>\n<span class="code-comment">// Live filter wired to table rows</span>\n<span class="code-add">+ input.addEventListener('input', filterRows);</span>`
        },
        {
            keywords: ['slow', 'loading', 'performance', 'lag', 'speed'],
            count: 8,
            complexity: 'Low · Performance optimisation',
            desc: 'Lazy-loaded listing images and deferred non-critical CSS. Page load time reduced by ~40% on slower connections.',
            filename: 'index.html',
            code: `<span class="code-comment">&lt;!-- Lazy load images --&gt;</span>\n<span class="code-remove">- &lt;img src="listing-parnell.jpg"&gt;</span>\n<span class="code-add">+ &lt;img src="listing-parnell.jpg" loading="lazy"&gt;</span>\n<span class="code-comment">&lt;!-- Defer non-critical CSS --&gt;</span>\n<span class="code-add">+ &lt;link rel="preload" as="style" href="styles.css"&gt;</span>`
        },
        {
            keywords: ['tooltip', 'hover', 'explain', 'what does', 'help text', 'confus'],
            count: 6,
            complexity: 'Low · Tooltip addition',
            desc: 'Added contextual tooltips to stickiness bars, status badges, and agent pips across the properties table and home dashboard.',
            filename: 'app.js',
            code: `<span class="code-comment">// Contextual tooltips for data elements</span>\n<span class="code-add">+ document.querySelectorAll('.stickiness-bar')</span>\n<span class="code-add">+   .forEach(bar => {</span>\n<span class="code-add">+     const pct = bar.querySelector('.stickiness-fill');</span>\n<span class="code-add">+     bar.title = \`Stickiness: \${pct.style.width}\`;</span>\n<span class="code-add">+   });</span>`
        },
        {
            keywords: ['print', 'printer', 'hard copy'],
            count: 5,
            complexity: 'Low · CSS print stylesheet',
            desc: 'Added a print stylesheet for Strategy Cards and lease reviews. Hit Ctrl+P on any analysis view and it formats perfectly for A4.',
            filename: 'styles.css',
            code: `<span class="code-comment">/* Print stylesheet for Strategy Cards */</span>\n<span class="code-add">+ @media print {</span>\n<span class="code-add">+   .sidebar, .walter-fab, .modal-close { display: none; }</span>\n<span class="code-add">+   .strategy-card { box-shadow: none; border: 1px solid #ddd; }</span>\n<span class="code-add">+   body { background: white; font-size: 12pt; }</span>\n<span class="code-add">+ }</span>`
        }
    ];

    function triageFeedback(text) {
        const t = text.toLowerCase();
        return DEPLOYABLE_FEEDBACK.find(d => d.keywords.some(k => t.includes(k)));
    }

    function runDeployFlow(deployData) {
        const stepsEl = fbStageDeploy.querySelectorAll('.fb-deploy-step');
        const codeEl = document.getElementById('fbDeployCode');
        const codeBodyEl = document.getElementById('fbCodeBody');
        const filenameEl = document.getElementById('fbCodeFilename');
        const doneEl = document.getElementById('fbDeployDone');
        const doneDescEl = document.getElementById('fbDeployDoneDesc');
        const triageCountEl = document.getElementById('fbTriageCount');
        const triageComplexityEl = document.getElementById('fbTriageComplexity');

        // Set triage details
        if (triageCountEl) triageCountEl.textContent = deployData.count + ' agents reported this';
        if (triageComplexityEl) triageComplexityEl.textContent = deployData.complexity;

        // Reset
        stepsEl.forEach(s => { s.classList.remove('active', 'done'); });
        if (codeEl) codeEl.style.display = 'none';
        if (doneEl) doneEl.style.display = 'none';

        // Animate steps sequentially
        const stepTimings = [400, 1800, 3200, 4400];
        const doneTimings = [1400, 3000, 4200, 5200];

        stepTimings.forEach((delay, i) => {
            setTimeout(() => {
                stepsEl[i]?.classList.add('active');
                // Show code preview at step 2 (writing the change)
                if (i === 1 && codeEl) {
                    codeEl.style.display = '';
                    if (filenameEl) filenameEl.textContent = deployData.filename;
                    if (codeBodyEl) codeBodyEl.innerHTML = deployData.code;
                }
            }, delay);
        });

        doneTimings.forEach((delay, i) => {
            setTimeout(() => {
                stepsEl[i]?.classList.remove('active');
                stepsEl[i]?.classList.add('done');
                const textEl = stepsEl[i]?.querySelector('.fb-ds-text');
                if (textEl) textEl.textContent = textEl.textContent.replace('…', ' — done');
            }, delay);
        });

        // Show deploy complete
        setTimeout(() => {
            if (doneEl) doneEl.style.display = 'flex';
            if (doneDescEl) doneDescEl.textContent = deployData.desc;
        }, 5600);
    }

    function runFeedbackFlow(text) {
        fbStageCompose.classList.remove('active');

        // Check if this feedback is auto-deployable
        const deployMatch = triageFeedback(text);

        if (deployMatch) {
            // Route through the extended thinking → deploy → response flow
            fbStageThinking.classList.add('active');
            const thinkTitle = document.getElementById('fbThinkingTitle');
            const thinkSteps = document.getElementById('fbThinkingSteps');
            if (thinkTitle) thinkTitle.textContent = 'Walter is analysing your feedback…';
            if (thinkSteps) {
                thinkSteps.innerHTML = `
                    <div class="fb-thinking-step" data-step="1"><span class="fb-step-dot"></span> Matched against 1,247 prior submissions</div>
                    <div class="fb-thinking-step" data-step="2"><span class="fb-step-dot"></span> ${deployMatch.count} agents reported the same thing</div>
                    <div class="fb-thinking-step" data-step="3"><span class="fb-step-dot"></span> Complexity assessed: ${deployMatch.complexity}</div>
                    <div class="fb-thinking-step" data-step="4"><span class="fb-step-dot"></span> Routing to Brittany for auto-deploy</div>
                `;
            }
            const steps = thinkSteps?.querySelectorAll('.fb-thinking-step') || [];
            steps.forEach((s, i) => {
                setTimeout(() => s.classList.add('visible'), 300 + i * 450);
            });

            // After thinking, show Brittany deploy stage
            setTimeout(() => {
                fbStageThinking.classList.remove('active');
                fbStageDeploy?.classList.add('active');
                runDeployFlow(deployMatch);
            }, 2400);

            // After deploy completes, show Walter's response (with deploy context)
            setTimeout(() => {
                fbStageDeploy?.classList.remove('active');
                fbStageResponse.classList.add('active');
                const titleEl = document.getElementById('fbResponseTitle');
                const bodyEl = document.getElementById('fbResponseBody');
                const extrasEl = document.getElementById('fbResponseExtras');
                titleEl.textContent = 'Done — Brittany shipped it';
                bodyEl.innerHTML = `Your feedback matched <strong>${deployMatch.count} other agents</strong> this week. Brittany assessed the complexity as low-risk, wrote the change, ran automated tests, and deployed it &mdash; all in under 10 seconds.<br><br>The fix is <strong>live right now</strong> across all Bayleys agents. No page refresh needed.<br><br>&mdash; Walter`;
                extrasEl.innerHTML = `
                    <div class="fb-popularity" style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(236,72,153,0.08));border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:14px 16px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#a855f7);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:12px;flex-shrink:0;">B</span>
                            <span style="font-size:12px;color:var(--text-secondary);">Brittany auto-deployed &middot; ${deployMatch.filename} &middot; ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                        </div>
                    </div>
                `;
            }, 8400);

        } else {
            // Standard feedback flow (no deploy)
            fbStageThinking.classList.add('active');
            const thinkTitle = document.getElementById('fbThinkingTitle');
            const thinkSteps = document.getElementById('fbThinkingSteps');
            if (thinkTitle) thinkTitle.textContent = 'Walter is reading your feedback…';
            if (thinkSteps) {
                thinkSteps.innerHTML = `
                    <div class="fb-thinking-step" data-step="1"><span class="fb-step-dot"></span> Matching against 1,247 prior submissions</div>
                    <div class="fb-thinking-step" data-step="2"><span class="fb-step-dot"></span> Checking against current roadmap</div>
                    <div class="fb-thinking-step" data-step="3"><span class="fb-step-dot"></span> Preparing response</div>
                `;
            }
            const steps = thinkSteps?.querySelectorAll('.fb-thinking-step') || [];
            steps.forEach((s, i) => {
                setTimeout(() => s.classList.add('visible'), 350 + i * 500);
            });
            setTimeout(() => {
                fbStageThinking.classList.remove('active');
                fbStageResponse.classList.add('active');
                renderFeedbackResponse(text);
            }, 2200);
        }
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
            hotModal?.classList.remove('active');
        }
    });

    // --- Priority Banner ---
    document.getElementById('priorityBannerDismiss')?.addEventListener('click', () => {
        document.getElementById('priorityBanner')?.classList.add('dismissed');
    });
    document.querySelector('.priority-banner-cta')?.addEventListener('click', () => {
        document.getElementById('strategyModal')?.classList.add('active');
    });

    // --- Dynamic Date & Greeting ---
    (function setDynamicDate() {
        const now = new Date();
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const dayName = days[now.getDay()];
        const monthName = months[now.getMonth()];
        const dateStr = `${dayName}, ${now.getDate()} ${monthName} ${now.getFullYear()}`;
        const dateEl = document.querySelector('.date-display');
        if (dateEl) dateEl.textContent = dateStr;

        const hour = now.getHours();
        let greeting = 'Good morning';
        if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
        else if (hour >= 17) greeting = 'Good evening';
        const titleEl = document.querySelector('#view-home .view-title');
        if (titleEl) titleEl.textContent = `${greeting}, Will`;
    })();

    // --- Advisory Prompt Dismiss ---
    document.getElementById('advisoryPromptDismiss')?.addEventListener('click', () => {
        document.getElementById('advisoryPrompt')?.classList.add('dismissed');
    });

    // --- My Properties: Status chips removed (STATUS column already present) ---

    // --- Settings: Add hero sections to non-Contactless tabs ---
    (function polishSettingsTabs() {
        const settingsHeroes = {
            'settings-integrations': {
                badge: 'Integrations',
                title: 'Connected workspace',
                sub: 'Your data sources, CRM, and productivity tools — all feeding into Walter\'s intelligence layer.',
                stats: [{ num: '6', label: 'Connected' }, { num: '2', label: 'Pending' }, { num: '99.8%', label: 'Uptime' }]
            },
            'settings-alerts': {
                badge: 'Alert Preferences',
                title: 'Stay informed, not overwhelmed',
                sub: 'Fine-tune which signals, triggers, and agent actions notify you — and how.',
                stats: [{ num: '24', label: 'Active rules' }, { num: '142', label: 'Alerts this week' }, { num: '3', label: 'Channels' }]
            },
            'settings-agents': {
                badge: 'AI Agents',
                title: 'Your intelligence team',
                sub: 'Configure how Zara, Wallace, Costello, Molloy, and Brittany work across your portfolio.',
                stats: [{ num: '5', label: 'Active agents' }, { num: '847', label: 'Actions this week' }, { num: '96%', label: 'Accuracy' }]
            },
            'settings-context': {
                badge: 'Personal Context',
                title: 'Walter knows you',
                sub: 'Your preferences, market focus, and communication style — so every recommendation is relevant.',
                stats: [{ num: '12', label: 'Preferences set' }, { num: '3', label: 'Focus areas' }, { num: '8mo', label: 'Learning' }]
            }
        };
        Object.entries(settingsHeroes).forEach(([id, data]) => {
            const section = document.getElementById(id);
            if (!section || section.querySelector('.settings-section-hero')) return;
            const hero = document.createElement('div');
            hero.className = 'settings-section-hero';
            hero.innerHTML = `
                <div class="settings-hero-badge"><span class="settings-hero-badge-dot"></span>${data.badge}</div>
                <h2 class="settings-hero-title">${data.title}</h2>
                <p class="settings-hero-sub">${data.sub}</p>
                <div class="settings-hero-stats">
                    ${data.stats.map(s => `<div><span class="settings-hero-stat-num">${s.num}</span><span class="settings-hero-stat-label">${s.label}</span></div>`).join('')}
                </div>
            `;
            section.insertBefore(hero, section.firstChild);
        });
    })();

    // --- Guided Tour ---
    // --- Guided Tour (multi-page) ---
    const tourSteps = [
        // HOME (steps 0-1)
        {
            view: 'home',
            target: '.priority-banner',
            title: 'Your daily briefing',
            text: 'Walter surfaces the most urgent action each morning. Review it, act on it, or dismiss to move to the next priority.',
            arrow: 'top'
        },
        {
            view: 'home',
            target: '.wallace-ambient-card',
            title: 'Wallace works in the background',
            text: 'Wallace continuously matches tenants and buyers to your listings. New matches appear here each day — review and send introductions with one click.',
            arrow: 'top',
            scroll: true
        },
        // MY PROPERTIES (steps 2-4)
        {
            view: 'properties',
            target: '.mp-dashboard',
            title: 'Portfolio at a glance',
            text: 'Eight smart widgets filter your 54 properties by risk, signals, stickiness, and value. Click any widget to instantly filter the table below.',
            arrow: 'top'
        },
        {
            view: 'properties',
            target: '.mp-export-btn',
            title: 'Export & add properties',
            text: 'Export your portfolio to CSV, or search Walter\'s database of 113,000+ NZ commercial properties to add new ones to your watchlist.',
            arrow: 'top'
        },
        {
            view: 'properties',
            target: '.properties-table',
            title: 'Click any row for the full picture',
            text: 'Every row opens a detailed property card with owner and tenant intel, lease history, and AI insights.',
            arrow: 'top',
            scroll: true
        },
        {
            view: 'properties',
            target: '.prop-action-menu',
            title: 'Quick actions menu',
            text: 'The ⋮ menu on each row gives you instant access to key workflows — generate a Heads of Terms, draft a Lease Agreement, open the property summary, or view data and reports. This is where deals start.',
            arrow: 'left',
            scroll: true,
            before: function() {
                // Open the first row's action menu
                const btn = document.querySelector('.prop-action-btn');
                if (btn && !btn.classList.contains('open')) btn.click();
            }
        },
        // MARKET (steps 5-6)
        {
            view: 'market',
            target: '#leafletMap',
            title: 'Interactive market map',
            text: 'Explore Auckland\'s commercial landscape. Click any pin to see property details, tenant signals, and predicted demand. Blue = office, purple = retail, green = industrial, orange = new signal.',
            arrow: 'top'
        },
        {
            view: 'market',
            target: '.market-intel-panel',
            title: 'Market intelligence sidebar',
            text: 'Three tabs — Overview for market stats, Signals for live property feeds, and Insights for AI-generated market trends. Clicking a signal flies the map to that property.',
            arrow: 'left'
        },
        // LISTINGS (steps 7-8)
        {
            view: 'listings',
            target: '.listing-card',
            title: 'Your active listings',
            text: 'Each listing card shows real market data, Walter\'s AI insight, and Wallace match indicators. Click any card for the full gallery, comparable analysis, and tenant matching.',
            arrow: 'top'
        },
        {
            view: 'listings',
            target: '.listing-card .wallace-pips',
            title: 'Wallace match pips',
            text: 'These coloured dots show how many prospective matches Wallace has found for each listing. More pips = stronger demand signal.',
            arrow: 'top',
            fallback: '.listing-card'
        },
        // ADVISORY (steps 9-10)
        {
            view: 'documents',
            target: '.advisory-prompt',
            title: 'Proactive advisory',
            text: 'Walter monitors your portfolio and prompts you when leases need attention. Zara identifies upcoming renewals and recommends starting reviews early for negotiation leverage.',
            arrow: 'top'
        },
        {
            view: 'documents',
            target: '.docs-workflows-4',
            title: 'Four advisory workflows',
            text: 'Single lease review, lease comparison, OPEX budget generator, and S&P agreement analysis — each powered by Walter\'s LLM trained on thousands of NZ commercial agreements.',
            arrow: 'top'
        },
        // COMMAND (steps)
        {
            view: 'command',
            target: '.cmd-hero',
            title: 'Your property-aware inbox',
            text: 'Command combines email, calendar, and AI intelligence in one workspace. Every email is auto-tagged to its property by Brittany and filed to Vault RE — no manual CRM entry.',
            arrow: 'top'
        },
        {
            view: 'command',
            target: '.cmd-today-brief',
            title: 'AI-drafted replies and meeting prep',
            text: 'Click any email to see Walter\'s AI-drafted reply, reviewed by Zara for accuracy. Click any meeting for property-aware prep notes with talking points and attendee intel.',
            arrow: 'top'
        },
        // SETTINGS
        {
            view: 'settings',
            target: '.settings-page-tabs',
            title: 'Configure your setup',
            text: 'Maximise Walter by connecting your data sources, fine-tuning alert preferences, configuring your five AI agents, and setting your personal context so every recommendation is relevant to you.',
            arrow: 'top'
        },
        // FINAL (step 12)
        {
            view: 'home',
            target: '.walter-fab',
            title: 'Ask Walter anything',
            text: 'Walter is always available. Click this button from any page to ask about properties, tenants, market trends, or to draft documents. Walter works across all your data.',
            arrow: 'bottom'
        }
    ];

    let tourStep = 0;
    const tourOverlay = document.getElementById('tourOverlay');
    const tourTooltip = document.getElementById('tourTooltip');
    const tourContent = document.getElementById('tourContent');
    const tourStepIndicator = document.getElementById('tourStepIndicator');
    const tourNext = document.getElementById('tourNext');
    const tourSkip = document.getElementById('tourSkip');

    function showTourStep(idx) {
        if (idx >= tourSteps.length) { closeTour(); return; }
        const step = tourSteps[idx];

        // Navigate to the correct view
        const currentView = document.querySelector('.view.active')?.id?.replace('view-', '');
        if (step.view && step.view !== currentView) {
            switchView(step.view);
        }

        // Small delay to allow view to render
        setTimeout(() => {
            // Run pre-step action (e.g. open a menu)
            if (step.before) step.before();

            // Extra delay for before actions to render
            setTimeout(() => {
            let el = document.querySelector(step.target);
            if (!el && step.fallback) el = document.querySelector(step.fallback);
            if (!el) { tourStep++; showTourStep(tourStep); return; }

            // Scroll element into view if needed
            if (step.scroll) {
                el.scrollIntoView({ behavior: 'instant', block: 'center' });
            }

            // Update content
            tourContent.innerHTML = `<h4>${step.title}</h4><p>${step.text}</p>`;
            tourStepIndicator.textContent = `${idx + 1} of ${tourSteps.length}`;
            tourNext.textContent = idx === tourSteps.length - 1 ? 'Get started' : 'Next';

            tourTooltip.className = 'tour-tooltip arrow-' + step.arrow;

            const rect = el.getBoundingClientRect();
            let top, left;

            if (step.arrow === 'top') {
                top = rect.bottom + 12;
                left = Math.max(20, rect.left);
            } else if (step.arrow === 'left') {
                top = rect.top + Math.min(rect.height / 2, 40);
                left = rect.right + 12;
            } else if (step.arrow === 'bottom') {
                top = rect.top - 200;
                left = rect.left - 260;
            }

            // Clamp within viewport
            top = Math.max(10, Math.min(top, window.innerHeight - 220));
            left = Math.max(10, Math.min(left, window.innerWidth - 360));

            tourTooltip.style.top = top + 'px';
            tourTooltip.style.left = left + 'px';
            }, step.before ? 150 : 0);
        }, step.view !== currentView ? 250 : 50);
    }

    function startTour() {
        if (sessionStorage.getItem('walter-tour-done')) return;
        tourStep = 0;
        tourOverlay?.classList.add('active');
        showTourStep(0);
    }

    function closeTour() {
        tourOverlay?.classList.remove('active');
        sessionStorage.setItem('walter-tour-done', '1');
        // Clean up any open menus
        document.querySelectorAll('.prop-action-btn.open').forEach(b => b.classList.remove('open'));
        document.querySelectorAll('.prop-action-menu.open').forEach(m => m.classList.remove('open'));
        // Return to home
        switchView('home');
    }

    tourNext?.addEventListener('click', () => {
        tourStep++;
        showTourStep(tourStep);
    });
    tourSkip?.addEventListener('click', closeTour);
    document.getElementById('tourBackdrop')?.addEventListener('click', closeTour);

    // Auto-start tour after 800ms
    setTimeout(startTour, 800);

});
