/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export const errorMessage = (error: any): string => {
 try {
  if (error.response && error.response.data) {
    const { message } = error.response.data;
    if (message.includes("Internal server error")) {
      return "Oops!! something went wrong";
    }
    return message;
  }
  return "Oops!! something went wrong";
  
 } catch (error) {
  return "Oops!! something went wrong";
 }
};