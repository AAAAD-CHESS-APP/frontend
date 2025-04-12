import { Toaster } from 'react-hot-toast';
import ChessGame from "./components/ChessGame";
import Lightning from './components/Lightning';
import Navbar from "./../landing/Navbar"

import { useState } from 'react';

const PlayWithEngine = () => {
    const [playerData, setPlayerData] = useState(null);

    return ( 
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
            {/* Lightning as background */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
                <Lightning
                    hue={220}
                    xOffset={1.2}
                    speed={0.5}
                    intensity={0.1}
                    size={3}
                />
            </div>

            {/* Main content */}
            <Navbar />
            <br />
            <Toaster />
            <ChessGame playerData={playerData} />
        </div>
    );
}
 
export default PlayWithEngine;