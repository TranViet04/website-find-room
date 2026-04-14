import { supabase } from "@/lib/supabaseClient";
// 1. Lấy toàn bộ danh sách user
export const getAllUser = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("amenity_name", { ascending: true });

  if (error) {
    console.error("Lỗi lấy danh sách tiện ích:", error.message);
    return [];
  }
  return data;
};