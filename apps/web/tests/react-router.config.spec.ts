import config from '../react-router.config';

test('keeps SSR enabled for the MPA', () => {
  expect(config.ssr).toBe(true);
});
