import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../auth/interfaces/JwtPayload.interface';
import { AuthService } from '../auth/auth.service';
import { ConnectedClients, Socket } from './interfaces/connected-clients.interface';

@Injectable()
export class MessagesService {
    private connectedClients: ConnectedClients = {};

    constructor(
        private readonly authService: AuthService
    ) { }

    async registerClient(client: Socket, token: string) {
        const payload = this.authService.verify(token);
        if (!payload) {
            client.emit('Token not valid');
            client.disconnect(true);
            return;
        }

        const user = await this.authService.getUserById((payload as JwtPayload).id);
        if (user.deletedAt != null) {
            client.emit('User not found');
            client.disconnect(true)
            return;
        }

        this.disconnectOthersSockets(user);

        this.connectedClients[client.id] = { socket: client, user };
    }

    removeClient(client: Socket): void {
        delete this.connectedClients[client.id];
    }

    get clients(): string[] {
        return Object.keys(this.connectedClients);
    }

    get clientCount(): number {
        return this.clients.length;
    }

    getFullNameBySocketId(socketId: string): string {
        return this.connectedClients[socketId].user.fullName;
    }

    disconnectOthersSockets(user) {
        for (const key in this.connectedClients) {
            const con = this.connectedClients[key];

            if (con.user.id == user.id) {
                con.socket.disconnect(true);
                break;
            }
        }
    }
}
