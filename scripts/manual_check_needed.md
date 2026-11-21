# AIAPGET Counselling Portals - Manual Inspection Log

This log is automatically maintained by `scripts/update_counselling.py`.
Whenever a state counselling portal blocks automated scrapers (e.g. Cloudflare, CAPTCHA, SSL handshake failure, or WAF block), the URL and error reason are safely logged below without crashing the automated updater.

---

| Date & Time | State / Portal | Target URL | Issue Detected | Action Required |
|-------------|----------------|------------|----------------|-----------------|
| 2026-11-19 17:45:00 | MP Online | https://ayush.mponline.gov.in/ | Cloudflare JS Challenge (HTTP 403) | Periodic manual inspection for PDF downloads |
| 2026-11-19 17:45:00 | Rajasthan RajAyush | https://rajayushcounselling.com/ | Dynamic AJAX rendered table | Review Round 2 schedule and allotment lists |
| 2026-11-19 17:45:00 | KEA Karnataka | https://cetonline.karnataka.gov.in/kea/ | Occasional rate-limiting | Verify PGET Ayurveda option entry link |

---

### Recommended Verification Protocol
1. Open the target official state portal in a standard browser.
2. If a new allotment or seat matrix PDF is published, download it and place in `.user_uploaded/` or upload via the admin portal.
3. Run `python scripts/update_counselling.py` or trigger GitHub Actions to synchronize `counselling_updates.json`.
| 2026-11-20 19:49:51 | Karnataka | https://cetonline.karnataka.gov.in/kea/ | Network / Connection Failure: _ssl.c:1129: The handshake operation timed out | Manual verification required |
| 2026-11-20 19:50:18 | Madhya Pradesh | https://ayush.mponline.gov.in/ | Network / Connection Failure: _ssl.c:1129: The handshake operation timed out | Manual verification required |
| 2026-11-20 19:55:59 | Karnataka | https://cetonline.karnataka.gov.in/kea/ | Network / Connection Failure: _ssl.c:1129: The handshake operation timed out | Manual verification required |
| 2026-11-20 19:56:26 | Madhya Pradesh | https://ayush.mponline.gov.in/ | Network / Connection Failure: _ssl.c:1129: The handshake operation timed out | Manual verification required |
| 2026-11-21 09:12:28 | Karnataka | https://cetonline.karnataka.gov.in/kea/ | Network / Connection Failure: _ssl.c:1129: The handshake operation timed out | Manual verification required |
| 2026-11-21 09:12:56 | Madhya Pradesh | https://ayush.mponline.gov.in/ | Network / Connection Failure: _ssl.c:1129: The handshake operation timed out | Manual verification required |
| 2026-11-21 09:13:21 | Rajasthan | https://rajayushcounselling.com/ | Network / Connection Failure: _ssl.c:1129: The handshake operation timed out | Manual verification required |
