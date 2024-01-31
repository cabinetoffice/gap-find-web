import { getServerSideProps } from '../../../pages/apply/[pid]'; // Import your module here

import * as axios from 'axios';

// Mock out all top level functions, such as get, put, delete and post:
jest.mock('axios');

// Mock the fetchEntry function
jest.mock('../../../src/utils/contentFulPage.ts', () => ({
  fetchEntry: jest.fn(() =>
    Promise.resolve({
      props: {
        grantDetail: {
          fields: {
            grantWebpageUrl: 'https://example.com',
            label: 'example-slug',
          },
        },
      },
    }),
  ),
}));

const applicantUrlBackup = process.env.APPLY_FOR_A_GRANT_APPLICANT_URL;
const mandatoryQsEnabledBackup =
  process.env.NEW_MANDATORY_QUESTION_JOURNEY_ENABLED;
process.env.APPLY_FOR_A_GRANT_APPLICANT_URL = 'applicantUrl';
process.env.NEW_MANDATORY_QUESTION_JOURNEY_ENABLED = 'false';

describe('getServerSideProps', () => {
  it('should return a redirect object with the expected destination when new mandatory question feature flag is off ', async () => {
    //this mocks getAdvertSchemeVersion()
    axios.get.mockImplementation(() =>
      Promise.resolve({
        data: { schemeVersion: 2, internalApplication: true },
      }),
    );
    process.env.APPLY_FOR_A_GRANT_APPLICANT_URL = 'applicantUrl';
    process.env.NEW_MANDATORY_QUESTION_JOURNEY_ENABLED = 'false';

    const context = { params: { pid: 'your-path' } };
    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        permanent: false,
        destination: 'https://example.com',
      },
    });
  });

  it('should return a redirect object with the expected destination when new mandatory question feature flag is on ', async () => {
    //this mocks getAdvertSchemeVersion()
    axios.get.mockImplementation(() =>
      Promise.resolve({
        data: { schemeVersion: 2, internalApplication: true },
      }),
    );
    process.env.APPLY_FOR_A_GRANT_APPLICANT_URL = 'applicantUrl';
    process.env.NEW_MANDATORY_QUESTION_JOURNEY_ENABLED = 'true';
    const context = { params: { pid: 'your-path' } };
    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        permanent: false,
        destination:
          'applicantUrl/api/redirect-from-find?slug=your-path&grantWebpageUrl=https://example.com',
      },
    });
  });
});

process.env.APPLY_FOR_A_GRANT_APPLICANT_URL = applicantUrlBackup;
process.env.NEW_MANDATORY_QUESTION_JOURNEY_ENABLED = mandatoryQsEnabledBackup;
