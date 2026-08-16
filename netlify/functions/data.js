// netlify/functions/data.js
// API générique de stockage clé-valeur pour Tool Box by C·Evidentia.
// GET  /.netlify/functions/data?key=xxx        -> { value: "..." | null }
// POST /.netlify/functions/data  { key, value, password } -> { ok: true } (mot de passe requis, vérifié côté serveur)

const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const DEFAULT_PASSWORD = 'Teamops2026'; // mot de passe initial ; changeable depuis l'onglet Admin ensuite

function hashPw(pw) {
  return crypto.createHash('sha256').update(String(pw || '')).digest('hex');
}

async function getStoredHash(authStore) {
  let hash = await authStore.get('password-hash');
  if (!hash) {
    hash = hashPw(DEFAULT_PASSWORD);
    await authStore.set('password-hash', hash);
  }
  return hash;
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  const dataStore = getStore('toolbox-data');

  if (event.httpMethod === 'GET') {
    const key = event.queryStringParameters && event.queryStringParameters.key;
    if (!key) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Paramètre 'key' manquant." }) };
    }
    const value = await dataStore.get(key);
    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: value === undefined ? null : value }),
    };
  }

  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'JSON invalide.' }) };
    }
    const { key, value, password } = body;
    if (!key) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Paramètre 'key' manquant." }) };
    }

    const authStore = getStore('toolbox-auth');
    const storedHash = await getStoredHash(authStore);
    if (hashPw(password) !== storedHash) {
      return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Mot de passe incorrect.' }) };
    }

    await dataStore.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Méthode non autorisée.' }) };
};
