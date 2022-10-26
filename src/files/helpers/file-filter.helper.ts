
export const fileFilter = (_: Express.Request, file: Express.Multer.File, cb: Function): void => {
    if (!file)
        return cb(new Error('El archivo está vacio'), false);

    const ext = 'png';

    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext))
        return cb(null, true);

    return cb(null, false);
};