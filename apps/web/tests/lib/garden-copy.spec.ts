import { ApiError } from '../../app/lib/api';
import {
  gardensCreateCopy,
  gardensDeleteCopy,
  gardensLoadCopy,
  gardensOvercrowdedCopy,
  gardensUpdateCopy,
} from '../../app/lib/garden-copy';

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

test('gardensUpdateCopy maps 400', () => {
  expect(gardensUpdateCopy(new ApiError(400, 'invalid'))).toEqual({
    title: "Couldn't update this garden",
    message: 'Check the details and try again.',
  });
});

test('gardensUpdateCopy maps 409', () => {
  expect(gardensUpdateCopy(new ApiError(409, 'conflict'))).toEqual({
    title: "Couldn't update this garden",
    message: 'This conflicts with current data. Try again.',
  });
});

test('gardensUpdateCopy maps 500', () => {
  expect(gardensUpdateCopy(new ApiError(500, 'boom'))).toEqual({
    title: "Couldn't update this garden",
    message: 'The service is temporarily unavailable. Try again.',
  });
});

test('gardensDeleteCopy maps 400', () => {
  expect(gardensDeleteCopy(new ApiError(400, 'invalid'))).toEqual({
    title: "Couldn't delete this garden",
    message: 'Check the details and try again.',
  });
});

test('gardensDeleteCopy maps 409', () => {
  expect(gardensDeleteCopy(new ApiError(409, 'conflict'))).toEqual({
    title: "Couldn't delete this garden",
    message: 'This conflicts with current data. Try again.',
  });
});

test('gardensDeleteCopy maps 500', () => {
  expect(gardensDeleteCopy(new ApiError(500, 'boom'))).toEqual({
    title: "Couldn't delete this garden",
    message: 'The service is temporarily unavailable. Try again.',
  });
});

test('gardensDeleteCopy names the garden when provided', () => {
  expect(gardensDeleteCopy(new ApiError(500, 'boom'), 'Front yard')).toEqual({
    title: "Couldn't delete Front yard",
    message: 'The service is temporarily unavailable. Try again.',
  });
});

test('gardensOvercrowdedCopy interpolates used and total area', () => {
  expect(gardensOvercrowdedCopy(2, 1)).toEqual({
    title: 'Plants are overcrowded',
    message:
      'These plants need 2m² but this garden is only 1m². Remove plants or increase the garden surface area.',
  });
});
