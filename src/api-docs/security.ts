import { APIKey } from './types';

const bearer = (bearerAuth: boolean = false): any => {
  if (bearerAuth) return {};
  return {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  };
};

const getApiKeys = (apiKeys: APIKey): any => {
  if (apiKeys.length === 0) return {};
  return apiKeys.reduce((carry: any, apiKey): any => {
    const [name, where] = Array.isArray(apiKey)
      ? apiKey
      : [apiKey, 'header'];
    return {
      ...carry,
      [name]: {
        name,
        type: 'apiKey',
        in: where,
      },
    };
  }, {});
};

export default function setSecurity(props: any): any {
  const { bearerAuth = false, apiKeys = [] } = props;
  const res = {
    ...bearer(bearerAuth),
    ...getApiKeys(apiKeys),
  };

  const keys = Object.keys(res);
  if (keys.length === 0) return [{}, {}];

  const globalSecurities = keys.map((key) => ({
    [key]: [],
  }));

  return [
    { securitySchemes: res },
    globalSecurities,
  ];
}
