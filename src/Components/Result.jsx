import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Result({roomId}){
    const [roomData,setRoomData] = useState({});
    const navigate = useNavigate();
    async function getRoomResultData(){
        try{
            const response = await axios.get(`http://localhost:8080/api/game/${roomId}`);
            setRoomData(response.data);
            console.log(response.data);
        }catch(err){
            console.log(err);
        }
    }

    useEffect(()=>{
        getRoomResultData();
    },[])
    return (
    <div className=" bg-white break-words">
      <div className="w-full text-center text-2xl font-bold mb-1">
        {roomData.result}
       </div>
       <div className="flex flex-row w-[300px] h-[300px] justify-center items-center">
            <div className="bg-white h-full p-2 w-1/2 flex flex-col items-center justify-center text-black relative">
                <div>{roomData.whiteName}</div>
            <div>
             {roomData.UpdatedWhiteElo} 
             {roomData.UpdatedWhiteElo - roomData.prevWhiteElo >= 0 
            ? ` (+${roomData.UpdatedWhiteElo - roomData.prevWhiteElo})` : ` (${roomData.UpdatedWhiteElo - roomData.prevWhiteElo})`}
            </div>
            <button className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded" onClick={()=>navigate('/home')}>Home</button>
        </div>
  
        <div className="bg-black text-white h-full p-2 w-1/2 flex flex-col items-center justify-center relative">
            <div>{roomData.blackName}</div>
            <div> {roomData.UpdatedBlackElo} 
                {roomData.UpdatedBlackElo - roomData.prevBlackElo >= 0 ? ` (+${roomData.UpdatedBlackElo - roomData.prevBlackElo})` : ` (${roomData.UpdatedBlackElo - roomData.prevBlackElo})`}
            </div>
            <button className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-white text-black px-2 py-2 rounded whitespace-nowrap" onClick={()=>navigate("/game")}>New Game</button>
        </div>
    </div>
</div>
 )
}
export default Result;