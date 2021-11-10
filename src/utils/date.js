import {intlFormat, parseISO} from "date-fns";

export const formatFullDate = (dateAsString) => {
    return intlFormat(parseISO(dateAsString), {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export const formatHours = (dateAsString) => {
    return intlFormat(parseISO(dateAsString), {
        hour: 'numeric',
        minute: 'numeric'
    })
}

export const toDate = (dateAsString) => {
    return parseISO(dateAsString)
}