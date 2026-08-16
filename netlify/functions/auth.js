// netlify/functions/auth.js
// Vérifie ou change le mot de passe Admin de Tool Box by C·Evidentia.
// POST { action: 'verify', password }                       -> { ok: true|false }
// POST { action: 'change', oldPassword, newPassword }        -> { ok: true } ou { error: "..." }

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Méthode non autorisée.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'JSON invalide.' }) };
  }

  const authStore = getStore('toolbox-auth');
  const storedHash = await getStoredHash(authStore);

  if (body.action === 'verify') {
    const ok = hashPw(body.password) === storedHash;
    return {
      statusCode: ok ? 200 : 401,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok }),
    };
  }

  if (body.action === 'change') {
    if (hashPw(body.oldPassword) !== storedHash) {
      return {
        statusCode: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Ancien mot de passe incorrect.' }),
      };
    }
    if (!body.newPassword || String(body.newPassword).length < 6) {
      return {
        statusCode: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' }),
      };
    }
    await authStore.set('password-hash', hashPw(body.newPassword));
    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  }

  return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Action inconnue.' }) };
};
