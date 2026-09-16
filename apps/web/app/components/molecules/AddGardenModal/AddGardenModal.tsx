import { Button, Group, Modal, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { useEffect, useState, type FormEvent } from 'react';
import { z } from 'zod/v4';
import { createGardenSchema, type CreateGarden } from '../../../queries/gardens';
import { ModalActions } from '../ModalActions/ModalActions';

type GardenFormValues = {
  gardenName: string;
  totalSurfaceArea: string | number;
  locationDescription: string;
  latitude: string | number;
  longitude: string | number;
  minHumidity: string | number;
  maxHumidity: string | number;
};

type FieldErrors = {
  gardenName?: string;
  totalSurfaceArea?: string;
  latitude?: string;
  longitude?: string;
  minHumidity?: string;
  maxHumidity?: string;
};

const emptyValues: GardenFormValues = {
  gardenName: '',
  totalSurfaceArea: '',
  locationDescription: '',
  latitude: '',
  longitude: '',
  minHumidity: '',
  maxHumidity: '',
};

type AddGardenModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (body: CreateGarden) => void;
  initialValues?: CreateGarden | null;
  title?: string;
  submitLabel?: string;
};

function emptyToOptionalNumber(value: string | number): number | null {
  if (value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toCreateGardenInput(values: GardenFormValues) {
  const totalSurfaceArea = emptyToOptionalNumber(values.totalSurfaceArea);
  const locationDescription =
    values.locationDescription.trim() === '' ? null : values.locationDescription;

  return {
    gardenName: values.gardenName,
    totalSurfaceArea: totalSurfaceArea === null ? undefined : totalSurfaceArea,
    locationDescription,
    latitude: emptyToOptionalNumber(values.latitude),
    longitude: emptyToOptionalNumber(values.longitude),
    minHumidity: emptyToOptionalNumber(values.minHumidity),
    maxHumidity: emptyToOptionalNumber(values.maxHumidity),
  };
}

function toFormValues(input: CreateGarden): GardenFormValues {
  return {
    gardenName: input.gardenName,
    totalSurfaceArea: input.totalSurfaceArea,
    locationDescription: input.locationDescription ?? '',
    latitude: input.latitude ?? '',
    longitude: input.longitude ?? '',
    minHumidity: input.minHumidity ?? '',
    maxHumidity: input.maxHumidity ?? '',
  };
}

function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    const message =
      key === 'totalSurfaceArea' && issue.code === 'invalid_type'
        ? 'Total surface area is required'
        : issue.message;

    if (
      key === 'gardenName' ||
      key === 'totalSurfaceArea' ||
      key === 'latitude' ||
      key === 'longitude' ||
      key === 'minHumidity' ||
      key === 'maxHumidity'
    ) {
      errors[key] ??= message;
      continue;
    }

    if (message.toLowerCase().includes('humidity')) {
      errors.minHumidity ??= message;
      errors.maxHumidity ??= message;
      continue;
    }

    errors.latitude ??= message;
    errors.longitude ??= message;
  }

  return errors;
}

export function AddGardenModal({
  opened,
  onClose,
  onSubmit,
  initialValues = null,
  title = 'Add garden',
  submitLabel = 'Add garden',
}: AddGardenModalProps) {
  const [values, setValues] = useState<GardenFormValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const hasLatitude = emptyToOptionalNumber(values.latitude) !== null;
  const hasLongitude = emptyToOptionalNumber(values.longitude) !== null;
  const hasMinHumidity = emptyToOptionalNumber(values.minHumidity) !== null;
  const hasMaxHumidity = emptyToOptionalNumber(values.maxHumidity) !== null;

  useEffect(() => {
    if (!opened) {
      return;
    }

    setValues(initialValues ? toFormValues(initialValues) : emptyValues);
    setErrors({});
  }, [opened, initialValues]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = createGardenSchema.safeParse(toCreateGardenInput(values));

    if (!parsed.success) {
      setErrors(fieldErrorsFromZod(parsed.error));
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <form onSubmit={submit}>
        <Stack>
          <TextInput
            label="Garden name"
            withAsterisk
            value={values.gardenName}
            error={errors.gardenName}
            onChange={(event) => {
              const gardenName = event.currentTarget.value;
              setValues((current) => ({ ...current, gardenName }));
              setErrors((current) => ({ ...current, gardenName: undefined }));
            }}
          />
          <NumberInput
            label="Total surface area"
            withAsterisk
            min={0}
            hideControls
            value={values.totalSurfaceArea}
            error={errors.totalSurfaceArea}
            onChange={(totalSurfaceArea) => {
              setValues((current) => ({ ...current, totalSurfaceArea }));
              setErrors((current) => ({ ...current, totalSurfaceArea: undefined }));
            }}
          />
          <Textarea
            label="Location description"
            autosize
            minRows={3}
            maxRows={8}
            resize="vertical"
            value={values.locationDescription}
            onChange={(event) => {
              const locationDescription = event.currentTarget.value;
              setValues((current) => ({ ...current, locationDescription }));
            }}
          />
          <Group grow wrap="nowrap" preventGrowOverflow={false}>
            <NumberInput
              label="Latitude"
              withAsterisk={hasLongitude}
              min={-90}
              max={90}
              hideControls
              value={values.latitude}
              error={errors.latitude}
              onChange={(latitude) => {
                setValues((current) => ({ ...current, latitude }));
                setErrors((current) => ({ ...current, latitude: undefined }));
              }}
            />
            <NumberInput
              label="Longitude"
              withAsterisk={hasLatitude}
              min={-180}
              max={180}
              hideControls
              value={values.longitude}
              error={errors.longitude}
              onChange={(longitude) => {
                setValues((current) => ({ ...current, longitude }));
                setErrors((current) => ({ ...current, longitude: undefined }));
              }}
            />
          </Group>
          <Group grow wrap="nowrap" preventGrowOverflow={false}>
            <NumberInput
              label="Min humidity (%)"
              withAsterisk={hasMaxHumidity}
              min={0}
              max={100}
              hideControls
              value={values.minHumidity}
              error={errors.minHumidity}
              onChange={(minHumidity) => {
                setValues((current) => ({ ...current, minHumidity }));
                setErrors((current) => ({ ...current, minHumidity: undefined }));
              }}
            />
            <NumberInput
              label="Max humidity (%)"
              withAsterisk={hasMinHumidity}
              min={0}
              max={100}
              hideControls
              value={values.maxHumidity}
              error={errors.maxHumidity}
              onChange={(maxHumidity) => {
                setValues((current) => ({ ...current, maxHumidity }));
                setErrors((current) => ({ ...current, maxHumidity: undefined }));
              }}
            />
          </Group>
          <ModalActions>
            <Button type="button" variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </ModalActions>
        </Stack>
      </form>
    </Modal>
  );
}
