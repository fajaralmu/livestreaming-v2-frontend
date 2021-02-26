import { base64StringFileSize } from './StringUtil';
import { ChangeEvent } from 'react';
export const byId = (id) => { return document.getElementById(id) }
 
export function toBase64(file, referer, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file.files[0]);
    reader.onload = () => callback(reader.result, referer);
    reader.onerror = error => {
        alert("Error Loading File");
    }
}
 
export const getHtmlInputElement = (e:ChangeEvent) : HTMLInputElement => {
    const target = e.target as HTMLInputElement;
    return target;
}

export const toBase64v2 = (fileInput): Promise<string> => {
    return new Promise<string>((resolve, reject) =>{
        try {
            const reader = new FileReader();
            reader.readAsDataURL(fileInput.files[0]);
            console.debug("fileInput.files[0]: ", fileInput.files[0]);
            reader.onload = function () { resolve(new String(reader.result).toString()); }
            reader.onerror = function (error) {
                reject(error);
            }
        } catch (e) {
            reject(e);
        }
    });

}

export const resizeImage = (data:string, ratio:number, extension:string) => {
    const actualFilesize = base64StringFileSize(data);
    console.debug("Actual filesize: ", actualFilesize);
    return new Promise<string>(function(resolve, reject){
        const img = new Image();
        img.src = data;
        img.onload = function () {
            const width = img.width   * ratio;
            const height = img.height   * ratio;
            // create an off-screen canvas
            var canvas:HTMLCanvasElement = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            // set its dimension to target size
            canvas.width = width;
            canvas.height = height;
            var mime_type = "image/"+extension;
            // draw source image into the off-screen canvas:
            ctx.drawImage(img, 0, 0, width, height);
            console.debug("Resize ratio: ", ratio, "mime_type: ",mime_type);
            // encode image to data-uri with base64 version of compressed image
            const dataURL = (canvas.toDataURL());
            console.debug("Resized filesize: ", base64StringFileSize(dataURL));
            resolve(dataURL);
        }
    });
}

export function toBase64FromFile(file) {
    return new Promise(function (resolve, reject) {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () { resolve(reader.result); }
            reader.onerror = function (error) {
                reject(error);
            }
        } catch (e) {
            reject(e);
        }
    });

}


export const checkExistance = function (...ids) {
    for (let i = 0; i < ids.length; i++) {
        if (byId(ids[i]) == null) {
            console.log("component with id:", ids[i], "does not exist");
            return false;
        }
    }
    return true;
}

/**
 * 
 * @param {Number} totalButton 
 * @param {Number} currentPage 
 */
export const createNavButtons = (totalButton, currentPage) => {
    totalButton = Math.ceil(totalButton);
    if (!currentPage) { currentPage = 0 }
    let buttonData = new Array();
    let min = currentPage - 3 < 0 ? 0 : currentPage - 3;
    let max = currentPage + 3 > totalButton ? totalButton : currentPage + 3;

    if (min != 0) {
        buttonData.push({
            text: 1,
            value: 0
        });
    }

    for (let index = min; index < max; index++) {
        buttonData.push({
            text: index + 1,
            value: index
        });
    }

    if (max != totalButton) {
        buttonData.push({
            text: totalButton,
            value: totalButton - 1
        });
    }


    return buttonData;
}


export const getDropdownOptionsMonth = () => {
    let options:any[] = [];
    for (let i = 1; i <= 12; i++) {
        options.push({ value: i, text: i });
    }
    return options;
}
export const getDropdownOptionsYear = (from, to) => {
    let options:any[] = [];
    for (let i = from; i <= to; i++) {
        options.push({ value: i, text: i });
    }
    return options;
}