"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Client wrapper for RootLayout
 * Initializes storage bucket on app startup
 */
export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Check if storage bucket exists on app startup
    const checkBucket = async () => {
      try {
        console.log("[Storage] Checking storage bucket...");

        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
          console.error("[Storage] Failed to list buckets:", listError);
          return;
        }

        const bucketName = "roomImgNot360";
        const bucketExists = buckets?.some((b) => b.name === bucketName);

        if (bucketExists) {
          console.log(`[Storage] ✅ Bucket '${bucketName}' exists`);
        } else {
          console.warn(
            `[Storage] ⚠️ Bucket '${bucketName}' does not exist. ` +
            `Please create it in Supabase Storage before uploading images.`
          );
        }
      } catch (err: any) {
        console.error("[Storage] Error checking bucket:", err);
      }
    };

    checkBucket();
  }, []);

  return <>{children}</>;
}
