import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isMedia = (filename: string) =>
  /\.(gif|jpe?g|png|webp|svg)$/i.test(filename);
