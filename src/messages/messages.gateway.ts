import { ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly messagesService: MessagesService
  ) { }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    await this.messagesService.registerClient(client, token);
    this.updateClients()
  }

  handleDisconnect(client: Socket) {
    this.messagesService.removeClient(client);
    this.updateClients()
  }

  updateClients() {
    this.server.emit('clients-updated', this.messagesService.clients)
  }

  @SubscribeMessage('msg')
  onMsg(
    @MessageBody(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })) payload: NewMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.emit('new-messages', {
      fullName: this.messagesService.getFullNameBySocketId(client.id),
      message: payload.message || 'Hola'
    })
  }
}
