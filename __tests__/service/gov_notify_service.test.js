import { NotifyClient } from 'notifications-node-client';
const sendEmail = require('../../src/service/gov_notify_service').sendEmail;
const setClient = require('../../src/service/gov_notify_service').setClient;

jest.mock('notifications-node-client');

const flushPromises = () => new Promise((res) => setTimeout(res, 0));

describe('sendEmail', () => {
  it('should send an email', async () => {
    const emailAddress = 'email@email.com';
    const personalisation = {
      greeting: 'Hello',
      contentBody: 'Click here to verify your email',
    };

    // Java developer tries JavaScript unit testing... should probably find a better solution
    const client = new NotifyClient();
    setClient(client);

    sendEmail(emailAddress, personalisation);
    await flushPromises();

    expect(client.sendEmail).toHaveBeenCalled();
  });
});
