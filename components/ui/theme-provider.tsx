"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            // next-themes injects an inline <script> to apply the theme before paint.
            // React 19 warns about <script> tags rendered on the client, so the script
            // stays executable in the server HTML but is inert JSON on the client.
            scriptProps={{
                type: typeof window === "undefined" ? "text/javascript" : "application/json",
            }}
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}