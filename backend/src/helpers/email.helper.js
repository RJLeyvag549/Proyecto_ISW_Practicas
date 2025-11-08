"use strict";

export async function sendEmail(to, subject, text) {
  try {
    // Log the email that would be sent
    console.log('Email would be sent:', {
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