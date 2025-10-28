import React from "react";
import Loader from "react-js-loader";

interface LoadingProps {
  size?: number | string;
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 50, color = "#3498db" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader
        type="bubble-top"
        bgColor={color}
        color={color}
        size={size}
      />
    </div>
  );
};

export default Loading;