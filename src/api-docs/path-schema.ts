import getParameterSchemas from './parameter-schema';
import getBodySchemas from './body-schema';

export const getMethodParameters = (methodHandler: any) => {
  if (Array.isArray(methodHandler)) return {};
  if (typeof methodHandler === 'function') return {};

  const { params } = methodHandler;
  const parameters = {
    parameters: getParameterSchemas(params),
  };

  const { body = [] } = params;
  if (body.length === 0) return parameters;
  const content = {
    'application/json': {
      schema: getBodySchemas({ 
        type: 'object',
        properties: body,
      }),
    },
  };
  return { ...parameters, requestBody: { content } };
};
