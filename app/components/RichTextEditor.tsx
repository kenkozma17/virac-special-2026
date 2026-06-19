"use client";

import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const modules = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

function normalizeHtml(value: string) {
  return value === "<p><br></p>" ? "" : value;
}

export default function RichTextEditor({ value, onChange, placeholder = "Write the story body..." }: RichTextEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    let isMounted = true;

    async function setupEditor() {
      const { default: Quill } = await import("quill");

      if (!isMounted || !hostRef.current || quillRef.current) {
        return;
      }

      const quill = new Quill(hostRef.current, {
        theme: "snow",
        modules,
        placeholder,
      });

      quillRef.current = quill;

      if (valueRef.current) {
        quill.root.innerHTML = valueRef.current;
      }

      quill.on("text-change", () => {
        onChangeRef.current(normalizeHtml(quill.root.innerHTML));
      });
    }

    setupEditor();

    return () => {
      isMounted = false;
      quillRef.current = null;
      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }
    };
  }, [placeholder]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) {
      return;
    }

    const nextValue = value || "";
    const currentValue = normalizeHtml(quill.root.innerHTML);

    if (currentValue !== nextValue) {
      quill.root.innerHTML = nextValue;
    }
  }, [value]);

  return <div ref={hostRef} />;
}
