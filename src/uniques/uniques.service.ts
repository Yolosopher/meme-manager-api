import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UniquesService {
  private key: string;
  private url: string;
  constructor(private configService: ConfigService) {
    this.key = this.configService.get('UNIQUES_KEY');
    this.url = this.configService.get('UNIQUES_URL');
  }

  public async getUsername(): Promise<string> {
    try {
      const response = await fetch(`${this.url}/username`, {
        headers: {
          Authorization: `Bearer ${this.key}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data.username;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  public async generateAvatar(username: string): Promise<true> {
    try {
      const response = await fetch(`${this.url}/avatars`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  public async deleteAvatar(username: string): Promise<void> {
    try {
      const response = await fetch(`${this.url}/avatars/${username}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.key}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  public getAvatarUrl(username: string): string {
    return `${this.url}/avatars/${username}`;
  }
}
