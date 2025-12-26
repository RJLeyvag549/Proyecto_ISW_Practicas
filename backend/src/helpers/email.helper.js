"use strict";
import nodemailer from "nodemailer";
import {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_SERVICE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
} from "../config/configEnv.js";

/**
 * Envía un correo usando nodemailer. Soporta Gmail (via EMAIL_SERVICE='gmail')
 * o configuración SMTP mediante variables SMTP_HOST/SMTP_PORT/SMTP_SECURE.
 * Retorna [true, null] en éxito o [null, errorMessage] en fallo (patrón usado en el proyecto).
 */
export async function sendEmail(to, subject, text, html = null) {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("[email.helper] EMAIL_USER o EMAIL_PASS no configurados. No se enviará correo.");
      return [null, "Credenciales de email no configuradas"];
    }

    let transporterConfig;

    if (EMAIL_SERVICE && EMAIL_SERVICE.toLowerCase() === "gmail") {
      transporterConfig = {
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      };
    } else if (SMTP_HOST) {
      transporterConfig = {
        host: SMTP_HOST,
        port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
        secure: SMTP_SECURE === "true",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      };
    } else {
      // Fallback to Gmail if nothing else
      transporterConfig = {
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: `Sistema de Prácticas <${EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    if (html) mailOptions.html = html;

    const info = await transporter.sendMail(mailOptions);
    console.log("[email.helper] Correo enviado a", to, "messageId:", info.messageId);
    return [true, null];
  } catch (error) {
    console.error("[email.helper] Error enviando correo:", error.message || error);
    return [null, error.message || String(error)];
  }
}