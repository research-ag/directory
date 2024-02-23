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
import { useCorrectAssetId } from "@fe/integration";
import ErrorAlert from "@fe/components/error-alert";

interface CorrectAssetIdFormValues {
  assetId: string;
}

interface CorrectAssetIdModalProps {
  token: FungibleToken | null;
  onClose: () => void;
}

const schema = zod.object({
  assetId: zod
    .string()
    .min(1)
    .refine((value) => !isNaN(Number(value))),
});

const CorrectAssetIdModal = ({ token, onClose }: CorrectAssetIdModalProps) => {
  const defaultValues: CorrectAssetIdFormValues = useMemo(
    () => ({
      assetId: token?.assetId ? String(token.assetId) : "",
    }),
    [token]
  );

  const {
    handleSubmit,
    control,
    reset: resetForm,
  } = useForm<CorrectAssetIdFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { isDirty, isValid } = useFormState({ control });

  const {
    mutate: correctAssetId,
    error,
    isLoading,
    reset: resetApi,
  } = useCorrectAssetId();

  const submit: SubmitHandler<CorrectAssetIdFormValues> = (data) => {
    correctAssetId(
      {
        symbol: token!.symbol,
        assetId: BigInt(data.assetId),
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
        <Typography level="h4">Correct asset id</Typography>
        <form onSubmit={handleSubmit(submit)} autoComplete="off">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
          </Box>
          {!!error && <ErrorAlert errorMessage={(error as Error).message} />}
          <Button
            sx={{ marginTop: 2 }}
            variant="solid"
            loading={isLoading}
            type="submit"
            disabled={!isValid || !isDirty}
          >
            Save
          </Button>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default CorrectAssetIdModal;
