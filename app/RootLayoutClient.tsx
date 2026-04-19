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
    // Initialize storage bucket once on app startup
    const initBucket = async () => {
      try {
        console.log("[Storage Init] Starting bucket initialization...");

        // List existing buckets
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
          console.error("[Storage Init] ❌ Failed to list buckets:", listError);
          console.error("[Storage Init] Error details:", {
            message: listError.message,
            status: (listError as any).status,
            statusText: (listError as any).statusText,
          });
          return;
        }

        console.log("[Storage Init] 📦 Current buckets:", buckets?.map(b => b.name) || []);

        const bucketExists = buckets?.some((b) => b.name === "roomImgNot360");

        if (bucketExists) {
          console.log("[Storage Init] ✅ Bucket 'roomImgNot360' already exists");
          return;
        }

        // Create bucket if it doesn't exist
        console.log("[Storage Init] 📁 Creating bucket 'roomImgNot360'...");
        const { data, error: createError } = await supabase.storage.createBucket(
          "roomImgNot360",
          {
            public: true,
            fileSizeLimit: 52428800, // 50MB
          }
        );

        if (createError) {
          console.error("[Storage Init] ❌ Failed to create bucket:", createError);
          console.error("[Storage Init] Error details:", {
            message: createError.message,
            status: (createError as any).status,
            statusText: (createError as any).statusText,
          });
          return;
        }

        console.log("[Storage Init] ✅ Bucket 'roomImgNot360' created successfully");

        // Wait a moment to ensure bucket is ready
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("[Storage Init] ✅ Bucket is ready for use");
      } catch (err: any) {
        console.error("[Storage Init] ❌ Unexpected error:", err);
      }
    };

    initBucket();
  }, []);

  return <>{children}</>;
}
