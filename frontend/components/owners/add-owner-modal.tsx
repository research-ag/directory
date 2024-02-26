import { useEffect, useMemo } from "react";
import {
  useForm,
  SubmitHandler,
  Controller,
  useFormState,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from "zod";
import {
  Box,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Button,
} from "@mui/joy";

import { useAddOwner } from "@fe/integration";
import ErrorAlert from "@fe/components/error-alert";
import { Principal } from "@dfinity/principal";

interface AddFormValues {
  principal: string;
}

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const validatePrincipal = (value: string): boolean => {
  try {
    Principal.from(value);
    return true;
  } catch (e) {
    return false;
  }
};

const schema = zod.object({
  principal: zod
    .string()
    .min(1)
    .refine((value) => validatePrincipal(value)),
});

const AddOwnerModal = ({ isOpen, onClose }: AddModalProps) => {
  const defaultValues: AddFormValues = useMemo(
    () => ({
      principal: "",
    }),
    []
  );

  const {
    handleSubmit,
    control,
    reset: resetForm,
  } = useForm<AddFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { isDirty, isValid } = useFormState({ control });

  const { mutate: addOwner, error, isLoading, reset: resetApi } = useAddOwner();

  const submit: SubmitHandler<AddFormValues> = (data) => {
    addOwner(Principal.fromText(data.principal), {
      onSuccess: () => {
        onClose();
      },
    });
  };

  useEffect(() => {
    resetForm(defaultValues);
    resetApi();
  }, [isOpen]);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog sx={{ width: "calc(100% - 50px)", maxWidth: "450px" }}>
        <ModalClose />
        <Typography level="h4">Add owner</Typography>
        <form onSubmit={handleSubmit(submit)} autoComplete="off">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Controller
              name="principal"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl>
                  <FormLabel>Principal</FormLabel>
                  <Input
                    type="text"
                    variant="outlined"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    autoComplete="off"
                    error={!!fieldState.error}
                  />
                </FormControl>
              )}
            />
          </Box>
          {!!error && <ErrorAlert errorMessage={(error as Error).message} />}
          <Button
            sx={{ marginTop: 2 }}
            variant="solid"
            loading={isLoading}
            type="submit"
            disabled={!isValid || !isDirty}
          >
            Add
          </Button>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default AddOwnerModal;
