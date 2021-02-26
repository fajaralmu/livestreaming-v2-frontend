
import { commonAuthorizedHeader, commonHeader } from '../middlewares/Common';
import WebResponse from '../models/WebResponse';
import { updateAccessToken } from './../middlewares/Common';
import AttachmentInfo from './../models/AttachmentInfo';

const axios = require('axios');

export const rejectedPromise = (message: any) => {
    return new Promise((res, rej) => {
        rej(message);
    });
}

export const emptyPromise = (defaultResponse: any) => new Promise(function (res, rej) {
    res(defaultResponse);
});

export const commonAjaxPostCalls = (endpoint: string, payload?: any) => {
    const request = payload == null ? {} : payload;
    return new Promise<WebResponse>(function (resolve, reject) {
        axios.post(endpoint, request, {
            headers: commonAuthorizedHeader()
        })
            .then(axiosResponse => {
                updateAccessToken(axiosResponse);
                const response: WebResponse = axiosResponse.data;
                response.rawAxiosResponse = axiosResponse;
                if (response.code == "00") {

                    resolve(response);
                }
                else { reject(response); }
            })
            .catch((e: any) => { 
                
                console.error(e); 
                reject(e); 
            });
    })
}


export const commonAjaxPublicPostCalls = (endpoint: string, payload?: any) => {
    const request = payload == null ? {} : payload;
    return new Promise<WebResponse>(function (resolve, reject) {
        axios.post(endpoint, request, {
            headers: commonHeader()
        })
            .then(axiosResponse => {
                
                const response: WebResponse = axiosResponse.data;
                response.rawAxiosResponse = axiosResponse;
                if (response.code == "00") {
                    resolve(response);
                }
                else { reject(response); }
            })
            .catch((e: any) => { 
                
                console.error(e); 
                reject(e); 
            });
    })
}


export const commonAjaxPostCallsWithBlob = (endpoint: string, payload?: any) => {
    const request = payload == null ? {} : payload;
    return new Promise<AttachmentInfo>(function (resolve, reject) {
        axios.post(endpoint, request, {
            responseType: 'blob' ,
            headers: commonAuthorizedHeader()
        })
            .then(axiosResponse => {
                updateAccessToken(axiosResponse);
                
                const response: any = axiosResponse.data;
                response.rawAxiosResponse = axiosResponse;
                console.debug("axiosResponse.headers: ", axiosResponse.headers);
                let contentDisposition = axiosResponse.headers["content-disposition"];
                let fileName = contentDisposition.split("filename=")[1];
                let rawSplit = fileName.split(".");
                let extension = rawSplit[rawSplit.length - 1];
                let blob = new Blob([response], { type: extension });
                let url = window.URL.createObjectURL(blob);
                // let a = document.createElement("a");

                // document.body.appendChild(a);

                // a.href = url;
                // a.style.display = 'none';
                // a.download = fileName;
                // a.click();

                // window.URL.revokeObjectURL(url);
                const attachmentInfo:AttachmentInfo = new AttachmentInfo();
                attachmentInfo.name = fileName;
                attachmentInfo.data = blob;
                attachmentInfo.dataUrl = url;
                resolve(attachmentInfo);
                
            })
            .catch((e: any) => { console.error(e); reject(e); });
    })
}