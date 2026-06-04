"use client";

import { createContext, useContext } from "react";

export type BrandCtx = {
  id: string;
  accent: string;
  accentLight: string;
  buttonColor: string;
  name: string;
  role: string;
  headerTitle: string;
  logo?: string;
};

export const DEFAULT_BRAND: BrandCtx = {
  id: "woolworths",
  accent: "#30814C",
  accentLight: "#d1ead9",
  buttonColor: "#30814C",
  name: "Woolworths",
  role: "Team Member",
  headerTitle: "Team Member role with Woolworths Group",
};

export const BrandContext = createContext<BrandCtx>(DEFAULT_BRAND);
export const useBrand = () => useContext(BrandContext);
