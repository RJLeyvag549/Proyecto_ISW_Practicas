"use strict";

export async function sendEmail(to, subject, text) {
  try {
    console.log("Email would be sent:", {
      to,
      subject,
      text
    });
    return [true, null];
  } catch (error) {
    console.error("Error sending email:", error);
    return [null, error.message];
  }
}