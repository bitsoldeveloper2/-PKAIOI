"use client";

import { startTransition, type ComponentProps } from "react";

type FormProps = ComponentProps<"form">;
type SubmitHandler = NonNullable<FormProps["onSubmit"]>;
type SubmitEventArg = Parameters<SubmitHandler>[0];

/**
 * A form wired to a `useActionState` dispatcher that keeps what the user typed
 * when the action fails. React resets uncontrolled fields after a `<form action>`
 * completes, which wipes a half-filled form on every validation error; submitting
 * through `onSubmit` inside a transition keeps the pending state and server-side
 * validation without that reset. Actions that navigate or swap the form on
 * success behave exactly as before.
 */
export function ActionForm({
  action,
  onSubmit,
  ...props
}: Omit<FormProps, "action"> & { action: (formData: FormData) => void }) {
  return (
    <form
      {...props}
      onSubmit={(event: SubmitEventArg) => {
        onSubmit?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // Keep the submitting button's name/value, as a native submission would.
        const submitter = (event.nativeEvent as globalThis.SubmitEvent).submitter;
        if (submitter instanceof HTMLButtonElement && submitter.name) data.append(submitter.name, submitter.value);
        startTransition(() => action(data));
      }}
    />
  );
}
