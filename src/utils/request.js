import util from 'util';
import bodyParser from 'body-parser';

export const getValidationErrorsFromQuery = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map((e) => JSON.parse(e));
  }
  return [JSON.parse(errors)];
};

export const getPreviousFormValues = (requestBody) => {
  return new URLSearchParams(requestBody).toString();
};

export const getBody = util.promisify(
  bodyParser.urlencoded({ extended: true }),
);
