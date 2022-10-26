import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [MessagesGateway, MessagesService],
  imports: [AuthModule]
})
export class MessagesModule { }
