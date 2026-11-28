#!/usr/bin/env bash
# Deploy the Shanana Coffee site to Cloudflare Pages.
# Run from inside the shanana-site folder:  bash deploy.sh
set -euo pipefail
PROJECT="${PROJECT:-shanana-coffee}"
cd "$(dirname "$0")"

command -v npx >/dev/null || { echo "Install Node.js first: https://nodejs.org (LTS version)"; exit 1; }

# 1. Log in to Cloudflare (opens your browser the first time)
npx --yes wrangler@3 whoami >/dev/null 2>&1 || npx --yes wrangler@3 login

# 2. Create the Pages project the first time (ignored if it already exists)
npx --yes wrangler@3 pages project create "$PROJECT" --production-branch main 2>/dev/null || true

# 3. Upload the site (everything in this folder except the script and guide)
TMP="$(mktemp -d)"
rsync -a --exclude deploy.sh --exclude DEPLOY.md --exclude '*.zip' ./ "$TMP/"
npx --yes wrangler@3 pages deploy "$TMP" --project-name "$PROJECT" --branch main --commit-dirty=true
rm -rf "$TMP"
echo "Done. Your site: https://$PROJECT.pages.dev"
