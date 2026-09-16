import { plantKeys } from '../../app/queries/plants';

test('plantKeys.byGarden is scoped by gardenId', () => {
  expect(plantKeys.byGarden(1)).toEqual(['plants', 'garden', 1]);
  expect(plantKeys.byGarden(1)).not.toEqual(plantKeys.byGarden(2));
});
