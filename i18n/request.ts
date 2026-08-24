import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  return {
    locale: 'km',
    messages: (await import('../messages/km.json')).default
  };
});
