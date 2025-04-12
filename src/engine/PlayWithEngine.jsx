import { Toaster } from 'react-hot-toast';
import ChessGame from "./components/ChessGame";
import Lightning from './components/Lightning';

import { useState } from 'react';

const PlayWithEngine = () => {

    const [playerData, setPlayerData] = useState(null);

    return ( 
        <div>
            <Toaster />
            <ChessGame playerData={playerData}/>
            <div style={{ width: '100%', height: '600px', position: 'relative' }}>
            <Lightning
                hue={220}
                xOffset={0}
                speed={1}
                intensity={1}
                size={1}
            />
            </div>
        </div>
    );
}
 
export default PlayWithEngine;