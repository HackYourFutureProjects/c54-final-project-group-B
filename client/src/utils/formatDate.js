import { format, formatDistanceToNow } from "date-fns";

export const toTimeString = (date) => format(new Date(date), "HH:mm");
export const toDateString = (date) => format(new Date(date), "dd MMM yyyy");
export const toRelativeTime = (date) => formatDistanceToNow(new Date(date));
export const toLocaleDateTime = (date) => format(new Date(date), "PPp");
