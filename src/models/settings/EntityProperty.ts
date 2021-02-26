
import EntityElement from "./EntityElement";
import { FieldType } from "../FieldType";
import HeaderProps from '../HeaderProps'; 

export default class EntityProperty{
	groupNames?:string;
	entityName?:string;
	alias?:string;
	fieldNames?:string;
	idField?:string;
	detailFieldName?:string; 
	formInputColumn?:number;
	editable:boolean = true;
	creatable:boolean = true; 
	elements:EntityElement[] = new Array();
	fieldNameList?:string[]; 
	withProgressWhenUpdated:boolean = false;

	static getEntityElement = (prop: EntityProperty, id:string) :EntityElement|undefined => {
		for (let i = 0; i < prop.elements.length; i++) {
			const element = prop.elements[i];
			if (element.id == id) {
				return element;
			}
		}
		return undefined;
	}

	static getHeaderLabels = (prop:EntityProperty) : HeaderProps[] => {
		const result:HeaderProps[] = new Array();
		if (prop.elements == undefined) {
			return result;
		}
		const elements:EntityElement[] = prop.elements;
		for (let i = 0; i < elements.length; i++) {
			
			const element = elements[i];
			const header:HeaderProps=  {
				label:element.labelName,
				value:element.id,
				isDate:element.type == 'date',
				filterable: element.filterable
			};
			result.push(header);
		}
		return result;
	}

	static getRecordId(record:any, prop:EntityProperty) {
		const elements = prop.elements;
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			if (element.identity) {
				return record[element.id];
			}
		}
		return null;
	}

	static hasTextEditorField = (elements:EntityElement[]) => {
		for (let i = 0; i < elements.length; i++) {
			if(elements[i].fieldType == FieldType.FIELD_TYPE_TEXTEDITOR) return true;
			
		}
		return false;
	}

}
