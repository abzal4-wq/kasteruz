import { IS_DEMO } from "./demo-data";
import { supabase } from "./supabase";

// Faylni dataURL (base64) ga aylantirish — demo rejim uchun
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Bir nechta rasmni yuklash → URL'lar massivi
// Demo: dataURL. Real: Supabase Storage (products bucket) public URL.
export async function uploadProductImages(files: File[]): Promise<string[]> {
  if (IS_DEMO) {
    return Promise.all(files.map(fileToDataUrl));
  }

  const urls: string[] = [];
  for (const file of files) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    // Bucket allaqachon "products" — yo'lga yana "products/" qo'shmaymiz (ilgari
    // "products/products/..." bo'lib, 400 xato berardi)
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("products")
      .upload(path, file, { upsert: true, contentType: file.type || `image/${ext}` });
    if (error) throw error;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}
