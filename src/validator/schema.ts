type ObjectSchema = {
  type?: string,
  properties: string[],
  required?: string[],
  $id?: string,
};

export const senitizeSchema = (schemaProps: Record<string, any>) => {
  const {
    example: _ex,
    ...senitizedSchema
  } = schemaProps;
  return { type: 'string', ...senitizedSchema };
};

export const domain = 'https://schemas.api.com';

const getRef = (refName: string, ref: string = '') => `${ref}#/properties/${refName}`;

export const getRefSchema = (name: string, ref: string) => ({
  $ref: getRef(name, ref),
});

const getArrayProperties = (properties: Array<string|any>, ref: string = '') => {
  if (properties.length === 0) return properties;
  const touchedProperties = properties.reduce((accu: any, prop: any) => {
    const isString = typeof prop === 'string';
    if (isString) return { ...accu, [prop]: getRefSchema(prop, ref) };

    const [schemaName, schemaProps] = prop;
    const type = schemaProps.type || 'string';
    if (type !== 'object') return  {
      ...accu,
      [schemaName]: senitizeSchema(schemaProps),
    };

    return {
      ...accu,
      [schemaName]: getObjectSchema(schemaProps),
    };

  },{});
  return touchedProperties;
};

const getObjectProperties = (properties: Record<string, any>) => {
  const schemaNames = Object.keys(properties);
  const nextProperties = schemaNames.reduce((accu: any, schemaName: string) => {
    const schemaProps = properties[schemaName] as ObjectSchema;
    const type = schemaProps.type || 'string';
    if (type !== 'object') return { ...accu, [schemaName]: senitizeSchema(schemaProps) };

    return { ...accu, [schemaName]: getObjectSchema(schemaProps, false) };
  }, {});
  return nextProperties;
};

export function getObjectSchema(
  schema: ObjectSchema,
  id: string|false = false,
  ref: string = '',
): ObjectSchema {
  const { properties, required = [] } = schema;
  const isArray = Array.isArray(properties);
  const nextProperties = isArray
    ? getArrayProperties(properties, ref)
    : getObjectProperties(properties);

  const result = {
    type: 'object',
    properties: nextProperties,
    required,
  };

  if (!id) return result;
  const refId = `${domain}/${id}.js`;
  return { ...result, $id: refId };
}
