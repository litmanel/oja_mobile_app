import * as ImageManipulator from 'expo-image-manipulator';
import { IMAGE_MAX_DIMENSION_PX, IMAGE_QUALITY } from '@oja/config';

export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: IMAGE_MAX_DIMENSION_PX } }],
    { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
