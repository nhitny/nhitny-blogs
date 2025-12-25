"use client";

import { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    isDanger = true,
}: ConfirmModalProps) {
    const [show, setShow] = useState(isOpen);

    useEffect(() => {
        setShow(isOpen);
    }, [isOpen]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all animate-in zoom-in-95 duration-200 dark:bg-gray-800"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${isDanger ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                        <FiAlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={onCancel}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        className={`rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDanger
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                            }`}
                        onClick={onConfirm}
                    >
                        {isDanger ? 'Xóa ngay' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
}
