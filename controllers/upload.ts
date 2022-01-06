import {UploadApiResponse, v2 as cloudinary} from'cloudinary';
import File from '../modals/File';
const upload = async(path:string,mimetype:any,originalname:string) => {
                     
    try{
        let uploadedFile: UploadApiResponse;
              uploadedFile = await cloudinary.uploader.upload(path , {
                        folder: "Disseminator",
                        resource_type: "auto",
                        format: mimetype.split("/")[mimetype.split("/").length-1]

                    });
                    const {secure_url, bytes, format } = uploadedFile;
                    
            

                    const file = await File.create({
                        filename:originalname,
                        sizeInBytes:bytes,
                        secure_url,
                        format,
                    });
                    
                    return [uploadedFile,file];
            }
    catch(error:any){
        return false;
    }        
    
}

export default upload
