import { NotifyClient } from 'notifications-node-client';

let _notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

export function setClient(client) {
  _notifyClient = client;
}

async function sendEmail(emailAddress, personalisation, template) {
  await _notifyClient.sendEmail(template, emailAddress, {
    personalisation: personalisation,
    reference: 'test-find-grant-reference',
  });
}

export { sendEmail };
