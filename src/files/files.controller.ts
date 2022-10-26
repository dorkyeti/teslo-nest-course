import { Controller, Get, Headers, Param, Post, Res, UnprocessableEntityException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: fileFilter,
            storage: diskStorage({
                destination: './static/products',
                filename: fileNamer
            })
        })
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file)
            throw new UnprocessableEntityException('The file should be a image');

        return { secureUrl: this.filesService.getSecureUrl(file.filename) };
    }

    @Get(':name')
    findOne(
        @Res() response: Response,
        @Param('name') name: string
    ) {
        const path = this.filesService.getFilePath(name);

        return response.sendFile(path);
    }
}
