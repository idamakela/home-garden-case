import { Button, Group, Modal, NativeSelect, NumberInput, Stack, TextInput } from '@mantine/core';
import { useEffect, useState, type FormEvent } from 'react';
import { z } from 'zod/v4';
import { createPlantSchema, type CreatePlant, type PlantType } from '../../../queries/plants';
import { ModalActions } from '../ModalActions/ModalActions';

type PlantFormValues = {
  plantName: string;
  species: string;
  plantType: string;
  plantationDate: string;
  surfaceAreaRequired: string | number;
  idealHumidityLevel: string | number;
};

type FieldErrors = {
  plantName?: string;
  species?: string;
  plantType?: string;
  plantationDate?: string;
  surfaceAreaRequired?: string;
  idealHumidityLevel?: string;
  gardenId?: string;
};

function toDatetimeLocalValue(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function emptyFormValues(): PlantFormValues {
  return {
    plantName: '',
    species: '',
    plantType: '',
    plantationDate: toDatetimeLocalValue(new Date()),
    surfaceAreaRequired: '',
    idealHumidityLevel: '',
  };
}

const plantTypeOptions: { value: PlantType; label: string }[] = [
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'flower', label: 'Flower' },
];

type AddPlantModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (body: CreatePlant) => void;
  gardenId: number;
  gardenName: string;
  showGardenId?: boolean;
  initialValues?: CreatePlant | null;
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

function plantationDateToIso(value: string): string | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function toCreatePlantInput(values: PlantFormValues, gardenId: number) {
  const surfaceAreaRequired = emptyToOptionalNumber(values.surfaceAreaRequired);
  const idealHumidityLevel = emptyToOptionalNumber(values.idealHumidityLevel);

  return {
    plantName: values.plantName,
    species: values.species,
    plantType: values.plantType === '' ? undefined : values.plantType,
    plantationDate: plantationDateToIso(values.plantationDate),
    surfaceAreaRequired: surfaceAreaRequired === null ? undefined : surfaceAreaRequired,
    idealHumidityLevel: idealHumidityLevel === null ? undefined : idealHumidityLevel,
    gardenId,
  };
}

function toFormValues(input: CreatePlant): PlantFormValues {
  return {
    plantName: input.plantName,
    species: input.species,
    plantType: input.plantType,
    plantationDate: toDatetimeLocalValue(new Date(input.plantationDate)),
    surfaceAreaRequired: input.surfaceAreaRequired,
    idealHumidityLevel: input.idealHumidityLevel,
  };
}

function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    let message = issue.message;

    if (issue.code === 'invalid_type') {
      if (key === 'surfaceAreaRequired') {
        message = 'Surface area required is required';
      } else if (key === 'idealHumidityLevel') {
        message = 'Ideal humidity level is required';
      } else if (key === 'plantationDate') {
        message = 'Plantation date is required';
      } else if (key === 'plantType') {
        message = 'Plant type is required';
      }
    }

    if (
      key === 'plantName' ||
      key === 'species' ||
      key === 'plantType' ||
      key === 'plantationDate' ||
      key === 'surfaceAreaRequired' ||
      key === 'idealHumidityLevel' ||
      key === 'gardenId'
    ) {
      errors[key] ??= message;
    }
  }

  return errors;
}

function modalTitle(gardenName: string, showGardenId: boolean) {
  if (showGardenId) {
    return 'Add plant';
  }

  return `Add plant to ${gardenName} garden`;
}

export function AddPlantModal({
  opened,
  onClose,
  onSubmit,
  gardenId,
  gardenName,
  showGardenId = false,
  initialValues = null,
}: AddPlantModalProps) {
  const [values, setValues] = useState<PlantFormValues>(emptyFormValues);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!opened) {
      return;
    }

    setValues(initialValues ? toFormValues(initialValues) : emptyFormValues());
    setErrors({});
  }, [opened, initialValues]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = createPlantSchema.safeParse(toCreatePlantInput(values, gardenId));

    if (!parsed.success) {
      setErrors(fieldErrorsFromZod(parsed.error));
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle(gardenName, showGardenId)}>
      <form onSubmit={submit}>
        <Stack>
          {showGardenId ? (
            <TextInput label="Garden ID" value={String(gardenId)} disabled />
          ) : null}
          <TextInput
            label="Plant name"
            withAsterisk
            value={values.plantName}
            error={errors.plantName}
            onChange={(event) => {
              const plantName = event.currentTarget.value;
              setValues((current) => ({ ...current, plantName }));
              setErrors((current) => ({ ...current, plantName: undefined }));
            }}
          />
          <TextInput
            label="Species"
            withAsterisk
            value={values.species}
            error={errors.species}
            onChange={(event) => {
              const species = event.currentTarget.value;
              setValues((current) => ({ ...current, species }));
              setErrors((current) => ({ ...current, species: undefined }));
            }}
          />
          <NativeSelect
            label="Plant type"
            withAsterisk
            data={[{ value: '', label: 'Select plant type' }, ...plantTypeOptions]}
            value={values.plantType}
            error={errors.plantType}
            onChange={(event) => {
              const plantType = event.currentTarget.value;
              setValues((current) => ({ ...current, plantType }));
              setErrors((current) => ({ ...current, plantType: undefined }));
            }}
          />
          <TextInput
            label="Plantation date"
            withAsterisk
            type="datetime-local"
            value={values.plantationDate}
            error={errors.plantationDate}
            onChange={(event) => {
              const plantationDate = event.currentTarget.value;
              setValues((current) => ({ ...current, plantationDate }));
              setErrors((current) => ({ ...current, plantationDate: undefined }));
            }}
          />
          <Group grow wrap="wrap" preventGrowOverflow={false}>
            <NumberInput
              label="Surface area required (m²)"
              withAsterisk
              min={0}
              hideControls
              value={values.surfaceAreaRequired}
              error={errors.surfaceAreaRequired}
              onChange={(surfaceAreaRequired) => {
                setValues((current) => ({ ...current, surfaceAreaRequired }));
                setErrors((current) => ({ ...current, surfaceAreaRequired: undefined }));
              }}
            />
            <NumberInput
              label="Ideal humidity level (%)"
              withAsterisk
              min={0}
              max={100}
              hideControls
              value={values.idealHumidityLevel}
              error={errors.idealHumidityLevel}
              onChange={(idealHumidityLevel) => {
                setValues((current) => ({ ...current, idealHumidityLevel }));
                setErrors((current) => ({ ...current, idealHumidityLevel: undefined }));
              }}
            />
          </Group>
          <ModalActions>
            <Button type="button" variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add plant</Button>
          </ModalActions>
        </Stack>
      </form>
    </Modal>
  );
}
