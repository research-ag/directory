import { useState } from "react";

import PageTemplate from "@fe/components/page-template";
import { FungibleToken } from "@declarations/directory/directory.did";

import TokensTable from "./tokens-table";
import AddTokenModal from "./add-token-modal";
import UpdateTokenModal from "./update-token-modal";
import CorrectAssetIdModal from "./correct-asset-id-modal";
import CorrectSymbolModal from "./correct-symbol-modal";

const Tokens = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const [tokenToCorrectAssetId, setTokenToCorrectAssetId] =
    useState<FungibleToken | null>(null);

  const [tokenToCorrectSymbol, setTokenToCorrectSymbol] =
    useState<FungibleToken | null>(null);

  const [tokenToUpdateInfo, setTokenToUpdateInfo] =
    useState<FungibleToken | null>(null);

  return (
    <PageTemplate
      title="Tokens"
      addButtonTitle="Add new token"
      onAddButtonClick={openAddModal}
    >
      <TokensTable
        onCorrectAssetId={setTokenToCorrectAssetId}
        onCorrectSymbolId={setTokenToCorrectSymbol}
        onUpdateTokenInfo={setTokenToUpdateInfo}
      />
      <AddTokenModal isOpen={isAddModalOpen} onClose={closeAddModal} />
      <CorrectAssetIdModal
        token={tokenToCorrectAssetId}
        onClose={() => setTokenToCorrectAssetId(null)}
      />
      <CorrectSymbolModal
        token={tokenToCorrectSymbol}
        onClose={() => setTokenToCorrectSymbol(null)}
      />
      <UpdateTokenModal
        token={tokenToUpdateInfo}
        onClose={() => setTokenToUpdateInfo(null)}
      />
    </PageTemplate>
  );
};

export default Tokens;
