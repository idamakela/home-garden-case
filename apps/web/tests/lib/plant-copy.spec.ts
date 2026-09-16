import { ApiError } from '../../app/lib/api';
import { plantsLoadCopy } from '../../app/lib/plant-copy';

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
