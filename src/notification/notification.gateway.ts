import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Server, Socket } from 'socket.io';
import { ISocketMessage } from 'src/common/interfaces';
import { SignInData } from 'src/users/dto/user.dto';
import { getUserRoomName } from 'src/common/helpers';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly authGuard: AuthGuard,
  ) {}
  // Called after the WebSocket server is initialized
  public afterInit() {
    console.log('WebSocket server initialized');
  }
  // Called when a client connects
  public async handleConnection(client: Socket) {
    try {
      const token = client.handshake?.query?.token; // Extract token from query params
      if (!token || typeof token !== 'string') {
        throw new WsException('No token provided');
      }

      // Create a mock ExecutionContext for the guard
      const context: ExecutionContext = {
        switchToWs: () => ({
          getData: () => ({ token }), // Simulating the data sent in the WebSocket message
        }),
        switchToHttp: () => ({
          getRequest: () => ({ headers: { authorization: `Bearer ${token}` } }),
        }),
        getType: () => 'ws',
        // Additional methods can be mocked if needed
      } as any; // Type assertion since ExecutionContext is an interface

      // Use the AuthGuard to validate the token
      const canActivate = await this.authGuard.canActivate(context);
      if (!canActivate) {
        throw new WsException('Unauthorized');
      }
      // check if token is valid
      const tokenPayload = await this.jwtService.verifyAsync(token.trim());

      const authResult = {
        id: tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role,
        name: tokenPayload.name,
      };

      (client as Socket & { user?: SignInData }).user =
        authResult as SignInData;

      // join the user to a room named after their id
      client.join(getUserRoomName(authResult.id));
      console.log('Client connected:', client.id);

      await this.loadNotifications(client, authResult.id);
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect(); // Disconnect the client if authentication fails
    }
  }

  // Called when a client disconnects
  public async handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  private async loadNotifications(client: Socket, userId: number) {
    const notifications =
      await this.notificationService.getMyNotifications(userId);
    client.emit('notifications', notifications);
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('fetch_notifications')
  async fetchNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() { user }: ISocketMessage,
  ): Promise<void> {
    const notifications = await this.notificationService.getMyNotifications(
      user.id,
    );
    client.emit('notifications', notifications);
  }
}
