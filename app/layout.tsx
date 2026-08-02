import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"ET Atlas｜外球与内球电子转移",description:"中文交互式 3D 配位化学教学网页"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
