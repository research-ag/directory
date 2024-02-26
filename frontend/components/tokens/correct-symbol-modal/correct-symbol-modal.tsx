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
import { useCorrectSymbol } from "@fe/integration";
import ErrorAlert from "@fe/components/error-alert";

interface CorrectSymbolFormValues {
  symbol: string;
}

interface CorrectSymbolModalProps {
  token: FungibleToken | null;
  onClose: () => void;
}

const schema = zod.object({
  symbol: zod.string().min(1),
});

const CorrectSymbolModal = ({ token, onClose }: CorrectSymbolModalProps) => {
  const defaultValues: CorrectSymbolFormValues = useMemo(
    () => ({
      symbol: token?.symbol ?? "",
    }),
    [token]
  );

  const {
    handleSubmit,
    control,
    reset: resetForm,
  } = useForm<CorrectSymbolFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { isDirty, isValid } = useFormState({ control });

  const {
    mutate: correctSymbol,
    error,
    isLoading,
    reset: resetApi,
  } = useCorrectSymbol();

  const submit: SubmitHandler<CorrectSymbolFormValues> = (data) => {
    correctSymbol(
      {
        assetId: token!.assetId,
        symbol: data.symbol,
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
        <Typography level="h4">Correct symbol</Typography>
        <form onSubmit={handleSubmit(submit)} autoComplete="off">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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

export default CorrectSymbolModal;
