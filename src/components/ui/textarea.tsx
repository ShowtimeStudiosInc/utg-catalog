import * as React from "react"
import { cn } from "cn"
import { EmojiTextInserter } from "@/components/emoji-text-inserter"

function Textarea({ className, ref: forwardedRef, ...props }: React.ComponentProps<"textarea">) {
  const controlRef = React.useRef<HTMLTextAreaElement>(null)
  const setRef = React.useCallback((element: HTMLTextAreaElement | null) => {
    controlRef.current = element
    if (typeof forwardedRef === "function") forwardedRef(element)
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = element
  }, [forwardedRef])

  return (
    <span className="emoji-textarea-wrapper">
      <textarea
        ref={setRef}
        data-slot="textarea"
        className={cn(
          "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className
        )}
        {...props}
      />
      <EmojiTextInserter controlRef={controlRef} />
    </span>
  )
}

export { Textarea }
