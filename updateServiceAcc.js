const fs = require('fs');
require('dotenv').config();

// Read the contents of the template service-account-key.json file
const templateFile = fs.readFileSync('service-account-template.json', 'utf8');

// Replace the placeholders with the corresponding environment variable values
const keyFileContent = templateFile
  .replace('${PROJECT_ID}', process.env.PROJECT_ID)
  .replace('${PRIVATE_KEY_ID}', process.env.PRIVATE_KEY_ID)
  .replace('${PRIVATE_KEY}', process.env.PRIVATE_KEY)
  .replace('${CLIENT_EMAIL}', process.env.CLIENT_EMAIL)
  .replace('${CLIENT_ID}', process.env.CLIENT_ID)
  .replace('${AUTH_URI}', process.env.AUTH_URI)
  .replace('${TOKEN_URI}', process.env.TOKEN_URI)
  .replace('${AUTH_PROVIDER_X509_CERT_URL}', process.env.AUTH_PROVIDER)
  .replace('${CLIENT_X509_CERT_URL}', process.env.CLIENT_CERT_URL);

// Write the updated content to a new service-account-key.json file
fs.writeFileSync('service-account.json', keyFileContent);
