import {
  EMAIL_ADDRESS_REGEX,
  EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR,
  PRIVACY_POLICY_VALIDATION_ERROR,
  EMAIL_ADDRESS_EMPTY_VALIDATION_ERROR,
} from '../utils/constants';

function validateSignupForm(body: any) {
  const errors = [];

  if (!body.notification_privacy) {
    errors.push({
      field: 'notification_privacy',
      error: PRIVACY_POLICY_VALIDATION_ERROR,
    });
  }

  if (!body.user_email) {
    errors.push({
      field: 'user_email',
      error: EMAIL_ADDRESS_EMPTY_VALIDATION_ERROR,
    });
  } else if (!EMAIL_ADDRESS_REGEX.test(body.user_email)) {
    errors.push({
      field: 'user_email',
      error: EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR,
    });
  }

  return errors;
}

const generateSignupErrorsRedirectParam = (errors: Array<Object>) => {
  return errors.map((error) => '&errors[]=' + JSON.stringify(error)).join('');
};

export { validateSignupForm, generateSignupErrorsRedirectParam };
