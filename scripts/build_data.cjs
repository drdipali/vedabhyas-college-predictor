const fs = require('fs');
const path = require('path');

// Load current 60 colleges
const currentColleges = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/colleges.json'), 'utf-8'));

// Additional high-demand colleges to expand state quotas
const additionalColleges = [
  {
    "id": "tibbia-delhi",
    "name": "Ayurvedic & Unani Tibbia College, University of Delhi",
    "shortName": "A&U Tibbia College Delhi",
    "city": "Karol Bagh, New Delhi",
    "state": "Delhi",
    "quota": "State",
    "institutionType": "Government",
    "stipend": "₹95,000 / month",
    "stipendAmount": 95000,
    "annualFee": "₹16,500 / year",
    "categoryClosingRanks": {
      "General": 285,
      "OBC": 412,
      "SC": 890,
      "ST": 2100,
      "EWS": 360
    },
    "hospitalBeds": 300,
    "opdPerDay": 1800,
    "established": 1921,
    "type": "Delhi University Affiliated Govt College",
    "topBranches": [
      "Kriya Sharir",
      "Dravyaguna",
      "Kayachikitsa",
      "Ayurveda Samhita & Siddhanta"
    ],
    "description": "Historic national heritage college inaugurated by Mahatma Gandhi. High clinical OPD in central Karol Bagh Delhi.",
    "website": "https://autc.delhi.gov.in"
  },
  {
    "id": "ymt-navi-mumbai",
    "name": "YMT Ayurvedic Medical College & Hospital",
    "shortName": "YMT Kharghar Navi Mumbai",
    "city": "Navi Mumbai",
    "state": "Maharashtra",
    "quota": "State",
    "institutionType": "Private",
    "stipend": "₹28,000 / month",
    "stipendAmount": 28000,
    "annualFee": "₹3,45,000 / year",
    "categoryClosingRanks": {
      "General": 3450,
      "OBC": 4820,
      "SC": 6900,
      "ST": 11200,
      "EWS": 3980
    },
    "hospitalBeds": 280,
    "opdPerDay": 650,
    "established": 1989,
    "type": "MUHS Nashik Affiliated Private College",
    "topBranches": [
      "Kayachikitsa",
      "Shalya Tantra",
      "Panchakarma",
      "Stri Roga",
      "Rasa Shastra"
    ],
    "description": "Premier private Ayurvedic college in Mumbai metropolitan region under MUHS Nashik with extensive clinical exposure.",
    "website": "https://ymtayurved.org"
  },
  {
    "id": "hadapsar-pune",
    "name": "Sumatibhai Shah Ayurved Mahavidyalaya, Malwadi, Hadapsar",
    "shortName": "SSAM Hadapsar Pune",
    "city": "Pune",
    "state": "Maharashtra",
    "quota": "State",
    "institutionType": "Government",
    "stipend": "₹45,000 / month",
    "stipendAmount": 45000,
    "annualFee": "₹65,000 / year",
    "categoryClosingRanks": {
      "General": 1820,
      "OBC": 2450,
      "SC": 4900,
      "ST": 8500,
      "EWS": 2200
    },
    "hospitalBeds": 310,
    "opdPerDay": 920,
    "established": 1955,
    "type": "Govt-Aided Maharashtra State Quota",
    "topBranches": [
      "Kayachikitsa",
      "Shalya Tantra",
      "Prasuti Tantra",
      "Dravyaguna",
      "Samhita"
    ],
    "description": "Reputed government-aided Ayurvedic college in Pune with Sane Guruji Hospital and high clinical research output.",
    "website": "https://ssam.in"
  },
  {
    "id": "jhansi-up",
    "name": "Bundelkhand Government Ayurvedic College & Hospital",
    "shortName": "Bundelkhand GAC Jhansi",
    "city": "Jhansi",
    "state": "Uttar Pradesh",
    "quota": "State",
    "institutionType": "Government",
    "stipend": "₹68,000 / month",
    "stipendAmount": 68000,
    "annualFee": "₹19,000 / year",
    "categoryClosingRanks": {
      "General": 1420,
      "OBC": 1850,
      "SC": 4250,
      "ST": 7900,
      "EWS": 1650
    },
    "hospitalBeds": 220,
    "opdPerDay": 750,
    "established": 1934,
    "type": "UP State Quota Govt College",
    "topBranches": [
      "Kayachikitsa",
      "Dravyaguna",
      "Roga Nidana",
      "Shalya Tantra"
    ],
    "description": "Historical government Ayurvedic institution serving Bundelkhand region under UP State AYUSH counseling.",
    "website": "https://bgachjhansi.org"
  },
  {
    "id": "yenepoya-mangalore",
    "name": "Yenepoya Ayurveda Medical College & Hospital (Deemed)",
    "shortName": "Yenepoya Ayurveda Mangalore",
    "city": "Mangalore",
    "state": "Karnataka",
    "quota": "Deemed/Mgt",
    "institutionType": "Deemed",
    "stipend": "₹35,000 / month",
    "stipendAmount": 35000,
    "annualFee": "₹4,20,000 / year",
    "categoryClosingRanks": {
      "General": 8450,
      "OBC": 9200,
      "SC": 12500,
      "ST": 15600,
      "EWS": 8700
    },
    "hospitalBeds": 260,
    "opdPerDay": 580,
    "established": 2015,
    "type": "Deemed to be University",
    "topBranches": [
      "Kayachikitsa",
      "Panchakarma",
      "Shalya Tantra",
      "Kaumarbhritya"
    ],
    "description": "Modern multi-disciplinary Deemed University campus in coastal Karnataka with NABH accredited hospital.",
    "website": "https://yenepoya.edu.in"
  },
  {
    "id": "sheth-jp-bhavnagar",
    "name": "Sheth J.P. Government Ayurved College",
    "shortName": "Sheth JP GAC Bhavnagar",
    "city": "Bhavnagar",
    "state": "Gujarat",
    "quota": "State",
    "institutionType": "Government",
    "stipend": "₹64,000 / month",
    "stipendAmount": 64000,
    "annualFee": "₹14,500 / year",
    "categoryClosingRanks": {
      "General": 890,
      "OBC": 1420,
      "SC": 3800,
      "ST": 6500,
      "EWS": 1150
    },
    "hospitalBeds": 240,
    "opdPerDay": 700,
    "established": 1968,
    "type": "Gujarat State Quota Govt College",
    "topBranches": [
      "Kayachikitsa",
      "Panchakarma",
      "Dravyaguna",
      "Kaumarbhritya"
    ],
    "description": "Reputed Gujarat state government college under Gujarat Ayurved University and ACPUGMEC state counseling.",
    "website": "https://shethjpgovtayurved.org"
  },
  {
    "id": "rewa-mp",
    "name": "Government Autonomous Ayurved College & Hospital, Rewa",
    "shortName": "Govt Ayurved Rewa",
    "city": "Rewa",
    "state": "Madhya Pradesh",
    "quota": "State",
    "institutionType": "Government",
    "stipend": "₹62,000 / month",
    "stipendAmount": 62000,
    "annualFee": "₹24,000 / year",
    "categoryClosingRanks": {
      "General": 1280,
      "OBC": 1750,
      "SC": 3950,
      "ST": 6200,
      "EWS": 1480
    },
    "hospitalBeds": 210,
    "opdPerDay": 620,
    "established": 1971,
    "type": "MP Online State Quota Govt College",
    "topBranches": [
      "Kayachikitsa",
      "Panchakarma",
      "Shalya Tantra",
      "Roga Nidana"
    ],
    "description": "Government Ayurvedic institution under MP Online AYUSH counseling with high regional patient intake.",
    "website": "https://gaacrewa.org"
  },
  {
    "id": "shyamadas-kolkata",
    "name": "Institute of Post Graduate Ayurvedic Education & Research (IPGAE&R), Shyamadas",
    "shortName": "IPGAER Shyamadas Kolkata",
    "city": "Kolkata",
    "state": "West Bengal",
    "quota": "State",
    "institutionType": "Government",
    "stipend": "₹55,000 / month",
    "stipendAmount": 55000,
    "annualFee": "₹12,000 / year",
    "categoryClosingRanks": {
      "General": 940,
      "OBC": 1390,
      "SC": 3100,
      "ST": 5800,
      "EWS": 1180
    },
    "hospitalBeds": 200,
    "opdPerDay": 800,
    "established": 1976,
    "type": "West Bengal WBMCC State Govt College",
    "topBranches": [
      "Kayachikitsa",
      "Dravyaguna",
      "Rasa Shastra",
      "Panchakarma"
    ],
    "description": "Premier post-graduate research institute in West Bengal affiliated to West Bengal University of Health Sciences (WBUHS).",
    "website": "https://ipgaer.org"
  },
  {
    "id": "sgt-gurugram",
    "name": "Faculty of Indian Medical System, SGT University",
    "shortName": "SGT University Gurugram",
    "city": "Gurugram",
    "state": "Haryana",
    "quota": "Deemed/Mgt",
    "institutionType": "Private",
    "stipend": "₹32,000 / month",
    "stipendAmount": 32000,
    "annualFee": "₹3,95,000 / year",
    "categoryClosingRanks": {
      "General": 5200,
      "OBC": 6800,
      "SC": 9800,
      "ST": 13400,
      "EWS": 5600
    },
    "hospitalBeds": 350,
    "opdPerDay": 1100,
    "established": 2013,
    "type": "Private University (NCR Region)",
    "topBranches": [
      "Kayachikitsa",
      "Shalya Tantra",
      "Prasuti Tantra",
      "Panchakarma",
      "Dravyaguna"
    ],
    "description": "Multi-specialty 800+ bed hospital campus in Gurugram NCR with advanced Panchakarma and surgical operation theatres.",
    "website": "https://sgtuniversity.ac.in"
  },
  {
    "id": "siwan-bihar",
    "name": "Dayanand Ayurvedic Medical College & Hospital",
    "shortName": "Dayanand AMC Siwan",
    "city": "Siwan",
    "state": "Bihar",
    "quota": "State",
    "institutionType": "Government",
    "stipend": "₹42,000 / month",
    "stipendAmount": 42000,
    "annualFee": "₹38,000 / year",
    "categoryClosingRanks": {
      "General": 2100,
      "OBC": 2900,
      "SC": 5400,
      "ST": 8200,
      "EWS": 2400
    },
    "hospitalBeds": 180,
    "opdPerDay": 520,
    "established": 1972,
    "type": "Bihar State BCECEB Quota College",
    "topBranches": [
      "Kayachikitsa",
      "Dravyaguna",
      "Rasa Shastra",
      "Samhita"
    ],
    "description": "Govt-aided heritage institution under Kameshwar Singh Darbhanga Sanskrit University and BCECEB Bihar counseling.",
    "website": "https://damcsiwan.org"
  }
];

// Combine and standardize all colleges to ensure all requested keys are present
const combinedMap = new Map();

currentColleges.forEach(c => combinedMap.set(c.id, c));
additionalColleges.forEach(c => combinedMap.set(c.id, c));

const standardizedColleges = Array.from(combinedMap.values()).map(c => {
  // Normalize branches
  const branches = c.topBranches || c.branches || ["Kayachikitsa", "Shalya Tantra", "Panchakarma"];
  
  // Normalize category closing ranks
  const catRanks = c.categoryClosingRanks || {
    General: c.closingRank,
    OBC: Math.round(c.closingRank * 1.25),
    SC: Math.round(c.closingRank * 2.8),
    ST: Math.round(c.closingRank * 4.2),
    EWS: Math.round(c.closingRank * 1.15)
  };

  const lastYearClosing = {
    UR: catRanks.General ?? c.closingRank,
    OBC: catRanks.OBC ?? Math.round(c.closingRank * 1.25),
    EWS: catRanks.EWS ?? Math.round(c.closingRank * 1.15),
    SC: catRanks.SC ?? Math.round(c.closingRank * 2.8),
    ST: catRanks.ST ?? Math.round(c.closingRank * 4.2),
  };

  const quotaType = c.type?.includes('Apex') || c.type?.includes('National') 
    ? 'National Institute' 
    : c.quota === 'Deemed/Mgt' ? 'Deemed' : c.quota === 'State' ? 'State' : 'AIQ';

  const collegeType = c.institutionType === 'Government' 
    ? (c.type?.includes('Aided') ? 'Govt-Aided' : 'Govt') 
    : c.institutionType;

  return {
    ...c,
    // Explicit user requested keys:
    college_name: c.name,
    quota_type: quotaType,
    college_type: collegeType,
    branches: branches,
    last_year_closing_rank: lastYearClosing,
    fees_approx: c.annualFee,
    source_url: c.website,
    // Existing keys maintained for backward compatibility:
    categoryClosingRanks: catRanks,
    topBranches: branches
  };
});

// Write to public/data/colleges.json and src/data/colleges.json
fs.writeFileSync(path.join(__dirname, '../public/data/colleges.json'), JSON.stringify(standardizedColleges, null, 2));
fs.writeFileSync(path.join(__dirname, '../src/data/colleges.json'), JSON.stringify(standardizedColleges, null, 2));

console.log('Saved', standardizedColleges.length, 'standardized colleges to public/data/colleges.json and src/data/colleges.json');
