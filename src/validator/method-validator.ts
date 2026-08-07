import Ajv from 'ajv';
const ajvErrors = require('ajv-errors');
import { getObjectSchema } from './schema';
import type { Request, Response, NextFunction, MethodOptions } from '../types';
import { validate, getErrors } from './validate';

const ajvOptions = {
  allErrors: true,
  $data: true,
  strict: true,
  coerceTypes: true,
  schemas: [],
};

const ajv = new Ajv(ajvOptions);
ajvErrors(ajv);

type SchemaOptions = {
  domainName?: string,
};

export default function initMethodValidation(pSchemas: any, options: SchemaOptions = {}){
  const { domainName = 'common' } = options;
  const schemas = getObjectSchema({
    type: 'object',
    properties: pSchemas,
    required: [],
  }, domainName);

  ajv.addSchema(schemas);
  return (methodOptions: MethodOptions) => {
    const sources = Object.keys(methodOptions);
    return (req: Request, res: Response, next: NextFunction) => {
      if (sources.length === 0) return next();
      const errors = validate(ajv, {
        methodOptions,
        request: req,
      });
      if (errors.length === 0) return next();

      return res.status(400).json({
        error: true,
        errors: getErrors(errors),
      });
    };
  };
}
