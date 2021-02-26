import { join } from "path";

export const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

const leapMonths = [ 31, (  29  ), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
const regularMonths = [ 31, (  28  ), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
/**
 * 
 * @param {Number} month starts at 0
 */
export const getMonthDays = (month:number) : number=> {
    if(new Date().getFullYear() % 4 == 0){
        return leapMonths[month];
    }
    return regularMonths[month];
}
 
export const getCurrentMMYY = () => {
    return [new Date().getMonth() + 1, new Date().getFullYear()];
}

export const getInputReadableDate = (date:Date) :string => {
    const year = date.getFullYear();

    const arr = [year, twoDigits(date.getMonth()+1), twoDigits(date.getDate())];
    return arr.join("-");
}
export function addDays(date:Date, days:number) :Date{
    const result:Date = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  export const getDiffDays = (a:Date, b:Date) : number => {
    // Discard the time and time-zone information.

    console.debug("DIFF DATE ",a," vs ", b);
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()); 
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
const twoDigits = (value:number) :string => {
    if (value >= 10) {
        return   value.toString();
    }
    return "0"+value;
}

export const timerString = (inputSeconds:number ) => {
    let hour = 0;
    let minutes:number = 0;
    let seconds = 0;
    let totalSeconds = inputSeconds;
    if (totalSeconds >= 3600) {
        hour = totalSeconds/ 3600;
        totalSeconds = totalSeconds % 3600;
    }
    if (totalSeconds >= 60) {
        minutes = totalSeconds/60;
        totalSeconds = totalSeconds%60;
    }
    seconds = totalSeconds; 

    return  twoDigits(hour)+":"+twoDigits(Math.floor(minutes))+":"+twoDigits(seconds);
}



