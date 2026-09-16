import { ApiError } from '../../app/lib/api';
import {
  plantsCreateCopy,
  plantsDeleteCopy,
  plantsLoadCopy,
  plantsUpdateCopy,
} from '../../app/lib/plant-copy';

test('plantsLoadCopy maps 404', () => {
  expect(plantsLoadCopy(new ApiError(404, 'missing'))).toEqual({
    title: "We couldn't find plants",
    message: 'They may have been moved or deleted.',
  });
});

test('plantsLoadCopy maps 409', () => {
  expect(plantsLoadCopy(new ApiError(409, 'conflict'))).toEqual({
    title: "Couldn't load plants",
    message: 'The list changed. Try again.',
  });
});

test('plantsLoadCopy maps 500', () => {
  expect(plantsLoadCopy(new ApiError(500, 'boom'))).toEqual({
    title: "Couldn't load plants",
    message: 'The service is temporarily unavailable. Try again.',
  });
});

test('plantsLoadCopy maps unknown errors', () => {
  expect(plantsLoadCopy(new Error('offline'))).toEqual({
    title: "Couldn't load plants",
    message: 'Please try again.',
  });
});

test('plantsCreateCopy maps 400', () => {
  expect(plantsCreateCopy(new ApiError(400, 'invalid'))).toEqual({
    title: "Couldn't add this plant",
    message: 'Check the details and try again.',
  });
});

test('plantsCreateCopy maps 409', () => {
  expect(plantsCreateCopy(new ApiError(409, 'conflict'))).toEqual({
    title: "Couldn't add this plant",
    message: 'This conflicts with current data. Try again.',
  });
});

test('plantsCreateCopy maps 500', () => {
  expect(plantsCreateCopy(new ApiError(500, 'boom'))).toEqual({
    title: "Couldn't add this plant",
    message: 'The service is temporarily unavailable. Try again.',
  });
});

test('plantsCreateCopy maps unknown errors', () => {
  expect(plantsCreateCopy(new Error('offline'))).toEqual({
    title: "Couldn't add this plant",
    message: 'Please try again.',
  });
});

test('plantsUpdateCopy maps 400', () => {
  expect(plantsUpdateCopy(new ApiError(400, 'invalid'))).toEqual({
    title: "Couldn't update this plant",
    message: 'Check the details and try again.',
  });
});

test('plantsUpdateCopy maps 409', () => {
  expect(plantsUpdateCopy(new ApiError(409, 'conflict'))).toEqual({
    title: "Couldn't update this plant",
    message: 'This conflicts with current data. Try again.',
  });
});

test('plantsUpdateCopy maps 500', () => {
  expect(plantsUpdateCopy(new ApiError(500, 'boom'))).toEqual({
    title: "Couldn't update this plant",
    message: 'The service is temporarily unavailable. Try again.',
  });
});

test('plantsUpdateCopy maps unknown errors', () => {
  expect(plantsUpdateCopy(new Error('offline'))).toEqual({
    title: "Couldn't update this plant",
    message: 'Please try again.',
  });
});

test('plantsDeleteCopy maps 400', () => {
  expect(plantsDeleteCopy(new ApiError(400, 'invalid'))).toEqual({
    title: "Couldn't delete this plant",
    message: 'Check the details and try again.',
  });
});

test('plantsDeleteCopy maps 409', () => {
  expect(plantsDeleteCopy(new ApiError(409, 'conflict'))).toEqual({
    title: "Couldn't delete this plant",
    message: 'This conflicts with current data. Try again.',
  });
});

test('plantsDeleteCopy maps 500', () => {
  expect(plantsDeleteCopy(new ApiError(500, 'boom'))).toEqual({
    title: "Couldn't delete this plant",
    message: 'The service is temporarily unavailable. Try again.',
  });
});

test('plantsDeleteCopy names the plant when provided', () => {
  expect(plantsDeleteCopy(new ApiError(500, 'boom'), 'Tomato')).toEqual({
    title: "Couldn't delete Tomato",
    message: 'The service is temporarily unavailable. Try again.',
  });
});
