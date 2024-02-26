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

import { FungibleToken } from "@declarations/directory/directory.did";
import { useUpdateToken } from "@fe/integration";
import ImageInput from "@fe/components/image-input";
import ErrorAlert from "@fe/components/error-alert";

interface UpdateTokenFormValues {
  symbol: string;
  name: string;
  logo: string;
}

interface UpdateTokenModalProps {
  token: FungibleToken | null;
  onClose: () => void;
}

const schema = zod.object({
  logo: zod.string().min(1),
  symbol: zod.string().min(1),
  name: zod.string().min(1),
});

const UpdateTokenModal = ({ token, onClose }: UpdateTokenModalProps) => {
  const defaultValues: UpdateTokenFormValues = useMemo(
    () => ({
      logo: token?.logo ?? "",
      symbol: token?.symbol ?? "",
      name: token?.name ?? "",
    }),
    [token]
  );

  const {
    handleSubmit,
    control,
    reset: resetForm,
  } = useForm<UpdateTokenFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { isDirty, isValid } = useFormState({ control });

  const {
    mutate: updateToken,
    error,
    isLoading,
    reset: resetApi,
  } = useUpdateToken();

  const submit: SubmitHandler<UpdateTokenFormValues> = (data) => {
    updateToken(
      {
        assetId: token!.assetId,
        payload: {
          symbol: [data.symbol],
          name: [data.name],
          logo: [data.logo],
        },
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
  }, [token]);

  return (
    <Modal open={!!token} onClose={onClose}>
      <ModalDialog sx={{ width: "calc(100% - 50px)", maxWidth: "450px" }}>
        <ModalClose />
        <Typography level="h4">Update token</Typography>
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
            Update
          </Button>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default UpdateTokenModal;
