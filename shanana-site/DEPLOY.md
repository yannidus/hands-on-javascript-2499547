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

## Connect www.shananacafe.com

Domain names are not case-sensitive, so www.ShananaCafe.com and www.shananacafe.com are the same address.

### Step 1: Put the domain on Cloudflare (recommended)
Skip this if shananacafe.com already appears under **Websites** in your Cloudflare dashboard.
1. In Cloudflare, click **Add a domain**, type `shananacafe.com`, choose the **Free** plan.
2. Cloudflare shows two **nameservers** (like `ada.ns.cloudflare.com`).
3. Log in where you bought the domain (GoDaddy, Namecheap, Google/Squarespace, etc.),
   find **Nameservers**, choose **Custom**, and paste Cloudflare's two nameservers.
4. Wait until Cloudflare emails you that the domain is **Active** (usually under an hour, up to 24 h).

### Step 2: Attach the domain to the site
1. Cloudflare → **Workers & Pages** → your project (`shanana-coffee`) → **Custom domains**.
2. **Set up a custom domain** → type `www.shananacafe.com` → **Continue** → **Activate domain**.
3. Do it again for `shananacafe.com` (without www).
4. Wait for both to show **Active** (a few minutes). HTTPS turns on automatically.

### Step 3: Send everyone to the www address
1. Cloudflare → open **shananacafe.com** → **Rules** → **Redirect Rules** → **Create rule**.
2. Choose the template **Redirect from Root to WWW**, then **Deploy**.
   Now `shananacafe.com` always lands on `https://www.shananacafe.com`.

### If you can't move the nameservers
At your registrar, add a DNS record: type **CNAME**, name **www**, value **shanana-coffee.pages.dev**.
Then do Step 2 for `www.shananacafe.com` only. Use the registrar's "domain forwarding"
to send `shananacafe.com` to `https://www.shananacafe.com`.

### Check it worked
Open https://www.shananacafe.com and https://shananacafe.com. Both should show the site with a padlock.

## Before you share it publicly
- The Arabica bean photo (`arabica.jpg`) came from social media: replace it unless you have the rights.
- The story-page video uses free photos; two need credit, already shown under the video.
- The inquiry form prepares an email in the visitor's mail app; it does not send by itself.
