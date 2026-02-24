// api/share.js — Serves an HTML page with correct OG tags for link previews
// Share URLs should point to: adstrology.xyz/api/share?combo=Virgo-Horse
// Crawlers (iMessage, Twitter, etc.) will read the OG tags
// Browsers will be redirected to the main site

export default function handler(req, res) {
  const { combo } = req.query;

  if (!combo) {
    res.redirect(302, '/');
    return;
  }

  const [western, chinese] = combo.split('-');
  const title = `I'm a ${western} ${chinese} — Adstrology`;
  const description = `${western} × ${chinese}. Your Double Zodiac. Find yours at adstrology.xyz`;
  const imageUrl = `https://adstrology.xyz/cards/${combo}.png`;
  const siteUrl = `https://adstrology.xyz`;

  // Return HTML with OG tags for crawlers, plus a redirect for humans
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="630" />
  <meta property="og:image:height" content="768" />
  <meta property="og:url" content="${siteUrl}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <!-- Redirect humans to the main site -->
  <meta http-equiv="refresh" content="0;url=${siteUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${siteUrl}">Adstrology</a>...</p>
</body>
</html>`);
}
