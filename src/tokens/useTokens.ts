import { useContext } from "react";
import { TokenContext, type TokenCtx } from "./context.ts";

export function useTokens(): TokenCtx {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error("useTokens outside TokenProvider");
  return ctx;
}
