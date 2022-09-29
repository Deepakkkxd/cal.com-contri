import React, { useState } from "react";

import EventTypeAppContext from "@calcom/app-store/EventTypeAppContext";
import AppCard from "@calcom/app-store/_components/AppCard";
import RainbowInstallForm from "@calcom/app-store/rainbow/components/RainbowInstallForm";
import type { EventTypeAppCardComponent } from "@calcom/app-store/types";

const EventTypeAppCard: EventTypeAppCardComponent = function EventTypeAppCard({ app }) {
  const [getAppData, setAppData] = React.useContext(EventTypeAppContext);
  const blockchainId = getAppData("blockchainId");
  const smartContractAddress = getAppData("smartContractAddress");
  const [showRainbowSection, setShowRainbowSection] = useState(!!blockchainId && !!smartContractAddress);

  return (
    <AppCard
      app={app}
      switchOnClick={(e) => {
        if (!e) {
          setAppData("blockchainId", 1);
          setAppData("smartContractAddress", "");
        }

        setShowRainbowSection(e);
      }}
      switchChecked={showRainbowSection}>
      {showRainbowSection && (
        <RainbowInstallForm
          setAppData={setAppData}
          blockchainId={(blockchainId as number) || 1}
          smartContractAddress={(smartContractAddress as string) || ""}
        />
      )}
    </AppCard>
  );
};

export default EventTypeAppCard;
