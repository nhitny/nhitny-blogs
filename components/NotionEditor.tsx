"use client";

import { useEffect, useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface NotionEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function NotionEditor({
    value,
    onChange,
    placeholder = "Nhấn '/' để xem lệnh, hoặc bắt đầu viết...",
}: NotionEditorProps) {
    // Create editor instance
    const editor = useCreateBlockNote({
        initialContent: value
            ? JSON.parse(value)
            : [
                {
                    type: "paragraph",
                    content: "",
                },
            ],
    });

    // Update content when editor changes
    useEffect(() => {
        const handleUpdate = async () => {
            const blocks = editor.document;
            const html = await editor.blocksToHTMLLossy(blocks);
            onChange(html);
        };

        // Listen to editor changes
        editor.onChange(handleUpdate);
    }, [editor, onChange]);

    // Load initial content
    useEffect(() => {
        if (value && value !== "") {
            try {
                const blocks = JSON.parse(value);
                editor.replaceBlocks(editor.document, blocks);
            } catch (e) {
                // If value is HTML, keep it as is
                console.log("Content is HTML, not JSON blocks");
            }
        }
    }, []);

    return (
        <div className="notion-editor-wrapper border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
            <BlockNoteView
                editor={editor}
                theme="light"
                className="min-h-[500px]"
                data-theming-css-variables-demo
            />

            {/* Helper Text */}
            <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">💡 Tips:</span>
                <span>
                    Nhấn <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">/</kbd> để xem tất cả lệnh,
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-2">/math</kbd> để thêm công thức toán,
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-2">/table</kbd> để tạo bảng
                </span>
            </div>
        </div>
    );
}
