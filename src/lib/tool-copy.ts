import { getCategory } from "@/lib/categories";
import type { FaqItem, Tool } from "@/lib/types";

export function toolTitle(tool: Tool) {
  return tool.name.replace(/ Calculator$/i, "");
}

export function toolHowTo(tool: Tool) {
  const group = getCategory(tool.category)?.name;
  return group
    ? `Fill in the fields above (or pick a file). The answer shows on this same page. More ${group.toLowerCase()} are linked below.`
    : "Fill in the fields above. The answer shows on this same page.";
}

export function defaultFaqs(tool: Tool): FaqItem[] {
  if (tool.faqs?.length) return tool.faqs;
  return [
    {
      question: `Do I pay for ${tool.name}?`,
      answer: "No. It's free. No account either.",
    },
    {
      question: "Do you save what I type?",
      answer:
        "Not for these tools. The work happens in your tab. If a tool ever needs a server, we'll say that on the page before you start.",
    },
    {
      question: "Does it work on a phone?",
      answer: "Yes, in a normal phone browser. Big files can be slow on a small device.",
    },
  ];
}
