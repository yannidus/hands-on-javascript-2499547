# Putting Shanana Coffee online with Cloudflare Pages

The site is plain HTML, so there is nothing to build. Pick ONE of the two options.

## Option A: drag and drop (easiest, no software needed)

1. Unzip `shanana-site.zip` on your computer. You get a folder named `shanana-site`.
2. Log in at https://dash.cloudflare.com
3. In the left menu, open **Workers & Pages**, then click **Create** → **Pages** tab → **Upload assets** (Direct Upload).
4. Project name: `shanana-coffee` → **Create project**.
5. Drag the whole `shanana-site` folder into the upload box → **Deploy site**.
6. After about a minute your site is live at `https://shanana-coffee.pages.dev`
   (if that name is taken, Cloudflare shows the address it gave you).

To update the site later: open the project → **Create deployment** → drag the folder again.

## Option B: the script (for repeat updates from a terminal)

1. Install Node.js (LTS) from https://nodejs.org
2. Open a terminal in the `shanana-site` folder.
3. Run: `bash deploy.sh`
   - The first time, a browser window opens. Log in to Cloudflare and click **Allow**.
   - It creates the `shanana-coffee` project and uploads the site.
4. Run `bash deploy.sh` again whenever the site changes.

## Use your own domain (for example shananacoffee.com)

1. In the Pages project, open **Custom domains** → **Set up a custom domain**.
2. Type the domain (e.g. `shananacoffee.com`, and add `www.shananacoffee.com` too).
3. If the domain is already on Cloudflare, it sets up DNS for you. If not, follow the
   DNS record Cloudflare shows you at your domain registrar.
4. HTTPS is switched on automatically within a few minutes.

## Before you share it publicly
- The Arabica bean photo (`arabica.jpg`) came from social media: replace it unless you have the rights.
- The story-page video uses free photos; two need credit, already shown under the video.
- The inquiry form prepares an email in the visitor's mail app; it does not send by itself.
