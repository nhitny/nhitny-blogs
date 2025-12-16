"use client";
import { VscInfo } from "react-icons/vsc";
import { HiOutlineEmojiHappy } from "react-icons/hi";

type AlertType = "success" | "error";
interface AlertProps { show: boolean; type: AlertType; message: string; }

export default function Alert({ show, type, message }: AlertProps) {
  if (!show) return null;
  const base = "fixed bottom-10 z-50 rounded-lg max-w-sm text-white font-medium inset-x-0 mx-auto";
  const color = type === "success" ? "bg-purple-500 dark:bg-purple-600" : "bg-red-500";
  return (
    <div className={`${base} ${color}`}>
      <div className="px-4 py-3 leading-normal flex items-center justify-center">
        <div className="flex justify-center">
          {type === "error" && <VscInfo className="text-xl" />}
          {type === "success" && <HiOutlineEmojiHappy className="text-xl" />}
        </div>
        <p className="ml-6 text-center">{message}</p>
      </div>
    </div>
  );
}
