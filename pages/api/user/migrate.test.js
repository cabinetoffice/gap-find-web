import handler from './migrate';
import axios from 'axios';

jest.mock('axios');

describe('handler', () => {
  it('should make request to backend host and successfully migrate a user', async () => {
    const axiosResponse = { data: { isExistingUser: true, user: {} } };

    axios.mockResolvedValue(axiosResponse);

    const req = {
      body: {
        email: 'test-user@gov.uk',
        sub: 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34TyuGt87Uhs',
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };

    await handler(req, res);

    expect(axios).toHaveBeenCalledWith({
      method: 'patch',
      url: `${process.env.BACKEND_HOST}/user/migrate`,
      data: {
        email: 'test-user@gov.uk',
        sub: 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34TyuGt87Uhs',
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(axiosResponse.data);
  });

  it('should make request to backend host and unsuccessfully migrate a user', async () => {
    const axiosError = new Error('Simulated Axios Error');
    axiosError.response = {
      status: 500,
      data: { message: 'User Unsuccessfully migrated' },
    };

    axios.mockRejectedValue(axiosError);

    const req = {
      body: {
        email: 'test-user@gov.uk',
        sub: 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34TyuGt87Uhs',
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };

    await handler(req, res);

    expect(axios).toHaveBeenCalledWith({
      method: 'patch',
      url: `${process.env.BACKEND_HOST}/user/migrate`,
      data: {
        email: 'test-user@gov.uk',
        sub: 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34TyuGt87Uhs',
      },
    });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(axiosError.response.data);
  });
});
