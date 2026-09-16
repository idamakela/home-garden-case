import { ApiError } from '../../app/lib/api';
import { gardensCreateCopy, gardensLoadCopy } from '../../app/lib/garden-copy';

test('gardensLoadCopy maps 404', () => {
  expect(gardensLoadCopy(new ApiError(404, 'missing'))).toEqual({
    title: "We couldn't find gardens",
    message: 'They may have been moved or deleted.',
  });
});

test('gardensLoadCopy maps 409', () => {
  expect(gardensLoadCopy(new ApiError(409, 'conflict'))).toEqual({
    title: "Couldn't load gardens",
    message: 'The list changed. Try again.',
  });
});

test('gardensLoadCopy maps 500', () => {
  expect(gardensLoadCopy(new ApiError(500, 'boom'))).toEqual({
    title: "Couldn't load gardens",
    message: 'The service is temporarily unavailable. Try again.',
  });
});

test('gardensLoadCopy maps unknown errors', () => {
  expect(gardensLoadCopy(new Error('offline'))).toEqual({
    title: "Couldn't load gardens",
    message: 'Please try again.',
  });
});

test('gardensCreateCopy maps 400', () => {
  expect(gardensCreateCopy(new ApiError(400, 'invalid'))).toEqual({
    title: "Couldn't add this garden",
    message: 'Check the details and try again.',
  });
});

test('gardensCreateCopy maps 409', () => {
  expect(gardensCreateCopy(new ApiError(409, 'conflict'))).toEqual({
    title: "Couldn't add this garden",
    message: 'This conflicts with current data. Try again.',
  });
});

test('gardensCreateCopy maps 500', () => {
  expect(gardensCreateCopy(new ApiError(500, 'boom'))).toEqual({
    title: "Couldn't add this garden",
    message: 'The service is temporarily unavailable. Try again.',
  });
});
