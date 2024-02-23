import { useState } from "react";
import { Box, Tabs, TabList, Tab, Typography } from "@mui/joy";

import Tokens from "@fe/components/tokens";
import Owners from "@fe/components/owners";
import ConnectButton from "@fe/components/connect-button";
import { useIdentity } from "@fe/integration/identity";

const Root = () => {
  const [tabValue, setTabValue] = useState(0);

  const { identity } = useIdentity();

  const principal = identity.getPrincipal().toText();

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "990px",
        p: 4,
        mx: "auto",
      }}
    >
      <Tabs
        sx={{ backgroundColor: "transparent" }}
        value={tabValue}
        onChange={(_, value) => setTabValue(value as number)}
      >
        <Box sx={{ textAlign: "right", marginBottom: 1 }}>
          <Typography level="body-xs">Your principal: {principal}</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <TabList sx={{ marginRight: 1, flexGrow: 1 }} variant="plain">
            <Tab color="neutral">Tokens</Tab>
            <Tab color="neutral">Owners</Tab>
          </TabList>
          <ConnectButton />
        </Box>
        {tabValue === 0 && <Tokens />}
        {tabValue === 1 && <Owners />}
      </Tabs>
    </Box>
  );
};

export default Root;
