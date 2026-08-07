import type { MethodOptions } from '../types';
import { decodeSchemaName } from '../utils';
import { domain, getRefSchema, senitizeSchema } from './schema';

/*

const getInlineSchema = (accu: any, prop: any) => {
  const [accuProps, accuRequired] = accu;
  const [fieldName, props] = prop;
  const [schemaName, _req, required] = decodeSchemaName(fieldName, accuRequired);

  const type = prop.type || 'string';
  if (type !== 'object') return ([
    { ...accuProps, [schemaName]: senitizeSchema(props) },
    required,
  ]);

  return ([
    { ...accuProps, [schemaName]: getObjectSchemas(props) },
    required,
  ]);

};

const getSchemasFromArray = (properties: Array<string|any>): any => {
  const schemas =  properties.reduce((accu: any, prop: any) => {
    const isString = typeof prop === 'string';
    if (isString) return getStringSchema(accu, prop);
    return getInlineSchema(accu, prop);
  }, [{}, []]);
  return schemas;
};

const getSchemasFromObject = (pProperties: any): any => {
  const schemaNames = Object.keys(pProperties);
  return schemaNames.reduce((accu: any, pName: string) => {
  }, [{}, []]);

};

 */

type AccuSchema = [Record<string, any>, string[]];

const getSchemaFromString = (accu: any, refName: string) => {
  const [accuProps, accuRequired] = accu;
  const [schemaName, _re, required] = decodeSchemaName(refName, accuRequired);
  return [
    { ...accuProps, [schemaName]: getRefSchema(schemaName, 'common.js') },
    required,
  ];
};

const getSchemasOfArrayProps = (
  properties: Array<string|any>,
  required: string[] = [],
): AccuSchema => {
  const result  = properties.reduce((accu: AccuSchema, prop: any) => {
    const isString = typeof prop === 'string';
    if (isString) return getSchemaFromString(accu, prop);

    const [accuProps, accuRequired] = accu;
    const [name, props] = prop;
    const [schemaName, _req, nextRequired] = decodeSchemaName(name, accuRequired);
    return [
      { ...accuProps, [schemaName]: getObjectSchema(props) },
      nextRequired,
    ];
  }, [{}, required]);

  return result;
};

const getSchemasOfObjectProps = (properties: any, required: string[] =[]): AccuSchema => {
  const names = Object.keys(properties);
  const result  = names.reduce((accu: any) => accu, [{}, required]);
  return result;
};

const injectId = (props: any, id: string = '') => {
  if (id === '') return props;
  return { ...props, $id: id };
};

function getObjectSchema(schemaProps: any, id: string = '') {
  const { type = 'string' } = schemaProps;
  if (type !== 'object') {
    const res = senitizeSchema(schemaProps);
    return res;
  };

  const { properties = [], required = [] } = schemaProps;
  const isArray = Array.isArray(properties);
  const [nextProps, nextRequired] = (isArray)
    ? getSchemasOfArrayProps(properties, required)
    : getSchemasOfObjectProps(properties, required);
  const result = { properties: nextProps, required: nextRequired, type: 'object' };
  return injectId(result, id);
};

export default function getRouteSchema (methodOptions: Omit<MethodOptions, 'action'>) {
  const { params = {} } = methodOptions as any;
  return ['query', 'params', 'body'].reduce((accu: any, dataSlot: string) => {
    const properties = params[dataSlot] || [];
    const isArray = Array.isArray(properties);
    const isEmpty = isArray && properties.length == 0;
    if (isEmpty) return accu;
    const schemaProps = isArray
      ? { properties, type: 'object' }
      : { type: 'object', ...properties };

    const now = new Date().getTime();
    const schema = getObjectSchema(schemaProps, `${domain}/${dataSlot}-${now}.js`);
    return { ...accu, [dataSlot]: schema };
  }, {});
};
