import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"
import { EmojiTextInserter } from "@/components/emoji-text-inserter"

function Input({ className, type, ref: forwardedRef, ...props }: React.ComponentProps<"input">) {
  const controlRef = React.useRef<HTMLInputElement>(null)
  const setRef = React.useCallback((element: HTMLInputElement | null) => {
    controlRef.current = element
    if (typeof forwardedRef === "function") forwardedRef(element)
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = element
  }, [forwardedRef])
  const classNames = cn(
    "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    className
  )
  const input = <InputPrimitive ref={setRef} type={type} data-slot="input" className={classNames} {...props} />
  const supportsEmoji = !type || ["text", "search", "email", "url", "tel"].includes(type)

  if (!supportsEmoji) return input
  return (
    <span className="emoji-input-wrapper">
      {input}
      <EmojiTextInserter controlRef={controlRef} />
    </span>
  )
}

export { Input }
