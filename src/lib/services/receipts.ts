import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirebaseApp } from '@/lib/firebase/config';

const storage = getStorage(getFirebaseApp());

export async function uploadReceipt(file: File, expenseId: string): Promise<string> {
  try {
    // Create a unique file name
    const extension = file.name.split('.').pop();
    const fileName = `receipts/${expenseId}_${Date.now()}.${extension}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, fileName);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw new Error('Failed to upload receipt');
  }
}

export async function deleteReceipt(receiptUrl: string): Promise<void> {
  try {
    // Get the file path from the URL
    const decodedUrl = decodeURIComponent(receiptUrl);
    const fileName = decodedUrl.split('/o/')[1].split('?')[0];
    
    // Create a reference to the file
    const storageRef = ref(storage, fileName);
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw new Error('Failed to delete receipt');
  }
}

export async function validateReceipt(file: File): Promise<boolean> {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, HEIC, or PDF file.');
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 10MB.');
  }
  
  return true;
} 