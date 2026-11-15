import type { Metadata } from "next";
import HomeContent from "./HomeContent";

export const metadata: Metadata = { title: "صفحه اصلی" };

export default function HomePage() {
  return <HomeContent />;
}
