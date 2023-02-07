let res = [
  {
    _index: 'gapsearch',
    _type: '_doc',
    _id: '7eVDBO9vuQ8IAMpFHxcd0Z',
    _score: 0,
  },
];

export function setMockResponseArray(response) {
  res = response;
}

export const Client = jest.fn().mockImplementation(() => {
  return {
    search: jest.fn().mockImplementation(() => {
      return {
        body: {
          hits: {
            total: { value: res.length },
            hits: res,
          },
        },
      };
    }),
  };
});
