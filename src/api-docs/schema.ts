const defaultSchema = {
  type: 'string',
  example: 'String value here',
  description: 'Pre-defined string schema',
};

const touchObjectProperties = (names: any[]) => names.reduce((accu: any, name: any) => {
  if (typeof name === 'string') return { 
    ...accu,
    [name]: { '$ref': `#/components/schemas/${name}` },
  };

  const [schemaName, schemaProps] = name;
  return {
    ...accu,
    [schemaName]: senitizeSchema(schemaProps),
  };

}, {});

const senitizeObjectSchema = (schemaProps: any) => {
  const { properties } = schemaProps;
  const touchedProperties = touchObjectProperties(properties);
  return { ...schemaProps, properties: touchedProperties };
};

const senitizeSchema = (schemaProps: any) => {
  const type = schemaProps.type || 'string';
  if (type !== 'object') return { ...defaultSchema, ...schemaProps };
  return senitizeObjectSchema(schemaProps);
};

export default function initSchemas(schemaObj: any): any {
  const schemas = Object.keys(schemaObj);
  return schemas.reduce((acc, schemaName) => {
    const schemaProps = schemaObj[schemaName];
    const schema = senitizeSchema(schemaProps);
    return ({
      ...acc,
      [schemaName]: schema,
    });
  }, {});
}
