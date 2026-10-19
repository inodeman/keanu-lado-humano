import { createFileRoute } from "@tanstack/react-router";
import { DocApp } from "@/components/doc-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <DocApp />;
}
