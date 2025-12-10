import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

const links = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/image-compress', priority: 0.9 },
    { url: '/image-resize', priority: 0.9 },
    { url: '/image-crop', priority: 0.9 },
    { url: '/image-watermark', priority: 0.9 },
    { url: '/remove-background', priority: 0.9 },
    { url: '/change-background', priority: 0.9 },
    { url: '/image-convert', priority: 0.9 },
    { url: '/rotate-image', priority: 0.9 },
];

const sitemap = new SitemapStream({ hostname: 'https://compressimagepro.netlify.app' });

streamToPromise(
    sitemap
        .pipe(createWriteStream('./public/sitemap.xml'))
).then(() => console.log('Sitemap generated!'));

links.forEach(link => sitemap.write(link));
sitemap.end();