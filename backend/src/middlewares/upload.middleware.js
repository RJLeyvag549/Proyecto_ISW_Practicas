"use strict";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(__dirname, "../../../uploads");
const documentsDir = path.join(uploadsDir, "documents");
// Crear carpeta uploads si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("=> Carpeta uploads creada:", uploadsDir);
}
// Crear carpeta documents si no existe
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
  console.log("=> Carpeta uploads/documents creada:", documentsDir);
}
// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${random}-${safeName}`);
  },
});
// Filtro de tipos de archivo
function fileFilter(req, file, cb) {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo se permiten PDF, Word, Excel e imágenes."), false);
  }
}
// Configuración de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadDocument = upload.single("document");
