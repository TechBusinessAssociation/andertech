"use client";

import { useRef, useState } from "react";

// Shrinks a chosen photo in the browser before it is uploaded, so a phone
// photo of several MB goes up as a few hundred KB (and stays under the
// server-action body limit). It uses only built-in browser APIs (canvas), so
// there is no library. If the browser can't decode the file we leave it alone
// and the server's own size/type check decides.
const MAX_SIDE = 1600;

async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82),
  );
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", {
    type: "image/webp",
  });
}

export function ImageField({
  inputClass,
  labelClass,
}: {
  inputClass: string;
  labelClass: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");

  async function onChange() {
    const input = ref.current;
    const file = input?.files?.[0];
    if (!input || !file) return setNote("");
    try {
      const small = await shrink(file);
      const transfer = new DataTransfer();
      transfer.items.add(small);
      input.files = transfer.files;
      setNote(`Ready: ${Math.round(small.size / 1024)} KB`);
    } catch {
      setNote("");
    }
  }

  return (
    <label className={labelClass}>
      Image (optional, JPG, PNG or WebP)
      <input
        ref={ref}
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className={`${inputClass} font-normal`}
      />
      {note && <span className="text-xs font-normal text-zinc-600">{note}</span>}
    </label>
  );
}
