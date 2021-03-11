
import UserService from './UserService'; 
import MasterDataService from './MasterDataService'; 
import PublicConferenceService from './PublicConferenceService';
import WebSocketService from './WebSocketService';
export default class Services {
    userService: UserService = UserService.getInstance();
    masterDataService: MasterDataService = MasterDataService.getInstance(); 
    publicConferenceService:PublicConferenceService = PublicConferenceService.getInstance();
    websocketService:WebSocketService =  WebSocketService.getInstance();
}