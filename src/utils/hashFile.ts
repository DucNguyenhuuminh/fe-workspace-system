import { sha256 } from 'js-sha256';

export async function hashFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Đọc mỗi lần 5MB (Bằng đúng chunk size tải lên MinIO)
    const chunkSize = 5 * 1024 * 1024; 
    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    
    // Khởi tạo bộ tính hash SHA-256
    const hash = sha256.create();
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      if (!e.target?.result) {
        return reject(new Error("Error reading file"));
      }
      
      // Băm (hash) phần dữ liệu vừa đọc được
      hash.update(e.target.result as ArrayBuffer);
      currentChunk++;

      if (currentChunk < totalChunks) {
        // Nếu chưa hết file, tiếp tục đọc chunk tiếp theo
        loadNext();
      } else {
        // Đã đọc xong toàn bộ file, trả về mã hash cuối cùng dạng chuỗi Hex
        resolve(hash.hex());
      }
    };

    fileReader.onerror = () => {
      reject(fileReader.error || new Error("Error detecting while read file"));
    };

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      // slice() giúp cắt một đoạn nhỏ của file trên ổ cứng mà không load hết vào RAM
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    // Bắt đầu đọc chunk đầu tiên
    loadNext();
  });
}