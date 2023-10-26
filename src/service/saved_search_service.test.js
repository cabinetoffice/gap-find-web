import { savedSearches } from '../../__tests__/pages/notifications/manage-notifications.data';
import {
  getAllSavedSearches,
  save,
  SavedSearchStatusType,
  updateStatus,
  deleteSaveSearch,
} from './saved_search_service';
import { axios } from '../../src/utils';

jest.mock('../../src/utils/axios', () => ({
  axios: jest.fn(),
}));

describe('save', () => {
  it('should save and return the newly saved search', async () => {
    const axiosResponse = { data: savedSearches };

    axios.mockResolvedValue(axiosResponse);

    const methodResponse = await getAllSavedSearches('email@email.com');

    expect(methodResponse).toEqual(axiosResponse.data);
  });
});

describe('save', () => {
  it('should save and return the newly saved search', async () => {
    const searchToSave = {
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
      status: 'DRAFT',
      notifications: false,
      email: 'email@email.com',
      search_term: undefined,
    };

    const axiosResponse = {
      data: {
        id: 1,
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
        status: 'DRAFT',
        notifications: false,
        search_term: undefined,
        user: {
          emailAddress: 'email@email.com',
        },
      },
    };

    axios.mockResolvedValue(axiosResponse);

    const methodResponse = await save(searchToSave);

    expect(methodResponse).toEqual(axiosResponse.data);
  });
});

describe('updateStatus', () => {
  it('should update the status of the specified search and then return it', async () => {
    const savedSearch = 1;
    const axiosResponse = {
      data: {
        id: 1,
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
        },
      },
    };

    axios.mockResolvedValue(axiosResponse);

    const methodResponse = await updateStatus(
      savedSearch,
      SavedSearchStatusType.CONFIRMED,
    );

    expect(axios).toHaveBeenCalledWith({
      method: 'patch',
      url: `${process.env.BACKEND_HOST}/saved-searches/${savedSearch}/status`,
      data: {
        status: SavedSearchStatusType.CONFIRMED,
      },
    });
    expect(methodResponse).toEqual(axiosResponse.data);
  });
});

describe('delete', () => {
  it('should delete the search', async () => {
    const saveSearchId = 1;
    const email = 'test@test.com';
    const axiosResponse = {
      data: {
        raw: 'sqlstring',
        affected: 1,
      },
    };

    axios.mockResolvedValue(axiosResponse);

    const methodResponse = await deleteSaveSearch(saveSearchId, email);

    expect(axios).toHaveBeenCalledWith({
      method: 'post',
      url: `${process.env.BACKEND_HOST}/saved-searches/${saveSearchId}/delete?unsubscribeReference=undefined`,
      data: {
        email,
      },
    });
    expect(methodResponse).toEqual(axiosResponse.data);
  });
});
