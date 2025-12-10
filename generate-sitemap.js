import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream, existsSync, mkdirSync } from 'fs';

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

if (!existsSync('./dist')) {
    mkdirSync('./dist', { recursive: true });
}

const sitemap = new SitemapStream({
    hostname: 'https://compressimagepro.netlify.app'
});

const writeStream = createWriteStream('./dist/sitemap.xml');

if (!writeStream) {
    console.error("❌ Failed to create write stream for sitemap.xml");
    process.exit(1);
}

streamToPromise(
    sitemap.pipe(writeStream)
).then(() => console.log('✔ Sitemap generated!'));

links.forEach(link => sitemap.write(link));
sitemap.end();
