import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
export { Socket } from 'socket.io';

export interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}
