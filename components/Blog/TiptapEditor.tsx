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
import Mathematics from "@tiptap/extension-mathematics";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useEffect, useState } from "react";
import "katex/dist/katex.min.css";
// Import both light and dark themes for syntax highlighting
import "highlight.js/styles/github.css"; // Light mode
import "highlight.js/styles/github-dark.css"; // Dark mode

// Import highlight.js languages
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml'; // for HTML
import json from 'highlight.js/lib/languages/json';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';

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
    AiOutlineFunction,
} from "react-icons/ai";
import { BsTypeH1, BsTypeH2, BsTypeH3, BsQuote, BsCode } from "react-icons/bs";
import { MdFormatClear, MdHorizontalRule, MdCheckBox } from "react-icons/md";
import { BiUndo, BiRedo } from "react-icons/bi";

// Create lowlight instance and register languages
const lowlight = createLowlight(common);

lowlight.register('python', python);
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('bash', bash);
lowlight.register('css', css);
lowlight.register('html', xml);
lowlight.register('xml', xml);
lowlight.register('json', json);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('c', c);
lowlight.register('csharp', csharp);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('sql', sql);
lowlight.register('markdown', markdown);
lowlight.register('yaml', yaml);

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
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                codeBlock: false, // Disable default code block
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: "hljs rounded-lg p-4 my-4 overflow-x-auto bg-gray-900 text-gray-100",
                },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Link.configure({
                openOnClick: false,
                autolink: true, // Auto-detect URLs
                HTMLAttributes: {
                    class: "text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400",
                },
            }),
            Image.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg my-4 mx-auto block",
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
            Mathematics,
        ],
        content: value,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-b-lg border border-t-0 border-gray-300 dark:border-gray-700",
            },
            // Handle paste to auto-convert image URLs
            handlePaste: (view, event) => {
                const text = event.clipboardData?.getData("text/plain");
                if (text && isImageUrl(text)) {
                    event.preventDefault();
                    editor?.chain().focus().setImage({ src: text }).run();
                    return true;
                }
                return false;
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

    // Close language selector when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showLanguageSelector) {
                const target = event.target as HTMLElement;
                if (!target.closest('.relative')) {
                    setShowLanguageSelector(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLanguageSelector]);

    if (!editor) {
        return <div className="text-gray-400 p-4">Đang tải editor...</div>;
    }

    // Check if URL is an image
    const isImageUrl = (url: string): boolean => {
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(url);
    };

    const addLink = () => {
        const url = window.prompt("Nhập URL:");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt("Nhập URL ảnh (hoặc paste trực tiếp vào editor):");
        if (url) {
            // Insert image with figure wrapper for auto-numbering
            const figureHtml = `
        <figure class="image-figure">
          <img src="${url}" alt="Image" />
          <figcaption contenteditable="true" class="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Nhấn để thêm mô tả ảnh...
          </figcaption>
        </figure>
      `;
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addMath = () => {
        const latex = window.prompt("Nhập công thức LaTeX (ví dụ: E = mc^2):");
        if (latex) {
            // Insert inline math
            const mathHtml = `<span class="math-inline">$${latex}$</span>`;
            editor.chain().focus().insertContent(mathHtml).run();
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
            className={`group relative p-2.5 rounded-lg transition-all ${active
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {children}
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                {title}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></span>
            </span>
        </button>
    );

    return (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-visible shadow-lg">
            {/* Sticky Toolbar - Always visible */}
            <div className="sticky top-0 z-[999] bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-300 dark:border-gray-700 p-3 flex flex-wrap gap-1.5 shadow-lg backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
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
                        title="In đậm (Ctrl+B)"
                    >
                        <FiBold className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive("italic")}
                        title="In nghiêng (Ctrl+I)"
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
                        title="Mã code inline"
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
                        title="Tiêu đề 1"
                    >
                        <BsTypeH1 className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive("heading", { level: 2 })}
                        title="Tiêu đề 2"
                    >
                        <BsTypeH2 className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={editor.isActive("heading", { level: 3 })}
                        title="Tiêu đề 3"
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
                        title="Danh sách dấu đầu dòng"
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
                        title="Căn đều hai bên"
                    >
                        <FiAlignJustify className="h-5 w-5" />
                    </ToolbarButton>
                </div>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Insert */}
                <div className="flex gap-1">
                    <ToolbarButton onClick={addLink} title="Chèn liên kết">
                        <FiLink className="h-5 w-5" />
                    </ToolbarButton>
                    <ToolbarButton onClick={addImage} title="Chèn hình ảnh (hoặc paste URL)">
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
                    {/* Code Block with Language Selector */}
                    <div className="relative">
                        <ToolbarButton
                            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                            active={editor.isActive("codeBlock")}
                            title="Khối mã code (chọn ngôn ngữ)"
                        >
                            <BsCode className="h-5 w-5" />
                        </ToolbarButton>
                        {showLanguageSelector && (
                            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-[1000] min-w-[180px] max-h-[300px] overflow-y-auto">
                                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Chọn ngôn ngữ:
                                    </p>
                                </div>
                                {[
                                    { label: "Plain Text", value: null },
                                    { label: "Python", value: "python" },
                                    { label: "JavaScript", value: "javascript" },
                                    { label: "TypeScript", value: "typescript" },
                                    { label: "Bash/Shell", value: "bash" },
                                    { label: "HTML", value: "html" },
                                    { label: "CSS", value: "css" },
                                    { label: "JSON", value: "json" },
                                    { label: "Java", value: "java" },
                                    { label: "C++", value: "cpp" },
                                    { label: "C", value: "c" },
                                    { label: "C#", value: "csharp" },
                                    { label: "PHP", value: "php" },
                                    { label: "Ruby", value: "ruby" },
                                    { label: "Go", value: "go" },
                                    { label: "Rust", value: "rust" },
                                    { label: "SQL", value: "sql" },
                                    { label: "Markdown", value: "markdown" },
                                    { label: "YAML", value: "yaml" },
                                    { label: "XML", value: "xml" },
                                ].map((lang) => (
                                    <button
                                        key={lang.value || "plain"}
                                        type="button"
                                        onClick={() => {
                                            if (lang.value) {
                                                editor
                                                    .chain()
                                                    .focus()
                                                    .toggleCodeBlock({ language: lang.value })
                                                    .run();
                                            } else {
                                                editor
                                                    .chain()
                                                    .focus()
                                                    .toggleCodeBlock()
                                                    .run();
                                            }
                                            setShowLanguageSelector(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <ToolbarButton onClick={addMath} title="Chèn công thức toán (LaTeX)">
                        <AiOutlineFunction className="h-5 w-5" />
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
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-2">Ctrl+I</kbd> Nghiêng.
                    Paste URL ảnh trực tiếp vào editor để chèn ảnh nhanh! 🖼️
                </span>
            </div>

            {/* CSS for auto-numbering images and code highlighting */}
            <style jsx global>{`
        .ProseMirror {
          counter-reset: figure-counter;
        }
        
        .ProseMirror img {
          counter-increment: figure-counter;
        }
        
        .ProseMirror img::after {
          content: "Hình " counter(figure-counter);
          display: block;
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        /* Code block styling - Light Mode */
        .ProseMirror pre {
          background: #f6f8fa !important;
          color: #24292f !important;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', Courier, monospace;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          overflow-x: auto !important;
          margin: 1rem 0 !important;
          border: 1px solid #d0d7de !important;
        }

        .ProseMirror pre code {
          background: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          font-size: 0.875rem !important;
          line-height: 1.6 !important;
        }

        /* Code block styling - Dark Mode */
        .dark .ProseMirror pre {
          background: #161b22 !important;
          color: #c9d1d9 !important;
          border: 1px solid #30363d !important;
        }

        /* Ensure highlight.js classes work */
        .ProseMirror .hljs {
          display: block;
          overflow-x: auto;
          padding: 0;
          background: transparent !important;
        }

        /* Override highlight.js colors for better Gemini-like appearance */
        /* Light mode syntax colors */
        .ProseMirror .hljs-keyword,
        .ProseMirror .hljs-selector-tag,
        .ProseMirror .hljs-literal,
        .ProseMirror .hljs-section,
        .ProseMirror .hljs-link {
          color: #a626a4 !important; /* Purple for keywords */
        }

        .ProseMirror .hljs-string,
        .ProseMirror .hljs-attr {
          color: #50a14f !important; /* Green for strings */
        }

        .ProseMirror .hljs-number,
        .ProseMirror .hljs-regexp {
          color: #986801 !important; /* Orange for numbers */
        }

        .ProseMirror .hljs-built_in,
        .ProseMirror .hljs-builtin-name {
          color: #4078f2 !important; /* Blue for built-ins */
        }

        .ProseMirror .hljs-comment {
          color: #6a737d !important; /* Gray for comments */
          font-style: italic;
        }

        /* Dark mode syntax colors */
        .dark .ProseMirror .hljs-keyword,
        .dark .ProseMirror .hljs-selector-tag,
        .dark .ProseMirror .hljs-literal,
        .dark .ProseMirror .hljs-section,
        .dark .ProseMirror .hljs-link {
          color: #c678dd !important; /* Purple for keywords */
        }

        .dark .ProseMirror .hljs-string,
        .dark .ProseMirror .hljs-attr {
          color: #98c379 !important; /* Green for strings */
        }

        .dark .ProseMirror .hljs-number,
        .dark .ProseMirror .hljs-regexp {
          color: #d19a66 !important; /* Orange for numbers */
        }

        .dark .ProseMirror .hljs-built_in,
        .dark .ProseMirror .hljs-builtin-name {
          color: #61afef !important; /* Blue for built-ins */
        }

        .dark .ProseMirror .hljs-comment {
          color: #7d8590 !important; /* Gray for comments */
          font-style: italic;
        }

        /* Language indicator */
        .ProseMirror pre[data-language]::before {
          content: attr(data-language);
          display: block;
          text-align: right;
          font-size: 0.75rem;
          color: #6a737d;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .dark .ProseMirror pre[data-language]::before {
          color: #8b949e;
        }
      `}</style>
        </div>
    );
}
