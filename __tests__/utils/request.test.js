import { getValidationErrorsFromQuery } from '../../src/utils/request';

describe('getValidationErrorsFromQuery', () => {
  it('should be able to fetch an array or errors from the query object', () => {
    const query = {
      'errors[]': [
        JSON.stringify({
          error: 'some error message',
          field: 'a field in a form',
        }),
        JSON.stringify({
          error: 'some other error message',
          field: 'a different field in a form',
        }),
      ],
    };

    const errorMessages = getValidationErrorsFromQuery(query['errors[]']);

    expect(errorMessages).toEqual(query['errors[]'].map((e) => JSON.parse(e)));
  });

  it('should be able to fetch a single error item from the query', () => {
    const query = {
      'errors[]': JSON.stringify({
        error: 'some error message',
        field: 'a field in a form',
      }),
    };

    const errorMessages = getValidationErrorsFromQuery(query['errors[]']);

    expect(errorMessages).toEqual([JSON.parse(query['errors[]'])]);
  });
});
