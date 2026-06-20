const fs = require('fs');

let svg = fs.readFileSync('public/intavue.svg', 'utf8');

// The background path is typically the first path, which fills the entire svg dimensions.
// In this case, it's <path d="M0 0 C549.12 0 1098.24 0 1664 0 C1664 306.24 1664 612.48 1664 928 C1114.88 928 565.76 928 0 928 C0 621.76 0 315.52 0 0 Z " fill="#F5F6F0" transform="translate(0,0)"/>
// We can just remove it by finding that specific line or regex.
const bgRegex = /<path d="M0 0 C549\.12 0 1098\.24 0 1664 0.*?fill="#F5F6F0".*?\/>\n?/;
svg = svg.replace(bgRegex, '');

// Now replace all fill colors with white
svg = svg.replace(/fill="[#a-zA-Z0-9]+"/g, 'fill="#FFFFFF"');

fs.writeFileSync('public/intavue.svg', svg);
