import defaultKnowledgeBase from '../data/counselling_knowledge_base.json';
import type { StudentProfile, StudentPreference, CounsellingAlertsFeed, CounsellingUpdate } from '../types';
import { collegesData } from '../data/colleges';

export interface AACCCCentralKB {
  title: string;
  scope_and_quotas: string;
  fees_and_security_deposit: {
    aiq_govt_central_national: {
      non_refundable_registration_fee: string;
      refundable_security_deposit: string;
      total_payable: string;
    };
    deemed_universities: {
      non_refundable_registration_fee: string;
      refundable_security_deposit: string;
      total_payable: string;
    };
    refund_rule: string;
  };
  exit_and_forfeiture_rules: {
    round_1: string;
    round_2: string;
    round_3: string;
    stray_vacancy_round: string;
  };
  seat_conversion_algorithm: string;
  latest_official_circular_2026: {
    date: string;
    subject: string;
    details: string;
    schedule: string;
  };
  official_links: Record<string, string>;
}

export interface StateCounsellingKB {
  authority_name: string;
  official_portal: string;
  domicile_eligibility: string;
  quota_types: string;
  security_deposit: string;
  free_exit_and_forfeiture: string;
  upgradation_rules: string;
  bond_policy: string;
  last_verified_date: string;
}

export interface GeneralFAQKB {
  id: string;
  topic: string;
  question: string;
  answer: string;
}

export interface CounsellingKnowledgeBase {
  last_updated: string;
  version: string;
  aaccc_central: AACCCCentralKB;
  states: Record<string, StateCounsellingKB>;
  general_faqs: GeneralFAQKB[];
}

const STORAGE_KEY = 'vedabhyas_counselling_kb_v1';

// Load Knowledge Base with fallback hierarchy: LocalStorage -> Bundled JSON
export const getStoredKnowledgeBase = (): CounsellingKnowledgeBase => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.aaccc_central && parsed.states) {
        return parsed as CounsellingKnowledgeBase;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored knowledge base, using bundled:', err);
  }
  return defaultKnowledgeBase as unknown as CounsellingKnowledgeBase;
};

// Save updated Knowledge Base to LocalStorage
export const saveKnowledgeBase = (kb: CounsellingKnowledgeBase): boolean => {
  try {
    kb.last_updated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kb, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to save knowledge base:', err);
    return false;
  }
};

// Reset Knowledge Base to bundled default
export const resetKnowledgeBaseToDefault = (): CounsellingKnowledgeBase => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return defaultKnowledgeBase as unknown as CounsellingKnowledgeBase;
};

export type ScopeTopic = 'all' | 'aaccc' | 'states' | 'fees' | 'documents' | 'my_list';

// Grounded RAG Answering Engine
export const generateGroundedCounselorAnswer = (
  userQuery: string,
  scope: ScopeTopic,
  student: StudentProfile | null,
  preferences: StudentPreference[],
  manualNotices: CounsellingUpdate[],
  feed?: CounsellingAlertsFeed
): { text: string; action?: { type: 'whatsapp' | 'college' | 'link'; label: string; url?: string } } => {
  const q = userQuery.toLowerCase().trim();
  const kb = getStoredKnowledgeBase();

  const WHATSAPP_NUMBER = '8208506052';
  const WHATSAPP_URL = `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello%20Vedabhyas,%20I%20need%20expert%20AIAPGET%20counseling%20guidance.`;

  // 1. Direct Counselor Contact / WhatsApp
  if (
    q.includes('whatsapp') ||
    q.includes('contact') ||
    q.includes('phone') ||
    q.includes('mentor') ||
    q.includes('call') ||
    q.includes('helpline') ||
    q.includes('number')
  ) {
    return {
      text: `You can connect directly with our senior Ayurvedic counseling mentors on **WhatsApp at +91 ${WHATSAPP_NUMBER}** for 1-on-1 choice list reviews, seat matrix verification, and doubt clearance.`,
      action: {
        type: 'whatsapp',
        label: `Chat on WhatsApp (+91 ${WHATSAPP_NUMBER})`,
        url: WHATSAPP_URL,
      },
    };
  }

  // 2. Latest AACCC Circular / High Court Order / Round 2 LIVE Notice
  if (
    q.includes('latest notice') ||
    q.includes('circular') ||
    q.includes('high court') ||
    q.includes('delhi high court') ||
    q.includes('round 2 live') ||
    q.includes('round 1 treated as round 2') ||
    q.includes('r2 latest') ||
    q.includes('hold') ||
    (q.includes('aaccc') && (q.includes('update') || q.includes('notice') || q.includes('latest')))
  ) {
    const circ = kb.aaccc_central.latest_official_circular_2026;
    const pinnedNotice = manualNotices.find(n => n.is_pinned) || manualNotices[0];
    let reply = `### 📢 Official AACCC Notification (Dated ${circ.date})\n\n`;
    reply += `**Subject:** ${pinnedNotice?.title || circ.subject}\n\n`;
    reply += `• **High Court Order Implementation:** Per the Hon'ble High Court of Delhi directions, AACCC PG Ayurveda Round 1 is now formally treated as **Round 2**.\n`;
    reply += `• **Previously Registered Candidates:** Students who registered in Round 1 **do NOT** need to register or pay fees again.\n`;
    reply += `• **Auto-Fetched Choices:** Your Round 1 choices are auto-fetched into the portal. You can modify, reorder, or add newly introduced Ayurveda PG seats.\n`;
    reply += `• **Schedule:** Registration & Choice Filling LIVE from **Nov 20 to Nov 22, 2026** (Choice locking till 11:55 PM). Reporting: **Nov 25–29, 2026**.\n`;
    reply += `• **Merit Allotment:** Seats will be allotted strictly based on the revised NTA AIAPGET merit list.\n`;
    if (feed?.active_portals_count) {
      reply += `• **Live Portals Monitored:** Active updates tracked from ${feed.active_portals_count} verified state portals + Central AACCC.\n\n`;
    } else {
      reply += `\n`;
    }
    reply += `Verify directly on the official portal: [aaccc.gov.in/pg-counselling/](https://aaccc.gov.in/pg-counselling/)`;

    return {
      text: reply,
      action: {
        type: 'link',
        label: 'Open AACCC Official Portal ↗',
        url: pinnedNotice?.official_link || kb.aaccc_central.official_links.portal,
      },
    };
  }

  // 3. Free Exit vs. Forfeiture vs. Debarment
  if (
    q.includes('free exit') ||
    q.includes('forfeiture') ||
    q.includes('penalty') ||
    q.includes('debar') ||
    q.includes('resign') ||
    q.includes('surrender') ||
    q.includes('quit') ||
    scope === 'fees'
  ) {
    const exitRules = kb.aaccc_central.exit_and_forfeiture_rules;
    let reply = `### ⚖️ AACCC Round-by-Round Exit & Forfeiture Rules\n\n`;
    reply += `• **Round 1 (Free Exit):** ${exitRules.round_1}\n\n`;
    reply += `• **Round 2 (NO Free Exit):** ${exitRules.round_2}\n\n`;
    reply += `• **Round 3 & Stray Vacancy (Mandatory Joining):** ${exitRules.round_3}\n\n`;
    reply += `• **Seat Conversion in R3:** ${kb.aaccc_central.seat_conversion_algorithm}\n\n`;
    reply += `> ⚠️ **Important:** If you withdraw after joining an R2 seat, you must submit withdrawal at least 3 days before Round 3 starts to remain eligible for R3.`;

    return {
      text: reply,
      action: {
        type: 'link',
        label: 'View Official AACCC Schedule ↗',
        url: kb.aaccc_central.official_links.schedule,
      },
    };
  }

  // 4. Fees & Refundable Security Deposit
  if (
    q.includes('security deposit') ||
    q.includes('fee') ||
    q.includes('refund') ||
    q.includes('registration fee') ||
    q.includes('20000') ||
    q.includes('50000')
  ) {
    const fees = kb.aaccc_central.fees_and_security_deposit;
    let reply = `### 💳 AACCC Counselling Registration & Security Deposit\n\n`;
    reply += `**1. AIQ Govt / Central Universities / National Institutes:**\n`;
    reply += `• Non-refundable Fee: **${fees.aiq_govt_central_national.non_refundable_registration_fee}**\n`;
    reply += `• Refundable Security Deposit: **${fees.aiq_govt_central_national.refundable_security_deposit}**\n`;
    reply += `• Total Payable at Registration: **${fees.aiq_govt_central_national.total_payable}**\n\n`;
    reply += `**2. Deemed Universities (100% All India Seats):**\n`;
    reply += `• Non-refundable Fee: **${fees.deemed_universities.non_refundable_registration_fee}**\n`;
    reply += `• Refundable Security Deposit: **${fees.deemed_universities.refundable_security_deposit}**\n`;
    reply += `• Total Payable at Registration: **${fees.deemed_universities.total_payable}**\n\n`;
    reply += `**3. Refund Policy Rule:**\n`;
    reply += `• ${fees.refund_rule}`;

    return {
      text: reply,
      action: {
        type: 'link',
        label: 'View AACCC Information Bulletin ↗',
        url: kb.aaccc_central.official_links.bulletin,
      },
    };
  }

  // 5. Document Checklist & Certificate Formats
  if (
    q.includes('document') ||
    q.includes('checklist') ||
    q.includes('certificate') ||
    q.includes('obc') ||
    q.includes('ews') ||
    q.includes('central format') ||
    q.includes('internship') ||
    scope === 'documents'
  ) {
    const docFaq = kb.general_faqs.find((f) => f.id === 'faq-document-checklist');
    const certFaq = kb.general_faqs.find((f) => f.id === 'faq-category-certificate-formats');

    let reply = `### 📑 Complete AIAPGET 2026 Reporting Document Checklist\n\n`;
    reply += `${docFaq?.answer}\n\n`;
    reply += `### ⚠️ Central vs. State Certificate Formats:\n`;
    reply += `${certFaq?.answer}`;

    return {
      text: reply,
      action: {
        type: 'link',
        label: 'Download Prescribed Formats on AACCC ↗',
        url: kb.aaccc_central.official_links.bulletin,
      },
    };
  }

  // 6. State-Specific Rules (Detect state in query or scope)
  const matchedStateKey = Object.keys(kb.states).find(
    (st) => q.includes(st.toLowerCase()) || (student?.bamsState && student.bamsState.toLowerCase() === st.toLowerCase() && (scope === 'states' || q.includes('state') || q.includes('domicile')))
  );

  if (matchedStateKey) {
    const stInfo = kb.states[matchedStateKey];
    let reply = `### 🏛️ ${matchedStateKey} State AYUSH PG Counselling Guidelines\n\n`;
    reply += `• **Counselling Authority:** ${stInfo.authority_name}\n`;
    reply += `• **Official Portal:** [${stInfo.official_portal}](${stInfo.official_portal})\n`;
    reply += `• **Domicile Eligibility:** ${stInfo.domicile_eligibility}\n`;
    reply += `• **Available Quotas:** ${stInfo.quota_types}\n`;
    reply += `• **Security Deposit:** ${stInfo.security_deposit}\n`;
    reply += `• **Free Exit & Forfeiture:** ${stInfo.free_exit_and_forfeiture}\n`;
    reply += `• **Upgradation Rules:** ${stInfo.upgradation_rules}\n`;
    reply += `• **Service Bond & Penalty:** ${stInfo.bond_policy}\n\n`;
    reply += `*Note: Always verify exact fees, dates, and seat matrices in the 2026 State Information Bulletin on ${stInfo.official_portal}.*`;

    return {
      text: reply,
      action: {
        type: 'link',
        label: `Open ${matchedStateKey} Official Portal ↗`,
        url: stInfo.official_portal,
      },
    };
  }

  // 7. My Rank & Choice List inquiries
  if (scope === 'my_list' || q.includes('my list') || q.includes('my choices') || q.includes('preference') || q.includes('my rank')) {
    if (!student) {
      return {
        text: `Please sign in or enter your AIAPGET rank to see personalized college chances and analyze your saved preference choice list.`,
      };
    }

    let reply = `### 🎓 Candidate Profile: ${student.fullName}\n\n`;
    reply += `• **AIAPGET AIR:** #${student.aiapgetRank} (${student.category} Category)\n`;
    reply += `• **Domicile State:** ${student.bamsState || 'Not specified'}\n`;
    reply += `• **Saved Preferences:** ${preferences.length} choices added\n\n`;

    if (preferences.length > 0) {
      reply += `**Your Top 3 Priority Choices:**\n`;
      preferences.slice(0, 3).forEach((p) => {
        reply += `${p.priority_order}. **${p.college_name}** — *${p.branch}* (${p.quota_type || 'State'})\n`;
      });
      reply += `\n*Review all choices and verify codes in the 'My Choices' modal before locking on the official portal.*`;
    } else {
      reply += `You haven't added colleges to your preference list yet. Click **+ Add to Preference List** on any predictor card or search in the Choice Filling workspace!`;
    }

    return {
      text: reply,
    };
  }

  // 8. General AIAPGET Rank Evaluation (e.g. "air 450", "rank 800")
  const rankMatch = q.match(/\b(\d{1,5})\b/);
  if (rankMatch && (q.includes('rank') || q.includes('air') || q.includes('chance') || q.includes('get') || q.includes('marks'))) {
    const userRank = parseInt(rankMatch[1], 10);
    if (userRank > 0 && userRank <= 25000) {
      const safe = collegesData
        .filter((c) => c.closingRank >= userRank)
        .sort((a, b) => a.closingRank - b.closingRank)
        .slice(0, 4);

      let reply = `### 📊 AIAPGET Prediction Assessment for AIR #${userRank}\n\n`;
      if (userRank <= 500) {
        reply += `With an impressive rank of **AIR #${userRank}**, you stand a high chance in premier National Institutes like **AIIA New Delhi, NIA Jaipur, ITRA Jamnagar, and IMS BHU** under Central AIQ.\n\n`;
      } else if (userRank <= 2000) {
        reply += `At **AIR #${userRank}**, top State Government Ayurvedic Colleges (e.g., Podar Mumbai, GAC Nanded, MMM Udaipur, GAC Varanasi) and Central AIQ clinical branches are strongly within reach.\n\n`;
      } else {
        reply += `At **AIR #${userRank}**, State Quota Government seats in later rounds, Govt-Aided institutes, and leading Private Ayurvedic Medical Colleges are viable options.\n\n`;
      }

      if (safe.length > 0) {
        reply += `**Recommended Benchmark Colleges:**\n`;
        safe.forEach((c) => {
          reply += `• **${c.name}** (${c.state}) — Closing Rank: ~#${c.closingRank} (${c.quota_type || c.quota})\n`;
        });
      }

      reply += `\n*Note: Closing ranks are reference cutoffs from previous rounds. Always check official AACCC seat matrices.*`;
      return {
        text: reply,
      };
    }
  }

  // 9. AACCC vs State Comparison
  if (q.includes('vs') || q.includes('difference') || q.includes('central or state')) {
    const faq = kb.general_faqs.find((f) => f.id === 'faq-aaccc-vs-state');
    return {
      text: `### ⚖️ AACCC Central vs. State AYUSH Counselling\n\n${faq?.answer}`,
      action: {
        type: 'link',
        label: 'Open AACCC Portal ↗',
        url: kb.aaccc_central.official_links.portal,
      },
    };
  }

  // 10. Default Fallback with Quick Guidance
  return {
    text: `Namaste! 🙏 I am your **Vedabhyas AIAPGET 2026 Counselling Assistant**.\n\nI can answer questions regarding:\n• **AACCC Central Rules:** Round 1 & 2 exit, security deposit refund, R3 seat conversion\n• **State Counselling Rules:** Domicile eligibility, service bonds, and quotas for 13+ states\n• **Choice Strategy & Documents:** Mandatory reporting certificates and Central OBC/EWS formats\n• **Latest Nov 2026 Circular:** Delhi High Court directions & Round 2 choice modification\n\n*What specific question do you have regarding your rank, state, or choice filling?*`,
    action: {
      type: 'whatsapp',
      label: 'Consult Mentor on WhatsApp ↗',
      url: WHATSAPP_URL,
    },
  };
};
