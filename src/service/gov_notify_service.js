import { NotifyClient } from 'notifications-node-client';

let _notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

export function setClient(client) {
  _notifyClient = client;
}

async function sendEmail(emailAddress, personalisation, template) {
  try {
    await _notifyClient.sendEmail(template, emailAddress, {
      personalisation: personalisation,
      reference: 'test-find-grant-reference',
    });
  } catch (error) {
    if(error.response.data) {
      console.error(error.response.data, { depth: null });
    } else {
      console.error(error);
    }
    throw new Error('Error sending email');
  }
}

export { sendEmail };
