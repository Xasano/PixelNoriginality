import React from 'react';
import GridBGComponent from '../components/GridBGComponent';
import PixelBoardList from './PixelBoardList';


const ActivePixelBoardsPage: React.FC = () => {
    return (
        <GridBGComponent>
            <div className="container mx-auto py-8 px-4">
                <PixelBoardList showOnlyActive={true} hideAdminFeatures={true} />
            </div>
        </GridBGComponent>
    );
};

export default ActivePixelBoardsPage;