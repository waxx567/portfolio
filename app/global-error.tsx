"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/**
 * The global error page component.
 *
 * This component is responsible for rendering the error page for all app routes.
 * It receives an `error` prop with an `Error` object that contains information
 * about the error that occurred.
 *
 * The component uses the `useEffect` hook to capture the error with Sentry.
 * The `digest` property of the error object can be used to identify the error
 * in Sentry.
 *
 * The component returns a JSX element representing the error page. The page
 * renders a generic error message using the `NextError` component from Next.js.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}