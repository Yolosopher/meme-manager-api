import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ISocketMessage } from 'src/common/interfaces';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class LikeGateway {
  constructor(private readonly jwtService: JwtService) {}
  @UseGuards(AuthGuard)
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { data, token, user }: ISocketMessage,
  ): string {
    return 'Hello world!';
  }
}
