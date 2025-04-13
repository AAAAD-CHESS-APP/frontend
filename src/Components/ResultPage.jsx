import React from "react";
import Result from "./Result";
import { useParams } from "react-router-dom";

const ResultPage = () => {
    const { roomId } = useParams();
  return (
    <div className="absolute inset-0 w-full backdrop-blur-sm bg-black">
      <div className="flex items-center justify-center h-full">
        <div className="bg-black p-6">
          <Result roomId={roomId} />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;