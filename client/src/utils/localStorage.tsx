export const getLocalStorageValue = (key: string) => {
  return localStorage.getItem(key);
};

export const setLocalStorageValue = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const clearLocalStorageValue = (key: string) => {
  localStorage.removeItem(key);
};
