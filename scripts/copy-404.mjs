// Static hosts that serve 404.html for unknown paths will then boot the site,
// so deep links like /blogs/my-post work without server rewrites.
import { copyFileSync } from 'node:fs';
copyFileSync('dist/index.html', 'dist/404.html');
