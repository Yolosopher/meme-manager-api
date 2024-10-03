import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { minutesToSeconds } from 'date-fns';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ImageService {
  private s3: S3Client;
  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: this.configService.get('AWS_REGION'),
    });
  }
  async uploadImage({
    filename,
    mimetype,
    path,
  }: Express.Multer.File): Promise<void> {
    try {
      const buffer = await this.getBufferFromImage(path);
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
      });

      await this.s3.send(command);
    } catch (error) {
      console.log(error);
    }
  }

  async deleteImage(imageName: string): Promise<true> {
    const deleteObjectParams = {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: imageName,
    };

    const command = new DeleteObjectCommand(deleteObjectParams);
    await this.s3.send(command);

    return true;
  }

  async getSignedUrl(key: string): Promise<string> {
    const getObjectParams = {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: key,
    };

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(this.s3, command, {
      expiresIn: minutesToSeconds(1),
    });

    return url;
  }

  private async getBufferFromImage(imagePath: string): Promise<Buffer> {
    return await readFile(imagePath);
  }

  async deleteLocalImage(imageName: string) {
    try {
      await unlink(
        join(this.configService.get('IMAGE_TEMP_FOLDER'), imageName),
      );
    } catch (error) {
      // nothing
    }
  }

  async deleteMultipleImages(imageNames: string[]): Promise<true> {
    const deleteObjectsParams = {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Delete: {
        Objects: imageNames.map((imageName) => ({ Key: imageName })),
      },
    };

    const command = new DeleteObjectsCommand(deleteObjectsParams);
    await this.s3.send(command);

    return true;
  }
}
