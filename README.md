# Tool Box by C'Evidentia — Déploiement (v1.1)

## Ce qui a changé

Avant : un seul fichier `.html` glissé-déposé sur Netlify. Toute mise à jour des
données (montures, préconisations, etc.) ne pouvait être publiée que depuis
Claude, jamais directement depuis le site.

Maintenant : le site inclut deux petites fonctions serveur (`netlify/functions/`)
qui stockent les données de façon permanente via **Netlify Blobs**. Résultat :
l'onglet Admin fonctionne désormais **directement sur le site déployé**, sans
repasser par Claude.

Contrepartie : ce n'est plus un simple fichier à glisser-déposer, c'est un
petit projet à déployer. Deux façons de faire, ci-dessous.

---

## Option A — Déploiement via Git + Netlify (recommandé)

1. Créez un dépôt (GitHub, GitLab...) et déposez-y tout le contenu de ce
   dossier (`index.html`, `netlify.toml`, `package.json`, `netlify/`).
2. Sur [app.netlify.com](https://app.netlify.com), "Add new site" →
   "Import an existing project" → connectez ce dépôt.
3. Netlify détecte automatiquement `netlify.toml`. Cliquez "Deploy".
4. Une fois déployé : allez dans **Site settings → Environment variables**,
   pas nécessaire pour cette version (le mot de passe est stocké directement
   dans Blobs, pas besoin de variable d'environnement).
5. Vérifiez que **Netlify Blobs** est actif : c'est automatique sur les
   comptes Netlify récents, aucune configuration supplémentaire n'est requise.

Chaque futur envoi sur le dépôt Git redéploiera automatiquement le site.

## Option B — Déploiement via la CLI Netlify (sans Git)

```bash
npm install -g netlify-cli
cd toolbox-site   # ce dossier
netlify login
netlify deploy --prod
```

La CLI installe les dépendances (`@netlify/blobs`) et déploie le site avec
ses fonctions en une seule commande.

---

## Mot de passe Admin

- Mot de passe par défaut à la première utilisation : **Teamops2026**
- Il est stocké côté serveur (haché, jamais en clair) dans Netlify Blobs.
- Il peut être changé directement depuis le site : Admin → tout en bas de
  la page → "Changer le mot de passe Admin".
- Si vous testez ce fichier `index.html` directement dans Claude (aperçu),
  le changement de mot de passe est désactivé (message explicite affiché) —
  cette fonctionnalité nécessite les fonctions serveur, donc un vrai
  déploiement Netlify.

## Vérifier que tout fonctionne après déploiement

1. Ouvrez le site déployé, allez dans Admin, connectez-vous.
2. Testez une petite modification (ex. Gestion mutuelles → masquer/afficher
   une mutuelle). Rechargez la page : le changement doit persister.
3. Si ça ne persiste pas, vérifiez dans Netlify : Site → Functions, que
   `data` et `auth` apparaissent bien et ne renvoient pas d'erreur (onglet
   "Function log").
