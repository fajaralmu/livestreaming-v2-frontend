import { getAssetsPath } from "../middlewares/Common";

const devMode = 
    document.getElementById("rootPath").value == "${contextPath}" || 
    document.getElementById("rootPath").value == "";
const rootValue = devMode ?
     "/universal-good-shop/" : document.getElementById("rootPath").value+"/";

export const contextPath = function(){
    const contextPath = devMode? "http://localhost:8080".concat(rootValue):rootValue;
    //console.debug("contextPath: ",contextPath,document.getElementById("rootPath").value);
    return contextPath;
}

// export const baseImageUrl() = contextPath()+"assets/images/"; 
// export const baseImageUrl() = "https://developmentmode.000webhostapp.com/uploaded_storage/"; 
// export const baseImageUrl() = "http://localhost/storage/images/"; 
export const baseImageUrl = () => getAssetsPath()+ "images/"; 
// export const baseImageUrl() = contextPath()+"WebAsset/Shop1/Images/"; 

export const POST = "post";
