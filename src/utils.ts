import type { Response } from 'express';

export const responseError = (res: Response, message: any, statusCode: number = 400) => {
  const objMsg = typeof message === 'string' ? { message } : message;
  const  errorResult = { 
    error: true,
    status: statusCode,
    ...objMsg,
  };

  return res
    .status(statusCode)
    .send(errorResult);
};

type DecodedSchema = [string, boolean, string[]];

export const decodeSchemaName = (
  schemaName: string,
  accuRequired: string[] = [],
): DecodedSchema => {
  const [field, isRequired = false] = schemaName.split('*');
  if (isRequired === false) return [field, false, accuRequired];
  return [field, true, [...accuRequired, field]];
};
