"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
    FiBold,
    FiItalic,
    FiUnderline,
    FiCode,
    FiList,
    FiImage,
    FiLink,
    FiAlignLeft,
    FiAlignCenter,
    FiAlignRight,
    FiAlignJustify,
} from "react-icons/fi";
import {
    AiOutlineOrderedList,
    AiOutlineStrikethrough,
    AiOutlineTable,
} from "react-icons/ai";
import { BsTypeH1, BsTypeH2, BsTypeH3, BsQuote } from "react-icons/bs";
import { MdFormatClear, MdHorizontalRule, MdCheckBox } from "react-icons/md";
import { BiUndo, BiRedo } from "react-icons/bi";

interface TiptapEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function TiptapEditor({
    value,
    onChange,
    placeholder = "Bắt đầu viết bài của bạn...",
}: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg my-4",
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: "border-collapse table-auto w-full my-4",
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: "border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-bold",
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: "border border-gray-300 dark:border-gray-600 px-4 py-2",
                },
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: "list-none pl-0",
                },
            }),
            TaskItem.configure({
                HTMLAttributes: {
                    class: "flex items-start gap-2",
                },
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-b-lg border border-t-0 border-gray-300 dark:border-gray-700",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return <div className="text-gray-400 p-4">Đang tải editor...</div>;
    }

    const addLink = () => {
        const url = window.prompt("Nhập URL:");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt("Nhập URL ảnh:");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const ToolbarButton = ({
        onClick,
        active,
        disabled,
        children,
        title,
    }: {
        onClick: () => void;
        active?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2.5 rounded-lg transition-all ${active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {children}
        </button>
    );

    return (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
            {/* Main Toolbar */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-300 dark:border-gray-700 p-3 flex flex-wrap gap-1.5">
                {/* Undo/Redo */}
                <div className="flex gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Hoàn tác (Ctrl+Z)"
                    >
                        <BiUndo className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Làm lại (Ctrl+Y)"
                    >
                        <BiRedo className="h-5 w-5" />
                    </ToolbarButton>
                </div>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Text Formatting */}
                <div className="flex gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive("bold")}
                        title="Đậm (Ctrl+B)"
                    >
                        <FiBold className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive("italic")}
                        title="Nghiêng (Ctrl+I)"
                    >
                        <FiItalic className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        active={editor.isActive("underline")}
                        title="Gạch chân (Ctrl+U)"
                    >
                        <FiUnderline className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        active={editor.isActive("strike")}
                        title="Gạch ngang"
                    >
                        <AiOutlineStrikethrough className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        active={editor.isActive("code")}
                        title="Code inline"
                    >
                        <FiCode className="h-5 w-5" />
                    </ToolbarButton>
                </div>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Headings */}
                <div className="flex gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={editor.isActive("heading", { level: 1 })}
                        title="Heading 1"
                    >
                        <BsTypeH1 className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive("heading", { level: 2 })}
                        title="Heading 2"
                    >
                        <BsTypeH2 className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={editor.isActive("heading", { level: 3 })}
                        title="Heading 3"
                    >
                        <BsTypeH3 className="h-5 w-5" />
                    </ToolbarButton>
                </div>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Lists */}
                <div className="flex gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive("bulletList")}
                        title="Danh sách gạch đầu dòng"
                    >
                        <FiList className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive("orderedList")}
                        title="Danh sách đánh số"
                    >
                        <AiOutlineOrderedList className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        active={editor.isActive("taskList")}
                        title="Danh sách checkbox"
                    >
                        <MdCheckBox className="h-5 w-5" />
                    </ToolbarButton>
                </div>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Alignment */}
                <div className="flex gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        active={editor.isActive({ textAlign: "left" })}
                        title="Căn trái"
                    >
                        <FiAlignLeft className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        active={editor.isActive({ textAlign: "center" })}
                        title="Căn giữa"
                    >
                        <FiAlignCenter className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        active={editor.isActive({ textAlign: "right" })}
                        title="Căn phải"
                    >
                        <FiAlignRight className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                        active={editor.isActive({ textAlign: "justify" })}
                        title="Căn đều"
                    >
                        <FiAlignJustify className="h-5 w-5" />
                    </ToolbarButton>
                </div>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Insert */}
                <div className="flex gap-1">
                    <ToolbarButton onClick={addLink} title="Chèn link">
                        <FiLink className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton onClick={addImage} title="Chèn ảnh">
                        <FiImage className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                .run()
                        }
                        title="Chèn bảng"
                    >
                        <AiOutlineTable className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={editor.isActive("blockquote")}
                        title="Trích dẫn"
                    >
                        <BsQuote className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Đường kẻ ngang"
                    >
                        <MdHorizontalRule className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        active={editor.isActive("codeBlock")}
                        title="Code block"
                    >
                        <FiCode className="h-6 w-6" />
                    </ToolbarButton>
                </div>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Clear Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    title="Xóa định dạng"
                >
                    <MdFormatClear className="h-5 w-5" />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Helper Text */}
            <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">💡 Tips:</span>
                <span>
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+B</kbd> Đậm,
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-2">Ctrl+I</kbd> Nghiêng,
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-2">Ctrl+Z</kbd> Hoàn tác
                </span>
            </div>
        </div>
    );
}
