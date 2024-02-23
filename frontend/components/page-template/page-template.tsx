import { Add } from "@mui/icons-material";
import { Sheet, Box, Typography, Button } from "@mui/joy";

import { useIsOwner } from "@fe/integration";

interface PageTemplateProps {
  children: React.ReactNode;
  title: string;
  addButtonTitle: string;
  onAddButtonClick: () => void;
}

const PageTemplate = ({
  children,
  title,
  addButtonTitle,
  onAddButtonClick,
}: PageTemplateProps) => {
  const isOwner = useIsOwner();

  return (
    <Sheet
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: "sm",
        boxShadow: "md",
      }}
      variant="outlined"
      color="neutral"
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography level="h1">{title}</Typography>
        {isOwner && (
          <Button
            sx={{ marginLeft: "auto" }}
            variant="solid"
            startDecorator={<Add />}
            onClick={onAddButtonClick}
          >
            {addButtonTitle}
          </Button>
        )}
      </Box>
      {children}
    </Sheet>
  );
};

export default PageTemplate;
