import type { LinksFunction } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Outlet,
  useRouteError,
  Scripts,
} from '@remix-run/react';
import type { PropsWithChildren } from 'react';

import stylesheet from '~/styles/index.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

function Document({
  children,
  title = 'Expenses Tracker for everyone',
}: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
      <LiveReload />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Document title={`${error.status} ${error.statusText}`}>
        <div className="text-red-500">
          <h1>
            {error.status} {error.statusText}
          </h1>
        </div>
      </Document>
    );
  }

  const errorMessage =
    error instanceof Error ? error.message : 'Unknown error';
  return (
    <Document title="Uh-oh!">
      <div className="text-red-500">
        <h1>App Error</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
