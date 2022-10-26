import { join } from 'path';
import { existsSync } from 'fs';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
    constructor(private readonly configService: ConfigService) { }

    getFilePath(filename: string): string {
        const fullPath = this.getFullPath(filename);

        if (!this.existsPath(fullPath))
            throw new BadRequestException('The file does not exists');

        return fullPath;
    }

    private existsPath(path: string): boolean {
        return existsSync(path);
    }

    private getFullPath(filename: string): string {
        return join(__dirname, '..', '..', 'static', 'products', filename);
    }

    getSecureUrl(filename: string): string {
        return `${this.configService.get('HOST_FILE')}/${filename}`;
    }
}
