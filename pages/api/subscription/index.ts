import { axios } from '../../../src/utils';

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST': {
      const response = await createNewSubscription(req.body);
      return res.status(200).json(response);
    }
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const createNewSubscription = async (body) => {
  const { emailAddress, contentfulGrantSubscriptionId, sub } = body;
  const response = await axios({
    method: 'post',
    url: `${process.env.BACKEND_HOST}/subscriptions`,
    data: {
      contentfulGrantSubscriptionId,
      emailAddress,
      sub,
    },
  });
  return response.data;
};
