import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const componentRoot = join(projectRoot, 'component');
const outputPath = join(componentRoot, 'component-file-fallbacks.generated.js');
const fragmentPaths = [
  'chat-message/chat-message.fragment.html',
  'datatable/datatable.fragment.html',
  'document-statusbar/document-statusbar.fragment.html',
  'dropdownmenu/dropdownmenu.fragment.html',
  'file-upload/file-upload.html',
  'modal/modal.fragment',
  'panel/panel.html',
  'panel/three-panel.html',
  'progressbar/progressbar.fragment.html',
  'promptcomposer/promptcomposer.fragment.html',
  'sidebar/sidebar.html',
  'sidepop/sidepop.fragment',
  'toast/toast.fragment.html',
  'topbar/topbar.fragment'
];

const fragments = Object.fromEntries(await Promise.all(fragmentPaths.map(async fragmentPath => [
  fragmentPath,
  await readFile(join(componentRoot, fragmentPath), 'utf8')
])));

const output = `/* 이 파일은 scripts/build-component-file-fallbacks.mjs에서 자동 생성합니다. */
(() => {
  'use strict';

  window.AIOneComponentFileFallbacks = Object.freeze(${JSON.stringify(fragments, null, 2)});
})();
`;

await writeFile(outputPath, output, 'utf8');
console.log(`Generated ${relative(projectRoot, outputPath)} (${fragmentPaths.length} fragments)`);
