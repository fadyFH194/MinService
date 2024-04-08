import React from "react";
import Box from "@mui/material/Box";
import { RefreshProvider } from "../contexts/RefreshProvider";
import { PeriodicRefreshProvider } from "../contexts/PeriodicRefreshProvider";
import PostColumn from "../components/Post/PostColumn";

const FeedPage = () => {
  return (
    <PeriodicRefreshProvider>
      <RefreshProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "flex-start",
            padding: { xs: 1, md: 3 },
            paddingTop: { md: '5%' }, // Larger top padding on medium and larger devices bc top allignment made nav bar cover some info
            gap: { xs: 1, md: 2 },
            marginTop: { xs: "10%", md: 3 }, // Removed margin top on extra-small devices
            width: '100%', // Ensure full width usage
          }}
        >
          <PostColumn/>
        </Box>
      </RefreshProvider>
    </PeriodicRefreshProvider>
  );
};

export default FeedPage;
