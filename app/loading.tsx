// loading.tsx

import React from "react";

/**
 * 로딩 스피너 컴포넌트입니다.
 * @returns {JSX.Element} 로딩 스피너를 표시하는 JSX 요소입니다.
 */
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen relative">
    <svg
      className="w-16 h-16 text-blue-500 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0a10 10 0 00-10 10h2z"
      ></path>
    </svg>
  </div>
);

export default Loading;
