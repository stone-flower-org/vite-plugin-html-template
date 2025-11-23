import fs from 'fs';
import path from 'path';

import { build, defineConfig } from 'vite';
import { clearTmpDirs, resolveFixturesDir, setupTmpDir } from '@/tests/utils';

import htmlTemplate from '@/src/index';

const defaultDefine = {};

const defaultInterpolate = /\${(\s*\w+\s*)}/gi;

const OUT_DIR = 'dist';

afterAll(async () => {
  await clearTmpDirs();
});

describe('html-template', () => {
  describe.each([
    {
      name: '1',
      define: defaultDefine,
      interpolate: defaultInterpolate,
      templatePath: resolveFixturesDir(path.join('common', 'without-params-template.html')),
    },
    {
      name: '2',
      define: defaultDefine,
      interpolate: defaultInterpolate,
      templatePath: resolveFixturesDir(path.join('common', 'with-params-template.html')),
    },
    {
      name: '3',
      define: {
        APP_NAME: 'vite-plugin-html-template',
        APP_VERSION: '1.0.0',
        CONTENT: '<div>Custom Content</div>',
        PUBLIC_URL: 'http://localhost/',
        TITLE: 'Vite Plugin HTML Template',
      },
      interpolate: defaultInterpolate,
      templatePath: resolveFixturesDir(path.join('common', 'with-params-template.html')),
    },
    {
      name: '4',
      define: {
        APP_NAME: 'vite-plugin-html-template',
        APP_VERSION: '1.0.0',
        CONTENT: '<div>Custom Content</div>',
        PUBLIC_URL: 'http://localhost/',
        TITLE: 'Vite Plugin HTML Template',
      },
      interpolate: /invalid/gi,
      templatePath: resolveFixturesDir(path.join('common', 'with-params-template.html')),
    },
  ])('should copy provided template and inject provided values', ({ name, define, interpolate, templatePath }) => {
    it(`${name}`, async (ctx) => {
      const caseDir = await setupTmpDir(ctx);
      const inHTMLPath = path.join(caseDir, 'index.html');
      const outHTMLPath = path.join(caseDir, OUT_DIR, 'index.html');
      const snapshotPath = path.join('__snapshots__', path.basename(__filename), 'html-template', name + '.html');

      await fs.promises.cp(templatePath, inHTMLPath, {
        force: true,
        recursive: true,
      });

      await build(
        defineConfig({
          build: {
            outDir: OUT_DIR,
          },
          logLevel: 'error',
          plugins: [
            htmlTemplate({
              define,
              interpolate,
            }),
          ],
          root: caseDir,
        }),
      );

      await expect(await fs.promises.readFile(outHTMLPath, 'utf-8')).toMatchFileSnapshot(snapshotPath);
    });
  });
});
