import React from "react";

const LoaderCoconut = () => {
  return (
    <div>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="absolute size-[1.1vw] max-md:size-4 transition-all duration-300 scale-100 opacity-100"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    </div>
  );
};

export default LoaderCoconut;
