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

import { useAddToken } from "@fe/integration";
import ImageInput from "@fe/components/image-input";
import ErrorAlert from "@fe/components/error-alert";

interface AddFormValues {
  assetId: string;
  symbol: string;
  name: string;
  logo: string;
}

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const schema = zod.object({
  logo: zod.string().min(1),
  assetId: zod
    .string()
    .min(1)
    .refine((value) => !isNaN(Number(value))),
  symbol: zod.string().min(1),
  name: zod.string().min(1),
});

const AddTokenModal = ({ isOpen, onClose }: AddModalProps) => {
  const defaultValues: AddFormValues = useMemo(
    () => ({
      logo: "",
      assetId: "",
      symbol: "",
      name: "",
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

  const { mutate: addToken, error, isLoading, reset: resetApi } = useAddToken();

  const submit: SubmitHandler<AddFormValues> = (data) => {
    addToken(
      {
        assetId: BigInt(data.assetId),
        symbol: data.symbol,
        name: data.name,
        logo: data.logo,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  useEffect(() => {
    resetForm(defaultValues);
    resetApi();
  }, [isOpen]);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog sx={{ width: "calc(100% - 50px)", maxWidth: "450px" }}>
        <ModalClose />
        <Typography level="h4">Add token</Typography>
        <form onSubmit={handleSubmit(submit)} autoComplete="off">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Controller
              name="logo"
              control={control}
              render={({ field }) => (
                <ImageInput
                  label="Logo"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="assetId"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl>
                  <FormLabel>Asset id</FormLabel>
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
            <Controller
              name="symbol"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl>
                  <FormLabel>Symbol</FormLabel>
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
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl>
                  <FormLabel>Name</FormLabel>
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

export default AddTokenModal;
