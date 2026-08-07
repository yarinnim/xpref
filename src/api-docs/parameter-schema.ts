import { decodeSchemaName } from '../utils';

const schemaFromString = (name: string, whereToBe: string = '') => {
  const [schemaName, required] = decodeSchemaName(name);
  return {
    name: schemaName,
    schema: { $ref: `#components/schemas/${schemaName}` },
    in: whereToBe,
    required,
  };
};

const inlineSchema = (schema: [string, any], whereToBe: string = ''): any => {
  const [name, props] = schema;
  const [schemaName, required] = decodeSchemaName(name);
  const type = props.type || 'string';
  if (type !== 'object') return {
    name: schemaName,
    required,
    in: whereToBe,
    ...props,
  };

  return {
    name: schemaName,
    parameters: getObjectSchema({ name: schemaName, ...props }, whereToBe),
  };
};

const getSchemasOfObjectProperties = (properties: any, _whereToBe: string = '') => properties;

const getSchemasOfArrayProperties = (
  properties: Array<string|any>,
  whereToBe: string = '',
) => properties.map((name: string|any) => {
  const isString = typeof name === 'string';
  if (isString) return schemaFromString(name, whereToBe);
  return inlineSchema(name, whereToBe); 
});

const getObjectSchema = (schema: any, whereToBe: string = '') => {
  const type = schema.type || 'string';
  if (type !== 'object') return [{ type, ...schema, in: whereToBe }];

  const { properties } = schema;
  const isArray = Array.isArray(properties);
  if (isArray) return getSchemasOfArrayProperties(properties, whereToBe);
  return getSchemasOfObjectProperties(properties, whereToBe);
};

export default function getParameterSchemas (routeParams: any) {
  const { headers = [], params = [], query = [] } = routeParams;

  const headersSchema = { type: 'object', properties: headers, name: 'headers' };
  const paramsSchema = { type: 'object', properties: params, name: 'params' };
  const querySchema = { type: 'object', properties: query, name: 'query' };

  return [
    ...getObjectSchema(headersSchema, 'headers'),
    ...getObjectSchema(paramsSchema, 'path'),
    ...getObjectSchema(querySchema, 'query'),
  ];
}
