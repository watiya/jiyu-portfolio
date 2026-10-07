import { createContext } from "react";
import type { Lang } from "./lang.ts";
import type { UI } from "./ui.ts";

export type LangCtx = { lang: Lang; setLang: (l: Lang) => void; t: UI };
export const LangContext = createContext<LangCtx | null>(null);
