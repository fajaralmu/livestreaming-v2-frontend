
import UserService from './UserService'; 
import MasterDataService from './MasterDataService'; 
export default class Services {
    userService: UserService = UserService.getInstance();
    masterDataService: MasterDataService = MasterDataService.getInstance(); 
}