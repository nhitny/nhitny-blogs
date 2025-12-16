"use client";

import { useEffect, useRef } from "react";
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
  const isComposing = useRef(false);

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

  // 🔹 Nạp giá trị ban đầu & Sync từ Props -> Editor
  // Fix: Chỉ update nếu nội dung THỰC SỰ khác biệt để tránh reset con trỏ khi đang gõ
  useEffect(() => {
    if (quill && value !== undefined) {
      if (quill.root.innerHTML !== value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }
    }
  }, [quill, value]);

  // 🔹 Theo dõi trạng thái gõ tiếng Việt (IME)
  useEffect(() => {
    if (!quill) return;

    const root = quill.root;
    const onCompositionStart = () => { isComposing.current = true; };
    const onCompositionEnd = () => {
      isComposing.current = false;
      // Trigger update ngay sau khi gõ xong cụm từ
      onChange(quill.root.innerHTML);
    };

    root.addEventListener("compositionstart", onCompositionStart);
    root.addEventListener("compositionend", onCompositionEnd);

    return () => {
      root.removeEventListener("compositionstart", onCompositionStart);
      root.removeEventListener("compositionend", onCompositionEnd);
    };
  }, [quill, onChange]);

  // 🔹 Lắng nghe thay đổi text trong nội bộ editor
  useEffect(() => {
    if (!quill) return;

    // delta, oldDelta, source
    const handler = (_delta: any, _oldDelta: any, source: string) => {
      // Chỉ emit change nếu user đang nhập liệu và không đang trong quá trình composition
      // HOẶC nếu source === 'user' (để tránh loop khi pasteHTML từ code)
      if (source === "user" && !isComposing.current) {
        onChange(quill.root.innerHTML);
      }
    };

    quill.on("text-change", handler);
    return () => { quill.off("text-change", handler); };
  }, [quill, onChange]);

  // 🔹 Expose quill instance (cần cho upload ảnh ở trang cha)
  useEffect(() => {
    if (quill && onReady) onReady(quill);
  }, [quill, onReady]);

  return (
    <div
      ref={quillRef}
      className="rich-text-wrapper bg-white dark:bg-gray-800"
      style={{
        direction: "ltr",
        textAlign: "left",
      }}
    />
  );
}
