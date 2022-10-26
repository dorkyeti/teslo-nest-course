import { v4 as uuid } from 'uuid';

export const fileNamer = (_: Express.Request, file: Express.Multer.File, cb: Function): void => {
    const ext = 'png';

    const filename = `${uuid()}.${ext}`;

    return cb(null, filename);
}