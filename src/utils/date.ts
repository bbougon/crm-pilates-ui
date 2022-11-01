import { intlFormat, parseISO } from "date-fns";

export const formatFullDate = (dateAsString: string): string => {
  return intlFormat(parseISO(dateAsString), {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

export const formatHours = (dateAsString: string): string => {
  return intlFormat(parseISO(dateAsString), {
    hour: "numeric",
    minute: "numeric",
  });
};
