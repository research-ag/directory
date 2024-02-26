import { useState } from "react";

import PageTemplate from "@fe/components/page-template";

import OwnersTable from "./owners-table";
import AddOwnerModal from "./add-owner-modal";

const Owners = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  return (
    <PageTemplate
      title="Owners"
      addButtonTitle="Add new owner"
      onAddButtonClick={openAddModal}
    >
      <OwnersTable />
      <AddOwnerModal isOpen={isAddModalOpen} onClose={closeAddModal} />
    </PageTemplate>
  );
};

export default Owners;
