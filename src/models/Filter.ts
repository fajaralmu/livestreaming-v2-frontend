
export default class Filter{
	limit?:number;
	page?:number;
	orderType?:string;
	orderBy?:string;
	contains?:boolean;
	exacts?:boolean;
	day?:number;
	year?:number;
	month?:number;
	fieldsFilter?:{};
	availabilityCheck?:Boolean;
	dayTo?:number;
	monthTo?:number;
	yearTo?:number;
	maxValue?:number;
	useExistingFilterPage?:boolean;

}
