import { AppShell } from "@/components/AppShell";
import { loadRules } from "@/lib/rules/loadRules";

export default async function Home() {
  const { preamble, sections } = await loadRules();

  return <AppShell preamble={preamble} sections={sections} />;
}
