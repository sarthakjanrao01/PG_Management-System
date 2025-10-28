import React from "react";

interface AvtarProps {
  name: string;
}

const Avtar: React.FC<AvtarProps> = ({ name }) => {
  return (
    <div className="h-9 cursor-pointer w-9 rounded-full items-center justify-center font-semibold flex bg-blue-500 text-white">
      {`${name.charAt(0).toUpperCase()}`}
    </div>
  );
};

export default Avtar;