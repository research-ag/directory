import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSnackbar } from "notistack";

import { canisterId, createActor } from "@declarations/directory";
import { UpdatePayload, _SERVICE } from "@declarations/directory/directory.did";

import { useIdentity } from "./identity";

export const useDirectoryBackend = () => {
  const { identity } = useIdentity();

  const directory = createActor(canisterId, {
    agentOptions: {
      identity,
      verifyQuerySignatures: false,
    },
  });

  return { directory };
};

export const useGetTokens = () => {
  const { directory } = useDirectoryBackend();

  const { enqueueSnackbar } = useSnackbar();

  return useQuery("tokens", () => directory.allTokens(), {
    onError: () => {
      enqueueSnackbar("Failed to fetch tokens", { variant: "error" });
    },
  });
};

export const useAddToken = () => {
  const { directory } = useDirectoryBackend();

  const queryClient = useQueryClient();

  const { enqueueSnackbar } = useSnackbar();

  return useMutation(directory.addToken, {
    onSuccess: (_, { symbol }) => {
      queryClient.invalidateQueries("tokens");
      enqueueSnackbar(`Token ${symbol} added`, { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to add token", { variant: "error" });
    },
  });
};

export const useUpdateToken = () => {
  const { directory } = useDirectoryBackend();

  const queryClient = useQueryClient();

  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ assetId, payload }: { assetId: bigint; payload: UpdatePayload }) =>
      directory.updateToken(assetId, payload),
    {
      onSuccess: (_, { payload: { symbol } }) => {
        queryClient.invalidateQueries("tokens");
        enqueueSnackbar(`Token ${symbol} updated`, { variant: "success" });
      },
      onError: () => {
        enqueueSnackbar("Failed to update token", { variant: "error" });
      },
    }
  );
};

export const useCorrectAssetId = () => {
  const { directory } = useDirectoryBackend();

  const queryClient = useQueryClient();

  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ symbol, assetId }: { symbol: string; assetId: bigint }) =>
      directory.correctAssetId(symbol, assetId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("tokens");
        enqueueSnackbar("Asset id corrected", { variant: "success" });
      },
      onError: () => {
        enqueueSnackbar("Failed to correct asset id", { variant: "error" });
      },
    }
  );
};

export const useCorrectSymbol = () => {
  const { directory } = useDirectoryBackend();

  const queryClient = useQueryClient();

  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ assetId, symbol }: { assetId: bigint; symbol: string }) =>
      directory.correctSymbol(assetId, symbol),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("tokens");
        enqueueSnackbar("Symbol corrected", { variant: "success" });
      },
      onError: () => {
        enqueueSnackbar("Failed to correct symbol", { variant: "error" });
      },
    }
  );
};

export const useFreezingPeriod = () => {
  const { directory } = useDirectoryBackend();

  const { enqueueSnackbar } = useSnackbar();

  return useQuery("freezing-period", () => directory.freezingPeriod(), {
    onError: () => {
      enqueueSnackbar("Failed to fetch freezing period", { variant: "error" });
    },
  });
};

export const useGetOwners = () => {
  const { directory } = useDirectoryBackend();

  const { enqueueSnackbar } = useSnackbar();

  return useQuery("owners", () => directory.owners(), {
    onError: () => {
      enqueueSnackbar("Failed to fetch owners", { variant: "error" });
    },
  });
};

export const useAddOwner = () => {
  const { directory } = useDirectoryBackend();

  const queryClient = useQueryClient();

  const { enqueueSnackbar } = useSnackbar();

  return useMutation(directory.addOwner, {
    onSuccess: (_, principal) => {
      queryClient.invalidateQueries("owners");
      enqueueSnackbar(`Principal ${principal} added`, { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to add owner", { variant: "error" });
    },
  });
};

export const useRemoveOwner = () => {
  const { directory } = useDirectoryBackend();

  const queryClient = useQueryClient();

  const { enqueueSnackbar } = useSnackbar();

  return useMutation(directory.removeOwner, {
    onSuccess: (_, principal) => {
      queryClient.invalidateQueries("owners");
      enqueueSnackbar(`Principal ${principal} removed`, { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to remove owner", { variant: "error" });
    },
  });
};

export const useIsOwner = () => {
  const { data } = useGetOwners();
  const { identity } = useIdentity();
  const isOwner = useMemo(
    () =>
      (data ?? []).some(
        (principal) => principal.toText() === identity.getPrincipal().toText()
      ),
    [data, identity]
  );
  return isOwner;
};
