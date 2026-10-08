WineCraft — iPad Edition (offline)
==================================

Same app as the PC edition, adjusted for iPad/Safari: full-screen home-screen
app, safe-area padding, 44pt touch targets, 16px inputs (no zoom-on-focus),
Share-sheet backup export ("Save to Files"), and Add-to-Home-Screen guidance.

An iPad can't run a local server, so the folder must be put on any HTTPS web
host ONCE. After that it works with no internet.

STEP 1 - PUT THE FOLDER ONLINE (pick one; all free)
  - Netlify Drop: go to https://app.netlify.com/drop and drag this whole folder.
  - GitHub Pages: upload this folder's contents to a repo, enable Pages.
  - Cloudflare Pages / any web host with HTTPS also works.
  (The site is static and contains no data of yours; your records only ever
  live on the iPad.)

STEP 2 - INSTALL ON THE IPAD
  1. Open the site's address in SAFARI (not Chrome).
  2. Wait a few seconds for it to finish loading once (this caches everything).
  3. Tap Share -> "Add to Home Screen" -> Add.
  4. Launch WineCraft from the home screen. Turn on Airplane Mode to test:
     it should still open and work.

YOUR DATA
  - Stored on the iPad, in the installed app's own storage. It is separate from
    Safari's storage and from the PC edition.
  - Deleting the home-screen app deletes its data. Use Settings > Backup >
    Export regularly and save the file to Files/iCloud Drive.
  - To move PC data to the iPad: export on the PC, get the file onto the iPad
    (AirDrop/iCloud/email), then Settings > Backup > Import in the iPad app.

UPDATING
  When you change files, re-upload them and bump CACHE_NAME in
  service-worker.js (e.g. winecraft-ipad-v2). Reopen the app online once, then
  close and reopen it to pick up the new version.
