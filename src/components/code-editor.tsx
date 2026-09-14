"use client";

import { useMemo } from "react";
import CodeMirror, { EditorView, type Extension } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { useNonce } from "@/components/nonce";
import { cn } from "@/lib/utils";

export type EditorLanguage = "python" | "javascript";

/**
 * CodeMirror wrapper. Styles are injected with the request's CSP nonce so the
 * editor works under the strict style-src policy.
 */
export function CodeEditor({
  value,
  onChange,
  language,
  className,
  readOnly,
  ariaLabel = "Code editor",
  minHeight = "16rem",
}: {
  value: string;
  onChange: (value: string) => void;
  language: EditorLanguage;
  className?: string;
  readOnly?: boolean;
  ariaLabel?: string;
  minHeight?: string;
}) {
  const nonce = useNonce();
  const extensions = useMemo<Extension[]>(() => {
    const list: Extension[] = [
      language === "python" ? python() : javascript(),
      EditorView.lineWrapping,
      // The editable surface is a contenteditable div; give it the accessible name directly.
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
    ];
    if (nonce) list.push(EditorView.cspNonce.of(nonce));
    return list;
  }, [language, nonce, ariaLabel]);

  return (
    <div className={cn("overflow-hidden rounded-lg border border-line-strong bg-surface", className)}>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        readOnly={readOnly}
        minHeight={minHeight}
        theme="none"
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, autocompletion: false, tabSize: language === "python" ? 4 : 2 }}
        indentWithTab
      />
    </div>
  );
}
