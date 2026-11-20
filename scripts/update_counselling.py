#!/usr/bin/env python3
"""
AIAPGET 2026 Live Counselling Scraper & Alert Engine
=====================================================
Monitors Central (AACCC) and State AYUSH PG counselling portals:
- Central: AACCC (aaccc.gov.in/news-events-pg/ & aaccc.gov.in/pg-counselling/)
- Maharashtra: State CET Cell (cetcell.mahacet.org)
- Karnataka: KEA (cetonline.karnataka.gov.in/kea)
- Gujarat: ACPUGMEC (medadmgujarat.org)
- Madhya Pradesh: MP Online Ayush (ayush.mponline.gov.in)
- Rajasthan: DSRRAU Raj Ayush (rajayushcounselling.com)
- Kerala: CEE Kerala (cee.kerala.gov.in)
- West Bengal: WBMCC (wbmcc.nic.in)
- Haryana: SKAU Kurukshetra (skau.ac.in)

Features:
- Scrapes AACCC news-events-pg HTML <table> rows directly for Title, Year, and PDF links
- Scrapes AACCC pg-counselling CANDIDATE ACTIVITY BOARD & NEWS & EVENTS sections
- Automatic SSL verify=False fallback for government portals
- Compares new events against public/data/counselling_updates.json
- Detects PDFs and appends to data/pending_pdfs.json
- Optional Telegram notification push for urgent updates
"""

import sys
import os
import json
import re
import datetime
import ssl
import urllib.request
import urllib.error
import urllib.parse
import html as html_parser

# Path configuration
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
UPDATES_FILE = os.path.join(BASE_DIR, 'public', 'data', 'counselling_updates.json')
SRC_UPDATES_FILE = os.path.join(BASE_DIR, 'src', 'data', 'counselling_updates.json')
MANUAL_NOTICES_FILE = os.path.join(BASE_DIR, 'public', 'data', 'manual_notices.json')
PENDING_PDFS_FILE = os.path.join(BASE_DIR, 'data', 'pending_pdfs.json')
COLLEGES_FILE = os.path.join(BASE_DIR, 'public', 'data', 'colleges.json')
MANUAL_CHECK_FILE = os.path.join(BASE_DIR, 'scripts', 'manual_check_needed.md')

# Realistic Browser User-Agent simulation
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
}

# Target state portals configuration
STATE_PORTALS = [
    {
        'state': 'Maharashtra',
        'name': 'Maharashtra State CET Cell',
        'url': 'https://cetcell.mahacet.org/',
        'selector_hint': 'ayush',
        'keywords': ['ayush', 'pg', 'aiapget', 'selection', 'cap', 'ayurveda', 'merit']
    },
    {
        'state': 'Karnataka',
        'name': 'Karnataka Examination Authority (KEA)',
        'url': 'https://cetonline.karnataka.gov.in/kea/',
        'selector_hint': 'pget',
        'keywords': ['pget', 'ayush', 'ayurveda', 'option', 'round', 'allotment']
    },
    {
        'state': 'Gujarat',
        'name': 'ACPUGMEC Gujarat',
        'url': 'https://www.medadmgujarat.org/',
        'selector_hint': 'ayurveda',
        'keywords': ['ayush', 'pg', 'ayurveda', 'pin', 'round', 'merit', 'seat']
    },
    {
        'state': 'Madhya Pradesh',
        'name': 'MP Online Ayush Counselling',
        'url': 'https://ayush.mponline.gov.in/',
        'selector_hint': 'notice',
        'keywords': ['pg', 'ayurveda', 'allotment', 'merit', 'round']
    },
    {
        'state': 'Rajasthan',
        'name': 'Rajasthan Ayush Counselling (DSRRAU)',
        'url': 'https://rajayushcounselling.com/',
        'selector_hint': 'schedule',
        'keywords': ['pg', 'aiapget', 'ayurveda', 'registration', 'round', 'allotment']
    },
    {
        'state': 'Kerala',
        'name': 'CEE Kerala',
        'url': 'https://cee.kerala.gov.in/',
        'selector_hint': 'ayush',
        'keywords': ['pg', 'ayurveda', 'category', 'allotment', 'rank']
    },
    {
        'state': 'West Bengal',
        'name': 'WBMCC Ayush Counselling',
        'url': 'https://wbmcc.nic.in/',
        'selector_hint': 'ayush',
        'keywords': ['ayush', 'pg', 'ayurveda', 'seat', 'matrix', 'notice']
    },
    {
        'state': 'Haryana',
        'name': 'SKAU Kurukshetra AYUSH',
        'url': 'https://skau.ac.in/',
        'selector_hint': 'allotment',
        'keywords': ['aiapget', 'pg', 'ayurveda', 'merit', 'round', 'allotment']
    }
]

def create_unverified_ssl_context():
    """Create a permissive SSL context for government portals with legacy certs."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def log_manual_check(state, url, reason):
    """Log blocked or CAPTCHA-gated portal to scripts/manual_check_needed.md."""
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"| {now} | {state} | {url} | {reason} | Manual verification required |\n"
    
    try:
        if not os.path.exists(MANUAL_CHECK_FILE):
            with open(MANUAL_CHECK_FILE, 'w', encoding='utf-8') as f:
                f.write("# AIAPGET Counselling Portals - Manual Inspection Log\n\n")
                f.write("| Date & Time | State / Portal | Target URL | Issue Detected | Action Required |\n")
                f.write("|-------------|----------------|------------|----------------|-----------------|\n")
        
        with open(MANUAL_CHECK_FILE, 'a', encoding='utf-8') as f:
            f.write(entry)
        print(f"  [LOGGED FOR MANUAL CHECK] {state}: {reason}")
    except Exception as e:
        print(f"  [ERROR WRITING MANUAL LOG] {e}")

def fetch_html(url, timeout=15):
    """Fetch HTML content with realistic headers and verify=False fallback for .gov.in SSL certs."""
    req = urllib.request.Request(url, headers=HEADERS)

    # First attempt: standard default SSL verification
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                charset = response.headers.get_content_charset() or 'utf-8'
                return response.read().decode(charset, errors='replace')
    except (ssl.SSLError, urllib.error.URLError, Exception):
        # Fallback attempt: permissive SSL context without hostname verification
        pass

    try:
        unverified_ctx = create_unverified_ssl_context()
        with urllib.request.urlopen(req, timeout=timeout, context=unverified_ctx) as response:
            if response.status != 200:
                raise RuntimeError(f"HTTP {response.status} (Non-200 Status Received)")
            charset = response.headers.get_content_charset() or 'utf-8'
            return response.read().decode(charset, errors='replace')
    except urllib.error.HTTPError as e:
        if e.code in (403, 429, 503):
            raise RuntimeError(f"HTTP {e.code} (Anti-bot / Cloudflare Challenge / Access Forbidden)")
        raise RuntimeError(f"HTTP Error {e.code}: {e.reason}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Network / Connection Failure: {e.reason}")
    except Exception as e:
        raise RuntimeError(f"Fetch Exception: {str(e)}")

def scrape_aaccc_news_events_table(html_content, base_url='https://aaccc.gov.in/news-events-pg/'):
    """
    Scrape https://aaccc.gov.in/news-events-pg/ HTML <table> rows directly for:
    - Title
    - Year
    - PDF/View link
    """
    found_events = []
    if not html_content:
        return found_events

    # Parse <tr> rows
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html_content, re.DOTALL | re.IGNORECASE)
    for r in rows:
        tds = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL | re.IGNORECASE)
        if not tds:
            continue

        first_td = tds[0]
        links = re.findall(r'href=["\']([^"\']+)["\']', r, re.IGNORECASE)
        if not links:
            continue

        raw_title = re.sub(r'<[^>]+>', ' ', first_td)
        title = html_parser.unescape(raw_title)
        title = re.sub(r'\s+', ' ', title).strip()

        if len(title) < 6:
            continue

        # Extract Year if in second td
        year = "2026"
        if len(tds) > 1:
            clean_year = re.sub(r'<[^>]+>', '', tds[1]).strip()
            if clean_year.isdigit():
                year = clean_year

        # Preferred download / PDF link
        best_link = links[0]
        for l in links:
            if '.pdf' in l.lower() or 'upload' in l.lower():
                best_link = l
                break

        full_url = urllib.parse.urljoin(base_url, best_link)

        # Extract date from PDF URL if available (e.g. /uploads/2026/11/20261120... -> 2026-11-20)
        date_str = datetime.datetime.now().strftime('%Y-%m-%d')
        date_match = re.search(r'/uploads/(\d{4})/(\d{2})/(\d{4})(\d{2})(\d{2})', full_url)
        if date_match:
            date_str = f"{date_match.group(3)}-{date_match.group(4)}-{date_match.group(5)}"

        title_lower = title.lower()
        category = 'Notice'
        is_urgent = False

        if any(w in title_lower for w in ['result', 'allotment', 'selection', 'merit list']):
            category = 'Result'
            is_urgent = True
        elif any(w in title_lower for w in ['choice', 'option', 'locking', 'unlocking']):
            category = 'Choice Filling'
            is_urgent = True
        elif any(w in title_lower for w in ['seat', 'matrix', 'addition of new seats', 'vacant']):
            category = 'Seat Matrix'
            is_urgent = True
        elif any(w in title_lower for w in ['registration', 'apply', 'application']):
            category = 'Registration'
            is_urgent = True
        elif any(w in title_lower for w in ['schedule', 'reschedule', 'revised', 'extended', 'date']):
            category = 'Schedule Change'
            is_urgent = True

        slug = re.sub(r'[^a-z0-9]+', '-', title_lower)[:40].strip('-')
        event_id = f"aaccc-{slug}"

        found_events.append({
            'id': event_id,
            'state': 'Central (AACCC)',
            'title': title,
            'year': year,
            'date': date_str,
            'category': category,
            'is_urgent': is_urgent,
            'official_link': full_url,
            'summary': f"Official {category.lower()} update released on AACCC PG portal."
        })

    return found_events

def scrape_aaccc_pg_counselling_portal(html_content, base_url='https://aaccc.gov.in/pg-counselling/'):
    """
    Scrape https://aaccc.gov.in/pg-counselling/ specifically checking:
    - CANDIDATE ACTIVITY BOARD (e.g., Round 2 registration link)
    - NEWS & EVENTS section
    - LATEST NEWS ticker
    """
    found_events = []
    if not html_content:
        return found_events

    # Sections to search
    sections = [
        ('CANDIDATE ACTIVITY BOARD', 'Registration', True),
        ('NEWS & EVENTS', 'Notice', False),
        ('LATEST NEWS', 'Notice', False)
    ]

    for header_text, default_cat, default_urgent in sections:
        pos = html_content.find(header_text)
        if pos == -1:
            continue

        # Look in the enclosing card/div/slider (approx 3500 chars)
        snippet = html_content[pos:pos+3500]
        links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', snippet, re.IGNORECASE | re.DOTALL)

        for href, text in links:
            raw_title = re.sub(r'<[^>]+>', ' ', text)
            title = html_parser.unescape(raw_title)
            title = re.sub(r'\s+', ' ', title).strip()

            # Clean extraneous noise like "New" badge or arrows
            title = re.sub(r'\bNew\b', '', title, flags=re.IGNORECASE).strip()
            title = re.sub(r'\s+', ' ', title).strip()

            if len(title) < 10 or len(title) > 220 or title.lower() in ['view more', 'click here', 'read more', 'download']:
                continue

            full_url = urllib.parse.urljoin(base_url, href)

            date_str = datetime.datetime.now().strftime('%Y-%m-%d')
            date_match = re.search(r'/uploads/(\d{4})/(\d{2})/(\d{4})(\d{2})(\d{2})', full_url)
            if date_match:
                date_str = f"{date_match.group(3)}-{date_match.group(4)}-{date_match.group(5)}"

            title_lower = title.lower()
            category = default_cat
            is_urgent = default_urgent

            if any(w in title_lower for w in ['result', 'allotment', 'selection']):
                category = 'Result'
                is_urgent = True
            elif any(w in title_lower for w in ['choice', 'option', 'locking', 'unlocking']):
                category = 'Choice Filling'
                is_urgent = True
            elif any(w in title_lower for w in ['seat', 'matrix', 'addition of new seats', 'vacant']):
                category = 'Seat Matrix'
                is_urgent = True
            elif any(w in title_lower for w in ['registration', 'apply', 'application', 'new registration']):
                category = 'Registration'
                is_urgent = True
            elif any(w in title_lower for w in ['schedule', 'reschedule', 'revised', 'extended', 'date']):
                category = 'Schedule Change'
                is_urgent = True

            slug = re.sub(r'[^a-z0-9]+', '-', title_lower)[:40].strip('-')
            event_id = f"aaccc-{slug}"

            found_events.append({
                'id': event_id,
                'state': 'Central (AACCC)',
                'title': title,
                'date': date_str,
                'category': category,
                'is_urgent': is_urgent,
                'official_link': full_url,
                'summary': f"Official {category.lower()} update released on AACCC PG portal."
            })

    return found_events

def extract_state_links_and_titles(html_content, base_url, portal_info):
    """Extract candidate notices from state AYUSH portals."""
    found_events = []
    pattern = re.compile(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.IGNORECASE | re.DOTALL)
    matches = pattern.findall(html_content)
    keywords = portal_info['keywords']

    for href, raw_text in matches:
        title = re.sub(r'<[^>]+>', ' ', raw_text)
        title = html_parser.unescape(title)
        title = re.sub(r'\s+', ' ', title).strip()

        if len(title) < 8 or len(title) > 200:
            continue

        title_lower = title.lower()
        href_lower = href.lower()

        matches_keyword = any(k in title_lower or k in href_lower for k in keywords)
        if not matches_keyword:
            continue

        full_url = urllib.parse.urljoin(base_url, href)

        category = 'Notice'
        is_urgent = False

        if any(w in title_lower for w in ['result', 'allotment', 'selection', 'merit list']):
            category = 'Result'
            is_urgent = True
        elif any(w in title_lower for w in ['choice', 'option entry', 'locking']):
            category = 'Choice Filling'
            is_urgent = True
        elif any(w in title_lower for w in ['seat matrix', 'vacant', 'seats']):
            category = 'Seat Matrix'
        elif any(w in title_lower for w in ['registration', 'application', 'apply']):
            category = 'Registration'
            is_urgent = True
        elif any(w in title_lower for w in ['schedule', 'reschedule', 'revised', 'extended', 'date']):
            category = 'Schedule Change'
            is_urgent = True

        clean_slug = re.sub(r'[^a-z0-9]+', '-', title_lower)[:40].strip('-')
        event_id = f"{portal_info['state'].lower()[:4]}-{clean_slug}"

        found_events.append({
            'id': event_id,
            'state': portal_info['state'],
            'title': title,
            'date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'category': category,
            'is_urgent': is_urgent,
            'official_link': full_url,
            'summary': f"Official {category.lower()} update released for {portal_info['state']} AIAPGET counseling."
        })

    return found_events

def log_pending_pdf(state, title, url):
    """Save newly discovered allotment or cutoff PDFs to data/pending_pdfs.json."""
    if not url.lower().endswith('.pdf') and '.pdf' not in url.lower():
        return

    try:
        pending = []
        if os.path.exists(PENDING_PDFS_FILE):
            with open(PENDING_PDFS_FILE, 'r', encoding='utf-8') as f:
                pending = json.load(f)

        if any(p.get('source_url') == url for p in pending):
            return

        slug = re.sub(r'[^a-z0-9]+', '-', title.lower())[:30]
        pdf_entry = {
            'id': f"pdf-{slug}-{int(datetime.datetime.now().timestamp())}",
            'state': state,
            'title': title,
            'detected_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'status': 'pending_review',
            'source_url': url,
            'notes': 'Automatically detected by scraper. Ready for cutoff extraction.'
        }
        pending.insert(0, pdf_entry)

        with open(PENDING_PDFS_FILE, 'w', encoding='utf-8') as f:
            json.dump(pending, f, indent=2)
        print(f"  [NEW PDF DETECTED] {title} ({url})")
    except Exception as e:
        print(f"  [ERROR SAVING PENDING PDF] {e}")

def push_telegram_alert(event):
    """Optional push alert to Telegram channel if credentials are provided."""
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        return

    message = (
        f"🚨 *AIAPGET 2026 COUNSELLING ALERT*\n\n"
        f"📍 *State:* {event['state']}\n"
        f"📌 *Category:* {event['category']}\n"
        f"📢 *Notice:* {event['title']}\n\n"
        f"🔗 [View Official Document]({event['official_link']})"
    )

    tg_url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'Markdown',
        'disable_web_page_preview': False
    }).encode('utf-8')

    try:
        req = urllib.request.Request(tg_url, data=payload, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"  [TELEGRAM ALERT SENT] {event['title']}")
    except Exception as e:
        print(f"  [TELEGRAM ALERT FAILED] {e}")

def run_scraper():
    print("=" * 70)
    print("Starting AIAPGET 2026 Live Counselling Scraper Engine")
    print("Timestamp:", datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("=" * 70)

    # 1. Read-Only load of manual pinned notices
    manual_pinned_notices = []
    if os.path.exists(MANUAL_NOTICES_FILE):
        try:
            with open(MANUAL_NOTICES_FILE, 'r', encoding='utf-8') as f:
                manual_pinned_notices = json.load(f)
            print(f"Loaded {len(manual_pinned_notices)} verified manual pinned notices.")
        except Exception as e:
            print("Error reading manual_notices.json:", e)

    # 2. Load existing scraped updates
    existing_data = {
        "last_updated": datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S+05:30'),
        "active_session": "AIAPGET 2026–2027",
        "monitoring_status": "Active (9 Verified Live Portals + Central AACCC)",
        "active_portals_count": 0,
        "total_portals_monitored": len(STATE_PORTALS) + 1,
        "urgent_ticker": [],
        "updates": []
    }

    if os.path.exists(UPDATES_FILE):
        try:
            with open(UPDATES_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except Exception as e:
            print("Error loading existing updates file, starting fresh:", e)

    existing_ids = {u['id'] for u in existing_data.get('updates', [])}
    existing_urls = {u.get('official_link') for u in existing_data.get('updates', []) if u.get('official_link')}
    new_events_count = 0
    live_active_portals = 0

    # -------------------------------------------------------------------------
    # 3. SPECIALIZED AACCC SCRAPING: news-events-pg table + pg-counselling
    # -------------------------------------------------------------------------
    print("\n" + "-" * 70)
    print("1. Scraping Central AACCC Portals (https://aaccc.gov.in)...")
    print("-" * 70)

    aaccc_events = []

    # A. Scrape https://aaccc.gov.in/news-events-pg/ table directly
    url_news_table = 'https://aaccc.gov.in/news-events-pg/'
    try:
        print(f"  -> Fetching AACCC Table: {url_news_table} ...")
        html_table = fetch_html(url_news_table, timeout=15)
        table_notices = scrape_aaccc_news_events_table(html_table, url_news_table)
        print(f"  [AACCC] Successfully scraped {len(table_notices)} official notices from HTML table rows.")
        aaccc_events.extend(table_notices)
        live_active_portals += 1
    except Exception as err:
        print(f"  [AACCC] Table scrape failed: {err}")
        log_manual_check('Central (AACCC Table)', url_news_table, str(err))

    # B. Scrape https://aaccc.gov.in/pg-counselling/
    url_pg_main = 'https://aaccc.gov.in/pg-counselling/'
    try:
        print(f"  -> Fetching AACCC PG Portal: {url_pg_main} ...")
        html_main = fetch_html(url_pg_main, timeout=15)
        portal_notices = scrape_aaccc_pg_counselling_portal(html_main, url_pg_main)
        print(f"  [AACCC] Successfully scraped {len(portal_notices)} notices from Candidate Activity Board & News.")
        aaccc_events.extend(portal_notices)
    except Exception as err:
        print(f"  [AACCC] Portal scrape failed: {err}")
        log_manual_check('Central (AACCC Portal)', url_pg_main, str(err))

    # Deduplicate AACCC notices
    unique_aaccc = []
    seen_aaccc_urls = set()
    seen_aaccc_titles = set()

    for item in aaccc_events:
        u = item.get('official_link')
        t = item.get('title', '').strip().lower()
        if (u and u in seen_aaccc_urls) or (t in seen_aaccc_titles):
            continue
        if u:
            seen_aaccc_urls.add(u)
        seen_aaccc_titles.add(t)
        unique_aaccc.append(item)

    print(f"  [AACCC] Total unique live notices scraped from AACCC: {len(unique_aaccc)}")

    # Incorporate AACCC events
    for event in unique_aaccc:
        log_pending_pdf('Central (AACCC)', event['title'], event['official_link'])

        if event['id'] not in existing_ids and event['official_link'] not in existing_urls:
            existing_data['updates'].insert(0, event)
            existing_ids.add(event['id'])
            existing_urls.add(event['official_link'])
            new_events_count += 1
            print(f"  + [NEW AACCC NOTICE] [{event['date']}] {event['title']}")

            if event.get('is_urgent'):
                push_telegram_alert(event)

    # -------------------------------------------------------------------------
    # 4. STATE AYUSH COUNSELLING PORTALS
    # -------------------------------------------------------------------------
    print("\n" + "-" * 70)
    print("2. Scanning State AYUSH Counselling Portals...")
    print("-" * 70)

    for portal in STATE_PORTALS:
        state = portal['state']
        name = portal['name']
        url = portal['url']
        print(f"\nScanning {state} [{name}] ({url})...")

        try:
            html_content = fetch_html(url, timeout=12)
            live_active_portals += 1
            print(f"  -> HTTP 200 OK. Parsing live page content...")

            events = extract_state_links_and_titles(html_content, url, portal)
            print(f"  Found {len(events)} relevant AIAPGET items from verified live markup.")

            for event in events:
                log_pending_pdf(state, event['title'], event['official_link'])

                if event['id'] not in existing_ids and event['official_link'] not in existing_urls:
                    existing_data['updates'].insert(0, event)
                    existing_ids.add(event['id'])
                    existing_urls.add(event['official_link'])
                    new_events_count += 1
                    print(f"  + Live Event Added: {event['title']}")

                    if event.get('is_urgent'):
                        push_telegram_alert(event)

        except Exception as err:
            print(f"  -> Portal Check Failed: {err}")
            log_manual_check(state, url, str(err))

    # -------------------------------------------------------------------------
    # 5. METADATA & URGENT TICKER SYNCHRONIZATION
    # -------------------------------------------------------------------------
    now_str = datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S+05:30')
    existing_data['last_updated'] = now_str
    existing_data['active_portals_count'] = live_active_portals
    total_portals = len(STATE_PORTALS) + 1
    existing_data['total_portals_monitored'] = total_portals
    existing_data['monitoring_status'] = f"Active ({live_active_portals} Verified Live Portals + Central AACCC)"

    # Build urgent ticker: Manual pinned urgent items FIRST, then live scraped urgent items
    ticker_list = []
    for m in manual_pinned_notices:
        if m.get('is_urgent') or m.get('is_pinned'):
            ticker_list.append(f"🔴 {m['state']}: {m['title']}")

    for u in existing_data['updates']:
        if u.get('is_urgent'):
            item_text = f"🔴 {u['state']}: {u['title']}"
            if item_text not in ticker_list:
                ticker_list.append(item_text)

    existing_data['urgent_ticker'] = ticker_list[:8]

    # Deduplicate updates by ID and official_link, filter generic garbage
    deduped_updates = []
    seen_ids = set()
    seen_urls = set()
    for u in existing_data['updates']:
        uid = u.get('id')
        link = u.get('official_link')
        title_l = u.get('title', '').strip().lower()
        if title_l in ['view more', 'click here', 'read more', 'download']:
            continue
        if uid in seen_ids or (link and link in seen_urls):
            continue
        seen_ids.add(uid)
        if link:
            seen_urls.add(link)
        deduped_updates.append(u)

    # Sort all updates: latest date first, then urgent first
    deduped_updates.sort(key=lambda x: (x.get('date', ''), 1 if x.get('is_urgent') else 0), reverse=True)

    # Keep list bounded to latest 60 updates
    existing_data['updates'] = deduped_updates[:60]

    # Write updates
    with open(UPDATES_FILE, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, indent=2)

    try:
        with open(SRC_UPDATES_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2)
    except Exception:
        pass

    print("\n" + "=" * 70)
    print(f"Scrape Complete! {new_events_count} new live events incorporated.")
    print(f"Active Live Portals: {live_active_portals} / {total_portals}")
    print(f"Total Scraped Updates in Feed: {len(existing_data['updates'])}")
    print(f"Last Updated: {existing_data['last_updated']}")
    print("=" * 70)

if __name__ == '__main__':
    run_scraper()
