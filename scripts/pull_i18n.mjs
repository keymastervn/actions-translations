#!/usr/bin/env zx

import { pipeline } from 'stream';
import { promisify } from 'util';

let config;

try {
  config = await fs.readJson(`${process.env.GITHUB_WORKSPACE}/.translation/config.json`)
} catch (error) {
  console.error(`x ${chalk.red(error)}`);

  process.exit(1);
}

const serviceHost = process.env.SERVICE_HOST;
const { locales, paths, project_external_id } = config;

paths.forEach(path => {
  locales.forEach(locale => {
    downloadLocaleFiles(locale, path);
  })
})

// #HELPERS
async function downloadLocaleFiles(locale, path) {
  const file = path.replace('{{locale}}', locale);
  const fileName = file.split('/').pop();
  const workspaceFile = `${process.env.GITHUB_WORKSPACE}/${file}`;

  const params = {
    'project_external_id': project_external_id,
    'file_name': fileName,
    'locale': locale
  };

  const response = await fetch(`${serviceHost}/api/v1/translations/latest?${(new URLSearchParams(params)).toString()}`,
    {
      method: 'GET',
      headers: {
        // 'Authorization': `Bearer ${process.env.TRANSLATION_SERVICE_API_TOKEN}` // need CORS policy:
                                                                                  // Access-Control-Allow-Headers: Authorization to be allowed
      }
    }
  )
  const data = await response.json();
  const url = data.translation_url;

  const streamPipeline = promisify(pipeline);
  const downloadRequest = await fetch(url);
  if (!downloadRequest.ok) throw new Error(`unexpected response ${downloadRequest.statusText}`);
  await streamPipeline(downloadRequest.body, fs.createWriteStream(workspaceFile));
}
