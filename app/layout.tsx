import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Clearance / Northstar Advisory", description: "Client-bound agents. Independently built software." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
