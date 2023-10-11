const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;
const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;

export async function checkUserLoggedIn(userToken: string) {
  const requestUrl = `${USER_SERVICE_HOST}/is-user-logged-in`;
  const response = await fetch(requestUrl, {
    headers: {
      Cookie: `${USER_TOKEN_NAME}=${userToken}`,
    },
  });
  if (!response.ok)
    throw new Error(
      `GET request to ${requestUrl} failed with response code: ${response.status}: ${response.statusText}`,
    );
  return response.json();
}
