import { useEffect } from "react";

/**
 * Calls `handler` when a click occurs outside the element referenced by `ref`.
 * Attach `ref` to the component's outermost wrapper.
 */
export default function useClickOutside(ref, handler) {
  useEffect(() => {
    function onMouseDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [ref, handler]);
}
