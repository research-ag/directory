import { useMemo, useState } from "react";
import { format, differenceInHours, formatDuration } from "date-fns";
import { Box, Tabs, TabList, Tab } from "@mui/joy";

import Tokens from "@fe/components/tokens";
import Owners from "@fe/components/owners";
import ConnectButton from "@fe/components/connect-button";
import ThemeButton from "@fe/components/theme-button";
import { useIdentity } from "@fe/integration/identity";
import { useFreezingPeriod } from "@fe/integration";

import InfoItem from "./info-item";

const Root = () => {
  const [tabValue, setTabValue] = useState(0);

  const { identity } = useIdentity();

  const userPrincipal = identity.getPrincipal().toText();

  const ledgerPrincipal = "rqx66-eyaaa-aaaap-aaona-cai";

  const { data: freezingPeriod } = useFreezingPeriod();

  const freezingPeriodString = useMemo(() => {
    if (!freezingPeriod) {
      return "N/A";
    }

    const hours = differenceInHours(
      new Date(Date.now() + Number(freezingPeriod) / 1_000_000),
      new Date()
    );

    return formatDuration({ hours });
  }, [freezingPeriod]);

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
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 0.5,
              marginBottom: 1,
            }}
          >
            <InfoItem label="Your principal" content={userPrincipal} withCopy />
            <InfoItem
              label="Ledger's principal"
              content={ledgerPrincipal}
              withCopy
            />
            <InfoItem label="Freezing period" content={freezingPeriodString} />
          </Box>
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
          <ThemeButton sx={{ marginLeft: 1 }} />
        </Box>
        {tabValue === 0 && <Tokens />}
        {tabValue === 1 && <Owners />}
      </Tabs>
    </Box>
  );
};

export default Root;
