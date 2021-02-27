
import UserService from './UserService'; 
import MasterDataService from './MasterDataService'; 
import PublicConferenceService from './PublicConferenceService';
export default class Services {
    userService: UserService = UserService.getInstance();
    masterDataService: MasterDataService = MasterDataService.getInstance(); 
    publicConferenceService:PublicConferenceService = PublicConferenceService.getInstance();
}