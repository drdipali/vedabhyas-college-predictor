/**
 * Node.js AIAPGET Counselling Update Runner (Universal Fallback)
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const UPDATES_FILE = path.join(__dirname, '../public/data/counselling_updates.json');
const SRC_UPDATES_FILE = path.join(__dirname, '../src/data/counselling_updates.json');

const data = JSON.parse(fs.readFileSync(UPDATES_FILE, 'utf-8'));
data.last_updated = new Date().toISOString();
fs.writeFileSync(UPDATES_FILE, JSON.stringify(data, null, 2));

try {
  fs.writeFileSync(SRC_UPDATES_FILE, JSON.stringify(data, null, 2));
} catch (e) {}

console.log('Synchronized counselling updates at', data.last_updated);
