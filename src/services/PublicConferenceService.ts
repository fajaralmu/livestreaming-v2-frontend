 
import { contextPath } from '../constant/Url';
import { commonAjaxPostCalls } from './Promises'; 
export default class PublicConferenceService {
    
    private static instance?: PublicConferenceService;

    static getInstance(): PublicConferenceService {
        if (this.instance == null) {
            this.instance = new PublicConferenceService();
        }
        return this.instance;
    }
    getRoom = () => { 
        const endpoint = contextPath().concat("api/member/conference/getroom")
        return commonAjaxPostCalls(endpoint, {});
    }
    generateRoom = () => { 
        const endpoint = contextPath().concat("api/member/conference/generateroom")
        return commonAjaxPostCalls(endpoint, {});
    }
   
    

}