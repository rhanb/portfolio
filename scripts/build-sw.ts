import { injectManifest } from 'workbox-build';


const buildSW = () => {
  return injectManifest({
    swSrc: '../src/sw.js',
    swDest: '../dist/sw.js',
    globDirectory: '../dist',
    globPatterns: [
      '**\/*.{js,css,html,png,svg,ttf}',
    ]
  }).then(({count, size, warnings}) => {
    warnings.forEach(console.warn);
    console.log(`${count} files will be precached, totaling ${size} bytes.`);
  });
}

buildSW();