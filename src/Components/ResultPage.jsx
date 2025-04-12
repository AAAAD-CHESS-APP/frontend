import React from "react";
import Result from "./Result";
import { useParams } from "react-router-dom";

const ResultPage = () => {
    const { roomId } = useParams();
  return (
    <div className="absolute inset-0 w-full backdrop-blur-sm bg-white">
      <div className="flex items-center justify-center h-full">
        <div className="bg-white p-6">
          <Result roomId={roomId} />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;