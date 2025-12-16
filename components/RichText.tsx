"use client";

import { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

export type RichTextOnReady = (quill: any) => void;

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onReady?: RichTextOnReady;
};

export default function RichText({ value, onChange, placeholder, onReady }: Props) {
  const modules = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ["bold", "italic", "underline", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "code-block"],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const { quill, quillRef } = useQuill({ modules, placeholder });

  // nạp giá trị ban đầu
  useEffect(() => {
    if (quill && value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }
  }, [quill, value]);

  // lắng nghe thay đổi
  useEffect(() => {
    if (!quill) return;
    const handler = () => onChange(quill.root.innerHTML);
    quill.on("text-change", handler);
    return () => quill.off("text-change", handler);
  }, [quill, onChange]);

  // expose quill instance ra ngoài
  useEffect(() => {
    if (quill && onReady) onReady(quill);
  }, [quill, onReady]);

return (
  <div
    ref={quillRef}
    className="bg-white dark:bg-gray-800"
    style={{ direction: "ltr", textAlign: "left" }}
  />
);
}
