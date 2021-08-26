import express from 'express';
import multer  from 'multer';
import {UploadApiResponse, v2 as cloudinary} from'cloudinary';
import File from '../models/File';
import https from 'https';
import nodemailer from 'nodemailer';
import createEmailTemplate from '../utils/createEmailTemplate';

const router = express.Router();
const storage = multer.diskStorage({})

let upload = multer ({
    storage,
}) 
router.post("/upload", upload.single("myFile"),async(req,res) => {
    try{
        if(!req.file)
        return res.status(400).json({message: "Hey!  Upload the file"})
        console.log(req.file);
        console.log(req.file.mimetype.split("/")[req.file.mimetype.split("/").length-1])
        let uploadedFile : UploadApiResponse;
            try{
              uploadedFile = await cloudinary.uploader.upload(req.file.path , {
                        folder: "Disseminator",
                        resource_type: "auto",
                        format: req.file.mimetype.split("/")[req.file.mimetype.split("/").length-1]

                    }, (result, error) => {
                      if(error){
                        console.log(error)
                      }
                      else{
                        console.log(result)
                      }
                    });
            }
            catch (error:any){
                        console.log(error);
                        return res.status(400).json({ message: "Cloudinary Error"});
            }

                const {originalname} = req.file
                const {secure_url, bytes, format } = uploadedFile;

                const file = await File.create({
                    filename:originalname,
                    sizeInBytes:bytes,
                    secure_url,
                    format,
                });
                res.status(200).json({
                id:file._id,
                downloadPageLink : `${process.env.API_BASE_ENDPOINT_CLIENT}download/${file._id}`,
                })
            }
    catch (error:any){
        console.log(error.message);
        res.status(500).json({ message: "Server Error !!"});
    }
})

router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const file = await File.findById(id);
      if (!file) {
        return res.status(404).json({ message: "File does not exist" });
      }
  
      const { filename, format, sizeInBytes } = file;
      return res.status(200).json({
        name: filename,
        sizeInBytes,
        format,
        id,
      });
    } catch (error) {
      return res.status(500).json({ message: "Server Error :(" });
    }
  });
  


router.get("/:id/download",async(req,res) => {
    try {
        const id = req.params.id;
        const file = await File.findById(id);
        if (!file) {
          return res.status(404).json({ message: "File does not exist" });
        }
    
        https.get(file.secure_url, (fileStream) => fileStream.pipe(res));
      } catch (error) {
        return res.status(500).json({ message: "Server Error" });
      }
    });


    router.post('/email',async(req,res) => {
        const {id,emailFrom,emailTo} = req.body
        if (!id || !emailFrom || !emailTo)
        return res.status(400).json({ message: "all fields are required" });

        const file = await File.findById(id);
        if(!file) {
          return res.status(404).json({message:"File does not exist"});
        }

        if (file.sender)
    return res.status(400).json({ message: "File is already sent" });
    

        let transporter = nodemailer.createTransport({
          // @ts-ignore
          host: process.env.SENDINBLUE_SMTP_HOST,
          port:process.env.SENDINBLUE_SMTP_PORT, 
          secure:false, // true for 4656 , false for other parts.
          auth: {
            user:process.env.SENDINBLUE_SMTP_USER,
            pass: process.env.SENDINBLUE_SMTP_PASSWORD
          }
        });
const { filename,sizeInBytes} = file;


const fileSize = `${(Number(sizeInBytes) /(1024*1024)).toFixed(2)} MB` ;
const downloadPageLink = `${process.env.API_BASE_ENDPOINT_CLIENT}download/${id}`;

const mailOptions = {
  from:emailFrom,
  to:emailTo,
  subject: "File shared with you",
  text:`${emailFrom} shared a file with you`,
  html: createEmailTemplate(emailFrom, downloadPageLink, filename, fileSize), // html body
}

transporter.sendMail(mailOptions, async(error,info) => {
  if(error){
    console.log(error);
    return res.status(500).json({
      message:"Server error!"
    })
  }

  file.sender = emailFrom;
  file.receiver = emailTo;

  await file.save();
  return res.status(200).json({
    message: "Email Sent",
  })

})

})




export default router;
