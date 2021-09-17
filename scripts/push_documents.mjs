#!/usr/bin/env zx

const FormData = require('form-data');

let config;

try {
  config = await fs.readJson(`${process.env.GITHUB_WORKSPACE}/.translation/config-documents.json`)
} catch (error) {
  console.error(`x ${chalk.red(error)}`);

  process.exit(1);
}

const serviceHost = process.env.SERVICE_HOST;
const defaultLocale = 'en-AU';
const { paths, project_external_id, blank_default_locale } = config;

paths.forEach(path => {
  uploadLocaleFiles(defaultLocale, path);
})

// post the file to translation service endpoint
async function uploadLocaleFiles(locale, path, blank_default_locale = true) {
  // blank_default_locale: boolean
  // true: template.html.haml
  // false: template.en-AU.html.haml
  const file = path.replace('{{locale}}', blank_default_locale ? '' : `.${locale}`);
  const fileName = file.split('/').pop();
  const workspaceFile = `${process.env.GITHUB_WORKSPACE}/${file}`;

  const form = new FormData();

  form.append('project_external_id', project_external_id);
  form.append('file_name', file);
  form.append('file', fs.createReadStream(workspaceFile), fileName);
  form.append('locale', locale);

  await fetch(`${serviceHost}/api/v1/translations/upload_email_template`,
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
