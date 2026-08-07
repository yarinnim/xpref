import type { Request, MethodOptions } from '../types';
import getRouteSchema from './route-schema';

const anyOfRequiredField:string[] = [];

const caseToWords = (field: string) => field
  .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase => camel Case
  .replace(/[_-]/g, ' ')
  .replace(/\s+/g, ' ') // replace multi space with single one
  .replace(/\b[a-z]/g, (char: string) => char.toUpperCase()) // capitalize text => Text
  .trim(); // remove start/end space

type ValidationProps = {
  request: Request,
  methodOptions: MethodOptions,
};

const getRequestData = (req: Request): any => {
  const { query, params, body } = req;
  return { query, params, body };
};

const splitField = (field: string, delimiter: string = '/'): string => {
  const fields = field.split(delimiter);
  return fields[fields.length - 1];
};

const customMsg = (params: any, keyword: string, message: string) => {
  const { missingProperty = '' } = params;
  let newMsg = message;
  switch (keyword) {
    case 'required':
      anyOfRequiredField.push(missingProperty);
      const words = caseToWords(missingProperty);
      newMsg = `${words} field is required.`;
      break;
    case 'anyOf':
      newMsg = `Must has anyOf the field ${anyOfRequiredField}`;
      anyOfRequiredField.splice(0, anyOfRequiredField.length);
      break;
    case 'maximum':
      newMsg = message.replace('<=', 'less than or equal to');
      break;
    case 'minimum':
      newMsg = message.replace('>=', 'greater than or equal to');
      break;
    case 'minLength':
      newMsg = message.replace('NOT have fewer than', 'be at least');
      break;
    case 'enum': 
      newMsg = `${message} ${JSON.stringify(params.allowedValues)}`; 
      break;
    default: break;
  }

  return newMsg;
};

const getErrorMsg = (error: any) => {
  const {
    instancePath = '',
    params = {},
    keyword = '',
    message,
  } = error;
  const newMessage = customMsg(params, keyword, message);

  if (instancePath === '') return newMessage;
  const errorField = splitField(instancePath, '/');
  return `${caseToWords(errorField)} ${newMessage}`;
};

const getErrorField = (error: any): any => {
  const { params, keyword } = error;
  switch (keyword) {
    case 'required':
      return splitField(params.missingProperty, '.');
    case 'anyOf':
      return 'anyOf';
    default:
      return splitField(error.instancePath, '/');
  }
};

export const getErrors = (errors: any): any => (errors.reduce((acc: any, error: any) => {
  const field = getErrorField(error);
  const message = getErrorMsg(error);
  return { ...acc, [field]: message };
}, {}));

export const validate = (ajv: any, pProps: ValidationProps): any => {
  const { methodOptions, request } = pProps;

  const requestData = getRequestData(request);
  const schemaData = getRouteSchema(methodOptions);
  const dataSlots = Object.keys(schemaData);
  const validatedRequest = dataSlots.reduce((accu: any, dataSlot: string) => {
    const schema = schemaData[dataSlot];
    const data = requestData[dataSlot];
    const ajvValidate = ajv.compile({ type: 'object', ...schema });
    const valid = ajvValidate(data);
    ajv.removeSchema(schema.$id);
    if (valid) return accu;
    return [...accu, ...ajvValidate.errors];
  }, []);

  return validatedRequest;
};

