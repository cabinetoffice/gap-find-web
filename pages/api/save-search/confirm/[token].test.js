import {
  decryptSignedApiKey,
  generateSignedApiKey,
} from '../../../../src/service/api-key-service';
import {
  SavedSearchStatusType,
  updateStatus,
} from '../../../../src/service/saved_search_service';
import { notificationRoutes } from '../../../../src/utils/constants';
import handler from './[token]';

jest.mock('../../../../src/service/api-key-service');
jest.mock('../../../../src/service/saved_search_service');
jest.mock('nookies');

describe('handler', () => {
  it('should update the status of the saved search and redirect correctly', async () => {
    const token = 'encrypted-saved-search-id';
    const req = {
      query: {
        token,
      },
    };

    const res = {
      redirect: jest.fn(),
    };

    const decryptedSavedSearchId = {
      id: 12345,
    };

    const savedSearch = {
      id: 12345,
      name: 'test saved seaarch',
      filters: [
        {
          name: 'fields.grantApplicantType.en-US',
          subFilterid: '1',
        },
        {
          name: 'fields.grantApplicantType.en-US',
          subFilterid: '2',
        },
      ],
      fromDate: '2022-01-01',
      toDate: '2022-10-10',
      status: 'CONFIRMED',
      notifications: false,
      search_term: undefined,
      user: {
        emailAddress: 'email@email.com',
        encryptedEmailAddress: 'encrypted-email-address',
      },
    };

    const encryptedEmailAddress = 'an-encrypted-email-address';

    decryptSignedApiKey.mockReturnValue(decryptedSavedSearchId);
    updateStatus.mockResolvedValue(savedSearch);
    generateSignedApiKey.mockReturnValue(encryptedEmailAddress);

    await handler(req, res);

    expect(decryptSignedApiKey).toHaveBeenCalledWith(token);
    expect(updateStatus).toHaveBeenCalledWith(
      savedSearch.id,
      SavedSearchStatusType.CONFIRMED,
    );
    expect(generateSignedApiKey).toHaveBeenCalledWith({
      email: savedSearch.user.encryptedEmailAddress,
    });
    expect(res.redirect).toHaveBeenCalledWith(
      new URL(
        `${notificationRoutes['manageNotifications']}`,
        process.env.HOST,
      ).toString(),
    );
  });
});
