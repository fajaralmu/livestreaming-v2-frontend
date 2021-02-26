
import ApplicationProfileModel from './../models/ApplicationProfileModel';
import { baseImageUrl } from './../constant/Url';
export const doItLater = (callback:()=>any, intervalMs:number) => {
    const timeout = setTimeout(()=>{
       callback();
        clearTimeout(timeout);
      }, intervalMs)
}


export const  updateFavicon = (profile: ApplicationProfileModel) => {
    if (profile.pageIcon) {
      let link = document.querySelector('link[rel="shortcut icon"]') ||
        document.querySelector('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.id = 'favicon';
        link.setAttribute("rel", 'shortcut icon');
        document.head.appendChild(link);
      }
      link.setAttribute("href", baseImageUrl() + profile.pageIcon);
    }
  }