import {
  validateSignupForm,
  generateSignupErrorsRedirectParam,
} from './signup_manager';
import {
  EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR,
  PRIVACY_POLICY_VALIDATION_ERROR,
  EMAIL_ADDRESS_EMPTY_VALIDATION_ERROR,
} from '../../src/utils/constants';

describe('validateSignupForm', () => {
  const validInput = {
    notification_privacy: 'on',
    user_email: 'test@email.com',
  };

  it('should return an empty array if no errors are found', () => {
    const result = validateSignupForm(validInput);
    expect(result).toEqual([]);
  });

  it('should return error when privacy notice is not checked', () => {
    let result = validateSignupForm({});
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'notification_privacy',
          error: PRIVACY_POLICY_VALIDATION_ERROR,
        }),
      ]),
    );
  });

  it('should return empty error when email is undefined or blank', () => {
    const expectedErrorObj = {
      field: 'user_email',
      error: EMAIL_ADDRESS_EMPTY_VALIDATION_ERROR,
    };
    const resultUndefined = validateSignupForm({});
    expect(resultUndefined).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedErrorObj)]),
    );
    expect(resultUndefined).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedErrorObj)]),
    );
  });

  it('should return formatting error when invalid email is given', () => {
    const result = validateSignupForm({ user_email: 'testincorrectemail.com' });
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'user_email',
          error: EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR,
        }),
      ]),
    );
  });
});

describe('generateSignupErrorsRedirectParam', () => {
  const errorObj = { field: 'test_field', error: 'test error' };
  const errorJSON = '{"field":"test_field","error":"test error"}';
  const errorArray = [errorObj];
  const paramName = '&errors[]=';

  it('should return a string which starts with param name', () => {
    const result = generateSignupErrorsRedirectParam(errorArray);
    expect(result.startsWith(paramName)).toBeTruthy();
  });

  it('should return the errors provided as a JSON string within the URL', () => {
    const result = generateSignupErrorsRedirectParam(errorArray);
    expect(result.includes(errorJSON)).toBeTruthy();
  });

  it('should return param in expected format', () => {
    const result = generateSignupErrorsRedirectParam(errorArray);
    expect(result === paramName + errorJSON).toBeTruthy();
  });
});
