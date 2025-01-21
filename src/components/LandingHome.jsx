import React from "react";

export default function LandingHome() {
  return (
    <div className="flex flex-row items-center justify-center h-screen w-full bg-[#1a1a1a] text-white">
      <div className="w-1/2">
        <img
          src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/CHESScom/phphK5JVu.png"
          alt=""
          className="w-[90%] pt-[13%] p-[8%]"
        />
      </div>
      <div className="w-1/2 flex flex-col items-center justify-evenly">
        <button className="capitalize text-3xl bg-[#333333] rounded-md text-center m-4 p-7 w-72">
          play with bot
        </button>
        <button className="capitalize text-3xl bg-[#333333] rounded-md text-center m-4 p-7 w-72">
          play with friend
        </button>
        <button className="capitalize text-3xl bg-[#333333] rounded-md text-center m-4 p-7 w-72">
          play online
        </button>
      </div>
    </div>
  );
}
