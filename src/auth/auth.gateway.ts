import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { AuthGuard } from './guards/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { SignInData } from 'src/users/dto/user.dto';
import { getUserRoomName } from 'src/common/helpers';

@WebSocketGateway()
export class AuthGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  constructor(
    private readonly jwtService: JwtService,
    private authGuard: AuthGuard,
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
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect(); // Disconnect the client if authentication fails
    }
  }
  // Called when a client disconnects
  public async handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
}
