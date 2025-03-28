import React from "react";
import GridBGComponent from "../components/GridBGComponent";
import PixelBoardList from "./PixelBoardList";

const FinishedPixelBoardsPage: React.FC = () => {
  return (
    <GridBGComponent>
      <div className="container mx-auto py-8 px-4">
        <PixelBoardList showOnlyFinished={true} hideAdminFeatures={true} />
      </div>
    </GridBGComponent>
  );
};

export default FinishedPixelBoardsPage;
