#!/usr/bin/env python3
"""
AIAPGET 2026 Live Counselling Scraper & Alert Engine
=====================================================
Monitors Central (AACCC) and State AYUSH PG counselling portals:
- Central: AACCC (aaccc.gov.in)
- Maharashtra: State CET Cell (cetcell.mahacet.org)
- Uttar Pradesh: UP Ayush Counselling (upayushcounseling.upsdc.gov.in)
- Karnataka: KEA (cetonline.karnataka.gov.in/kea)
- Gujarat: ACPUGMEC (medadmgujarat.org)
- Madhya Pradesh: MP Online Ayush (ayush.mponline.gov.in)
- Rajasthan: DSRRAU Raj Ayush (rajayushcounselling.com)
- Kerala: CEE Kerala (cee.kerala.gov.in)
- West Bengal: WBMCC (wbmcc.nic.in)
- Haryana: SKAU Kurukshetra (skau.ac.in)

Features:
- Compares new events against public/data/counselling_updates.json
- Detects PDFs and appends to data/pending_pdfs.json
- Gracefully handles Cloudflare/CAPTCHA/SSL blocks and logs to scripts/manual_check_needed.md
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

# Path configuration
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
UPDATES_FILE = os.path.join(BASE_DIR, 'public', 'data', 'counselling_updates.json')
SRC_UPDATES_FILE = os.path.join(BASE_DIR, 'src', 'data', 'counselling_updates.json')
MANUAL_NOTICES_FILE = os.path.join(BASE_DIR, 'public', 'data', 'manual_notices.json')  # READ-ONLY: Never overwrite
PENDING_PDFS_FILE = os.path.join(BASE_DIR, 'data', 'pending_pdfs.json')
COLLEGES_FILE = os.path.join(BASE_DIR, 'public', 'data', 'colleges.json')
MANUAL_CHECK_FILE = os.path.join(BASE_DIR, 'scripts', 'manual_check_needed.md')

# User-Agent simulation
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

# Target portals configuration - Verified via Live HTTP Audit
PORTALS = [
    {
        'state': 'Central (AACCC)',
        'name': 'AACCC PG Counselling',
        'url': 'https://aaccc.gov.in/pg-counselling/',
        'selector_hint': 'notices',
        'keywords': ['aiapget', 'pg', 'ayurveda', 'md', 'ms', 'allotment', 'choice', 'schedule', 'round']
    },
    {
        'state': 'Maharashtra',
        'name': 'Maharashtra State CET Cell',
        'url': 'https://cetcell.mahacet.org/',
        'selector_hint': 'ayush',
        'keywords': ['ayush', 'pg', 'aiapget', 'selection', 'cap', 'ayurveda', 'merit']
    },
    # [COMMENTED OUT - Live Audit Failed: SSL Handshake Timeout (ECONNRESET) - Awaiting user corrected URL]
    # {
    #     'state': 'Uttar Pradesh',
    #     'name': 'UP Ayush Counselling Portal',
    #     'url': 'https://upayushcounseling.upsdc.gov.in/',
    #     'selector_hint': 'merit',
    #     'keywords': ['pg', 'allotment', 'merit', 'ayurveda', 'round', 'counselling']
    # },
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

def create_ssl_context():
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

def fetch_html(url, timeout=12):
    """Fetch HTML content strictly requiring HTTP 200."""
    req = urllib.request.Request(url, headers=HEADERS)
    ctx = create_ssl_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
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

def extract_links_and_titles(html, base_url, portal_info):
    """Extract candidate notices, links, and PDF files matching AIAPGET keywords."""
    found_events = []
    
    # 1. Regex find all anchor tags with href and text
    pattern = re.compile(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.IGNORECASE | re.DOTALL)
    matches = pattern.findall(html)
    
    keywords = portal_info['keywords']

    for href, raw_text in matches:
        # Clean text
        title = re.sub(r'<[^>]+>', ' ', raw_text)
        title = re.sub(r'\s+', ' ', title).strip()
        
        if len(title) < 8 or len(title) > 200:
            continue

        title_lower = title.lower()
        href_lower = href.lower()

        # Check keyword relevance
        matches_keyword = any(k in title_lower or k in href_lower for k in keywords)
        if not matches_keyword:
            continue

        # Resolve full URL
        full_url = urllib.parse.urljoin(base_url, href)

        # Categorize
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

        # Unique ID slug
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

        # Avoid duplicates
        if any(p.get('source_url') == url for p in pending):
            return

        slug = re.sub(r'[^a-z0-9]+', '-', title.lower())[:30]
        pdf_entry = {
            'id': f"pdf-{slug}-{int(datetime.datetime.now().timestamp())}",
            'state': state,
            'title': title,
            'detected_at': datetime.datetime.utcnow().isoformat() + 'Z',
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
    print("=" * 65)
    print("Starting AIAPGET 2026 Live Counselling Scraper Engine")
    print("Timestamp:", datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("=" * 65)

    # 1. Read-Only load of manual pinned notices (NEVER overwrite)
    manual_pinned_notices = []
    if os.path.exists(MANUAL_NOTICES_FILE):
        try:
            with open(MANUAL_NOTICES_FILE, 'r', encoding='utf-8') as f:
                manual_pinned_notices = json.load(f)
            print(f"Loaded {len(manual_pinned_notices)} verified manual pinned notices (read-only).")
        except Exception as e:
            print("Error reading manual_notices.json:", e)

    # 2. Load existing scraped updates
    existing_data = {
        "last_updated": datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S+05:30'),
        "active_session": "AIAPGET 2026–2027",
        "monitoring_status": "Active (9 Verified Live Portals + Central AACCC)",
        "active_portals_count": 0,
        "total_portals_monitored": len(PORTALS),
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
    new_events_count = 0
    live_active_portals = 0

    # 3. Strictly poll only active portals requiring live HTTP 200 response
    for portal in PORTALS:
        state = portal['state']
        name = portal['name']
        url = portal['url']
        print(f"\nScanning {state} [{name}] ({url})...")

        try:
            html = fetch_html(url, timeout=10)
            live_active_portals += 1
            print(f"  -> HTTP 200 OK. Parsing live page content...")

            events = extract_links_and_titles(html, url, portal)
            print(f"  Found {len(events)} relevant AIAPGET items from verified live markup.")

            for event in events:
                # Log PDF if found
                log_pending_pdf(state, event['title'], event['official_link'])

                # Append if novel
                if event['id'] not in existing_ids:
                    existing_data['updates'].insert(0, event)
                    existing_ids.add(event['id'])
                    new_events_count += 1
                    print(f"  + Live Event Added: {event['title']}")

                    if event.get('is_urgent'):
                        push_telegram_alert(event)

        except Exception as err:
            print(f"  -> Portal Check Failed: {err}")
            log_manual_check(state, url, str(err))

    # Update metadata
    now_str = datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S+05:30')
    existing_data['last_updated'] = now_str
    existing_data['active_portals_count'] = live_active_portals
    existing_data['total_portals_monitored'] = len(PORTALS)
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

    existing_data['urgent_ticker'] = ticker_list[:6]

    # Keep list bounded to latest 50 updates for performance
    existing_data['updates'] = existing_data['updates'][:50]

    # Save ONLY to counselling_updates.json (NEVER touch manual_notices.json)
    with open(UPDATES_FILE, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, indent=2)

    try:
        with open(SRC_UPDATES_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2)
    except Exception:
        pass

    print("\n" + "=" * 65)
    print(f"Scrape Complete! {new_events_count} live events incorporated.")
    print(f"Active Live Portals: {live_active_portals} / {len(PORTALS)}")
    print(f"Total Scraped Updates in Feed: {len(existing_data['updates'])}")
    print(f"Last Updated: {existing_data['last_updated']}")
    print("=" * 65)

if __name__ == '__main__':
    run_scraper()
