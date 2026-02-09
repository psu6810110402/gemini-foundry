"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "./Mermaid";
import { ComponentPropsWithoutRef } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none break-words 
        prose-headings:text-slate-800 dark:prose-headings:text-slate-100
        prose-p:text-slate-600 dark:prose-p:text-slate-300
        prose-strong:text-purple-700 dark:prose-strong:text-purple-400
        prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded
        prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950
        prose-table:border-collapse
        prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-2 prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-700
        prose-td:p-2 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700
        ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(
            props: ComponentPropsWithoutRef<"code"> & { className?: string },
          ) {
            const { className: codeClassName, children, ...rest } = props;
            const match = /language-(\w+)/.exec(codeClassName || "");
            const isMermaid = match && match[1] === "mermaid";

            if (isMermaid) {
              return <Mermaid chart={String(children).replace(/\n$/, "")} />;
            }

            // Inline code
            if (!match) {
              return (
                <code className={codeClassName} {...rest}>
                  {children}
                </code>
              );
            }

            // Code block
            return (
              <code
                className={`${codeClassName} block overflow-x-auto`}
                {...rest}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
