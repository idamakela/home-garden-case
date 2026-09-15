import { Button, Group, Modal, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { createGardenSchema, type CreateGarden } from '../../../queries/gardens';
import { ModalActions } from '../ModalActions/ModalActions';

type GardenFormValues = {
  gardenName: string;
  totalSurfaceArea: string | number;
  locationDescription: string;
  latitude: string | number;
  longitude: string | number;
};

const emptyValues: GardenFormValues = {
  gardenName: '',
  totalSurfaceArea: '',
  locationDescription: '',
  latitude: '',
  longitude: '',
};

type AddGardenModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (body: CreateGarden) => void;
  initialValues?: CreateGarden | null;
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
  };
}

function toFormValues(input: CreateGarden): GardenFormValues {
  return {
    gardenName: input.gardenName,
    totalSurfaceArea: input.totalSurfaceArea,
    locationDescription: input.locationDescription ?? '',
    latitude: input.latitude ?? '',
    longitude: input.longitude ?? '',
  };
}

export function AddGardenModal({
  opened,
  onClose,
  onSubmit,
  initialValues = null,
}: AddGardenModalProps) {
  const [values, setValues] = useState<GardenFormValues>(emptyValues);
  const parsed = createGardenSchema.safeParse(toCreateGardenInput(values));
  const hasLatitude = emptyToOptionalNumber(values.latitude) !== null;
  const hasLongitude = emptyToOptionalNumber(values.longitude) !== null;

  useEffect(() => {
    if (!opened) {
      return;
    }

    setValues(initialValues ? toFormValues(initialValues) : emptyValues);
  }, [opened, initialValues]);

  function submit() {
    if (!parsed.success) {
      return;
    }

    onSubmit(parsed.data);
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add garden">
      <Stack>
        <TextInput
          label="Garden name"
          withAsterisk
          value={values.gardenName}
          onChange={(event) => {
            const gardenName = event.currentTarget.value;
            setValues((current) => ({ ...current, gardenName }));
          }}
        />
        <NumberInput
          label="Total surface area"
          withAsterisk
          min={0}
          hideControls
          value={values.totalSurfaceArea}
          onChange={(totalSurfaceArea) =>
            setValues((current) => ({ ...current, totalSurfaceArea }))
          }
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
            onChange={(latitude) => setValues((current) => ({ ...current, latitude }))}
          />
          <NumberInput
            label="Longitude"
            withAsterisk={hasLatitude}
            min={-180}
            max={180}
            hideControls
            value={values.longitude}
            onChange={(longitude) => setValues((current) => ({ ...current, longitude }))}
          />
        </Group>
        <ModalActions>
          <Button type="button" variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!parsed.success} onClick={submit}>
            Add garden
          </Button>
        </ModalActions>
      </Stack>
    </Modal>
  );
}
