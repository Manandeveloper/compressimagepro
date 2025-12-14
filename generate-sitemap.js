import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

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

async function generate() {
  // Ensure dist/ exists
  if (!existsSync('./dist')) {
    mkdirSync('./dist', { recursive: true });
  }

  // Create sitemap stream
  const smStream = new SitemapStream({
    hostname: 'https://compressimagepro.com',
  });

  // Write links to stream
  for (const link of links) {
    smStream.write(link);
  }
  smStream.end();

  // Convert stream → XML buffer
  const xmlBuffer = await streamToPromise(smStream);
  const xml = xmlBuffer.toString();

  // Save to dist folder
  await writeFile('./dist/sitemap.xml', xml);

  console.log('✔ Sitemap created successfully!');
}

generate().catch((err) => {
  console.error('❌ Sitemap generation failed:', err);
  process.exit(1);
});
