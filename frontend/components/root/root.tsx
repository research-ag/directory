import { useState } from "react";
import { Box, Tabs, TabList, Tab } from "@mui/joy";

import Tokens from "@fe/components/tokens";
import Owners from "@fe/components/owners";
import ConnectButton from "@fe/components/connect-button";

const Root = () => {
  const [tabValue, setTabValue] = useState(0);

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
