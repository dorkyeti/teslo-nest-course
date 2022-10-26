const mime = require('mime');

export const fileFilter = (_: Express.Request, file: Express.Multer.File, cb: Function): void => {
    if (!file)
        return cb(new Error('El archivo está vacio'), false);

    const ext = mime.getExtension(file.mimetype);

    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext))
        return cb(null, true);

    return cb(null, false);
};