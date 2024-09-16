import { useState, useEffect } from "react";
import Icon from "react-icons-kit";
import { x } from 'react-icons-kit/feather/x';

export default function Notification({ message, onClose }) {
  if (!message) return null;

  return (
    <div className=" w-full max-w-xl bg-blue-500 text-white px-3 ml-32 rounded-xl shadow-lg flex justify-between items-center z-50">
      <p className="text-sm">{message}</p>
      <button onClick={onClose} className="ml-4 mb-1">
        <Icon icon={x} size={14} />
      </button>
    </div>
  );
}
