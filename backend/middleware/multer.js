import multer from 'multer';

const storage = multer.diskStorage({
    filename:function(req,file,callback){
        callback(null,file.originalname)
    }
})

const upload = multer({storage});

export default upload;

/*
Express cannot handle file uploads by itself. Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files.

In this code, we configure Multer to store uploaded files on disk with their original filenames. This setup is essential for routes that handle file uploads, such as adding product images in an e-commerce application.
diskStorage → store files locally
memoryStorage → store files in RAM (common with Cloudinary)
You chose diskStorage. Why?
✅ Simplicity: Easy to set up and use for small to medium applications.
✅ Local Access: Files are readily accessible on the server's filesystem.
✅ Performance: No overhead of keeping files in memory, which can be a concern with large files or high traffic.

the function filename specifies how to name the uploaded files. Here( callback(null,file.originalname) ), we use the original filename provided by the client.why callback(null, file.originalname)?
The callback function is used to signal completion and provide the filename for the stored file. The first argument is for errors (null means no error), and the second argument is the desired filename. Using file.originalname preserves the original name of the uploaded file, which can be useful for identification and retrieval later on.

Multer itself does NOT upload to Cloudinary — it just prepares the files.
callback is a function provided by Multer. It must be called with (error, filename) to tell Multer what name to use for the uploaded file.
here upload is like an instance of Multer configured with our storage settings. We export it so that we can use it in our routes to handle file uploads. and upload can also be considered a middleware function that processes incoming file uploads according to the defined storage configuration. When you use upload.fields([...]) in your route, Multer will handle the file uploads before your controller function (like addProduct) is executed, making the uploaded files available in req.files for further processing (like uploading to Cloudinary or saving file paths in the database).
*/