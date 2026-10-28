import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex min-h-screen">
          <nav className="w-48 shrink-0 border-r border-gray-200 bg-gray-50 p-4">
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  to="/csharp"
                  className="block rounded px-3 py-2 hover:bg-gray-200"
                  activeProps={{ className: "bg-gray-200 font-semibold" }}
                >
                  C#
                </Link>
              </li>
              <li>
                <Link
                  to="/cpp"
                  className="block rounded px-3 py-2 hover:bg-gray-200"
                  activeProps={{ className: "bg-gray-200 font-semibold" }}
                >
                  C++
                </Link>
              </li>
              <li>
                <Link
                  to="/javascript"
                  className="block rounded px-3 py-2 hover:bg-gray-200"
                  activeProps={{ className: "bg-gray-200 font-semibold" }}
                >
                  JavaScript
                </Link>
              </li>
            </ul>
          </nav>
          <main className="flex-1">{children}</main>
        </div>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
