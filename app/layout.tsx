import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Structured Logs Viewer",
    description: "A modern web-based log viewer for analyzing structured application logs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        {children}
        </body>
        </html>
    );
}
