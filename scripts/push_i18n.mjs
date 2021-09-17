#!/usr/bin/env zx

const FormData = require('form-data');

let config;

try {
  config = await fs.readJson(`${process.env.GITHUB_WORKSPACE}/.translation/config.json`)
} catch (error) {
  console.error(`x ${chalk.red(error)}`);

  process.exit(1);
}

const serviceHost = process.env.SERVICE_HOST;
const defaultLocale = 'en-AU';
const { paths, project_external_id } = config;

paths.forEach(path => {
  uploadLocaleFiles(defaultLocale, path);
})

// post the file to translation service endpoint
async function uploadLocaleFiles(locale, path) {
  const file = path.replace('{{locale}}', locale);
  const fileName = file.split('/').pop();
  const workspaceFile = `${process.env.GITHUB_WORKSPACE}/${file}`;

  const form = new FormData();

  form.append('project_external_id', project_external_id);
  form.append('file_name', file);
  form.append('file', fs.createReadStream(workspaceFile), fileName);
  form.append('locale', locale);

  await fetch(`${serviceHost}/api/v1/translations/upload_base_locale`,
    {
      method: 'post',
      body:    form,
      headers: {
        'Authorization': `Bearer ${process.env.TRANSLATION_SERVICE_API_TOKEN}`
      }
    }
  )
  .then(response => {
    if (!response.ok) {
      console.log(response.status)
      console.log(response.json())
    }
  })
  .catch(error => console.error('Error:', error));
}
