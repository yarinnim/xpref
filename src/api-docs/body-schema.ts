import { decodeSchemaName } from '../utils';

const schemaFromString = (name: string) => {
  const [schemaName, required] = decodeSchemaName(name);
  return {
    [schemaName]: {
      schema: { $ref: `#components/schemas/${schemaName}` },
      required,
    },
  };
};

const getSchemasOfArrayProperties = (properties: Array<string|any>) => properties
  .reduce((accu: any, item: any) => {
    const isString = typeof item === 'string';
    if (isString) return { ...accu, ...schemaFromString(item) };
    return accu;
  }, {});

const getSchemasOfProperties = (properties: any) => {
  const isArray = Array.isArray(properties);
  if (!isArray) return properties;
  return getSchemasOfArrayProperties(properties);
};

export default function getBodySchemas(props: any) {
  const { properties } = props;
  const nextProps = getSchemasOfProperties(properties);
  return { ...props, properties: nextProps };
}
