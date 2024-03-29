import { format } from "date-fns";
import {
  Box,
  Table,
  IconButton,
  Dropdown,
  MenuButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/joy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

import { FungibleToken } from "@declarations/directory/directory.did";
import { useGetTokens, useIsOwner, useFreezingPeriod } from "@fe/integration";

interface TokensTableProps {
  onCorrectAssetId: (token: FungibleToken) => void;
  onCorrectSymbolId: (token: FungibleToken) => void;
  onUpdateTokenInfo: (token: FungibleToken) => void;
}

const TokensTable = ({
  onCorrectAssetId,
  onCorrectSymbolId,
  onUpdateTokenInfo,
}: TokensTableProps) => {
  const { data: tokens } = useGetTokens();

  const isOwner = useIsOwner();

  const { data: freezingPeriod } = useFreezingPeriod();

  const isTokenCorrectable = (token: FungibleToken) =>
    Date.now() * 1_000_000 - Number(token.createdAt) < Number(freezingPeriod);

  return (
    <Box sx={{ width: "100%", overflow: "auto" }}>
      <Table>
        <colgroup>
          <col style={{ width: isOwner ? "100px" : "50px" }} />
          <col style={{ width: "80px" }} />
          <col style={{ width: "70px" }} />
          <col style={{ width: "70px" }} />
          <col style={{ width: "110px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
        </colgroup>

        <thead>
          <tr>
            <th></th>
            <th>Asset id</th>
            <th>Logo</th>
            <th>Symbol</th>
            <th>Name</th>
            <th>Created at</th>
            <th>Modified at</th>
          </tr>
        </thead>
        <tbody>
          {(tokens ?? []).map((token) => {
            const isCorrectable = isTokenCorrectable(token);

            return (
              <tr key={String(token.assetId)}>
                <td>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      marginRight: 1,
                    }}
                  >
                    {isOwner && (
                      <Dropdown>
                        <MenuButton
                          slots={{ root: IconButton }}
                          slotProps={{
                            root: { size: "sm", variant: "outlined" },
                          }}
                        >
                          <MoreVertIcon />
                        </MenuButton>
                        <Menu placement="bottom-start">
                          <Tooltip
                            title={
                              !isCorrectable &&
                              "Time to correct token has expired"
                            }
                            disableInteractive
                          >
                            <Box>
                              <MenuItem
                                onClick={() => onCorrectAssetId(token)}
                                disabled={!isCorrectable}
                              >
                                Correct asset id
                              </MenuItem>
                            </Box>
                          </Tooltip>
                          <Tooltip
                            title={
                              !isCorrectable &&
                              "Time to correct token has expired"
                            }
                            disableInteractive
                          >
                            <Box>
                              <MenuItem
                                onClick={() => onCorrectSymbolId(token)}
                                disabled={!isCorrectable}
                              >
                                Correct symbol
                              </MenuItem>
                            </Box>
                          </Tooltip>
                          <MenuItem onClick={() => onUpdateTokenInfo(token)}>
                            Update token info
                          </MenuItem>
                        </Menu>
                      </Dropdown>
                    )}
                    <Box
                      sx={(theme) => ({
                        display: "flex",
                        "& svg": {
                          fill: !isCorrectable
                            ? theme.palette.danger.plainColor
                            : theme.palette.success.plainColor,
                        },
                      })}
                    >
                      {!isCorrectable ? <LockIcon /> : <LockOpenIcon />}
                    </Box>
                  </Box>
                </td>
                <td>{String(token.assetId)}</td>
                <td>
                  <img style={{ height: "30px" }} src={token.logo} alt="" />
                </td>
                <td>{token.symbol}</td>
                <td>{token.name}</td>
                <td>
                  {format(
                    new Date(Number(token.createdAt) / 1_000_000),
                    "MMM dd, yyyy HH:mm"
                  )}
                </td>
                <td>
                  {format(
                    new Date(Number(token.modifiedAt) / 1_000_000),
                    "MMM dd, yyyy HH:mm"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Box>
  );
};

export default TokensTable;
