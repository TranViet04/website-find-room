import { supabase } from "@/lib/supabaseClient";

const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const BUCKET_NAME = "room-images";

/**
 * Ensure bucket exists, create if not
 */
const ensureBucket = async () => {
  try {
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.warn(`[Storage] Could not list buckets:`, listError.message);
      return false;
    }

    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`[Storage] ✅ Bucket '${BUCKET_NAME}' already exists`);
      return true;
    }

    // Bucket doesn't exist, try to create it
    console.log(`[Storage] 📁 Creating bucket '${BUCKET_NAME}'...`);
    const { data, error: createError } = await supabase.storage.createBucket(
      BUCKET_NAME,
      {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      }
    );

    if (createError) {
      // Check if error is "bucket already exists" (race condition)
      if (createError.message.includes("already exists")) {
        console.log(`[Storage] ✅ Bucket '${BUCKET_NAME}' exists (created by another process)`);
        return true;
      }
      console.error(`[Storage] Failed to create bucket:`, createError.message);
      return false;
    }

    console.log(`[Storage] ✅ Bucket '${BUCKET_NAME}' created successfully`);
    return true;
  } catch (err: any) {
    console.error(`[Storage] Unexpected error in ensureBucket:`, err.message);
    return false;
  }
};

// 1. Hàm upload ảnh lên Storage và lấy URL
export const uploadRoomImage = async (
  file: File,
  roomId: string,
  is360: boolean = false
) => {
  // Validation
  if (!ALLOWED_FORMATS.includes(file.type)) {
    return { error: "Định dạng ảnh không hợp lệ. Hỗ trợ: JPEG, PNG, WebP, GIF" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Kích thước ảnh vượt quá 5MB" };
  }

  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const fileName = `${roomId}/${timestamp}-${random}.${fileExt}`;

  // Ensure bucket exists and is ready
  const bucketReady = await ensureBucket();
  if (!bucketReady) {
    console.error("[Storage] Failed to ensure bucket is ready");
    return {
      error: `Không thể khởi tạo storage. Vui lòng liên hệ quản trị viên.`,
    };
  }

  // Upload file lên bucket 'room-images'
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file);

  if (error) {
    console.error("[Storage] Upload error:", error);
    return { error: `Lỗi upload: ${error.message}` };
  }

  // Lấy URL công khai
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  // Lưu URL vào bảng roomimages
  const { data: imageData, error: dbError } = await supabase
    .from("roomimages")
    .insert([{ room_id: roomId, image_url: publicUrl, is_360: is360 }])
    .select()
    .single();

  if (dbError) {
    return { error: `Lỗi lưu ảnh: ${dbError.message}` };
  }

  return { publicUrl, imageData, error: null };
};

// 2. Hàm lấy tất cả ảnh của một phòng
export const getRoomImages = async (roomId: string) => {
  const { data, error } = await supabase
    .from("roomimages")
    .select("*")
    .eq("room_id", roomId)
    .order("image_id");

  if (error) {
    return { error: `Lỗi lấy ảnh: ${error.message}` };
  }

  return { data: data || [], error: null };
};

// 3. Hàm xóa ảnh
export const deleteRoomImage = async (imageId: string, roomId: string) => {
  // Lấy thông tin ảnh trước khi xóa
  const { data: imageData, error: selectError } = await supabase
    .from("roomimages")
    .select("image_url")
    .eq("image_id", imageId)
    .single();

  if (selectError) {
    return { error: `Lỗi tìm ảnh: ${selectError.message}` };
  }

  // Xóa file từ Storage
  const fileName = imageData.image_url.split("/").pop();
  if (fileName) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`${roomId}/${fileName}`]);

    if (storageError) {
      return { error: `Lỗi xóa file: ${storageError.message}` };
    }
  }

  // Xóa record từ database
  const { error: dbError } = await supabase
    .from("roomimages")
    .delete()
    .eq("image_id", imageId);

  if (dbError) {
    return { error: `Lỗi xóa ảnh từ DB: ${dbError.message}` };
  }

  return { success: true, error: null };
};

// 4. Hàm cập nhật trạng thái 360
export const updateImage360Status = async (
  imageId: string,
  is360: boolean
) => {
  const { data, error } = await supabase
    .from("roomimages")
    .update({ is_360: is360 })
    .eq("image_id", imageId)
    .select()
    .single();

  if (error) {
    return { error: `Lỗi cập nhật: ${error.message}` };
  }

  return { data, error: null };
};

// 5. Hàm upload nhiều ảnh cùng lúc
export const uploadMultipleRoomImages = async (
  files: File[],
  roomId: string
) => {
  if (files.length === 0) {
    return { success: true, uploads: [], errors: [] };
  }

  // Ensure bucket exists once for all uploads
  const bucketReady = await ensureBucket();
  if (!bucketReady) {
    const error = "Không thể khởi tạo storage. Vui lòng liên hệ quản trị viên.";
    return {
      success: false,
      uploads: [],
      errors: files.map(() => error),
    };
  }

  const uploads = [];
  const errors = [];

  for (const file of files) {
    const result = await uploadRoomImage(file, roomId, false);
    if (result.error) {
      errors.push(result.error);
    } else {
      uploads.push(result);
    }
  }

  return {
    success: errors.length === 0,
    uploads,
    errors: errors.length > 0 ? errors : null,
  };
};
