type Status = 'in-progress' | 'done';

type Response = {
  statusCode: number;
  headers: Record<string, any>;
  chunks: any;
}

type Item = {
  createdAt: Date;
  status: Status;
  referenceNumber?: string | number;
  response?: Response;
};

const storage: Record<string, Item> = {};

export const status: Record<string, string> = {
  IN_PROGERSS: 'in-progress',
  DONE: 'done',
};

export const getAll = () => storage;

export const exists = (key: string): boolean => !!(storage[key] || false);

/**
 * Creates the storage with minimal information (the predetermined default value)
 * @param {string} key - The key to be added into storage.
 */
export const create = (key: string): any => {
  if (exists(key)) throw new Error('Idempotency key exists.');
  storage[key] = {
    createdAt: new Date(),
    status: status.IN_PROGERSS as Status,
  };
};

/**
 * Gets the stored item by key
 * @param {string} key - Storage key
 * @return object;
 */
export const getItem = (key: string): Item | any => storage[key] || {};

/**
 * Stores the response object to be used when passing the stored
 * result back to the client. This make sure the previouse response
 * (stored response) is sent back.
 * @param {string} key - The key of the storage
 * @param {Response} response - The response information
 */
export const store = (key: string, response: Response) => {
  const item = getItem(key);
  storage[key] = {
    ...item,
    response,
    status: status.DONE as Status,
  };
};

export const deleteItem = (key: string) => {
  if (exists(key)) {
    delete storage[key];
  }
};
