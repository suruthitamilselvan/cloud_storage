import React from 'react';

export default function Logo({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cloud Outline */}
      <path
        d="M25 65 C12 65 5 52 10 38 C15 24 30 20 40 24 C45 10 65 8 78 18 C90 28 88 45 80 55 C92 55 95 70 85 80 C75 88 25 88 25 65 Z"
        fill="#EEF2FF"
        stroke="#1E3A8A"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Back Folder Tab */}
      <path
        d="M28 55 H52 L58 60 H72 C75 60 77 62 77 65 V82 C77 85 75 87 72 87 H28 C25 87 23 85 23 82 V65 C23 62 25 55 28 55 Z"
        fill="#F97316"
        stroke="#1E3A8A"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Front Folder Main Body */}
      <path
        d="M26 62 H74 C77 62 79 64 78 67 L72 87 C71 90 69 92 66 92 H30 C27 92 25 90 24 87 L18 67 C17 64 19 62 26 62 Z"
        fill="#FBBF24"
        stroke="#1E3A8A"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
