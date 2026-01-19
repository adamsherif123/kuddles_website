import * as admin from "firebase-admin";
import nodemailer from "nodemailer";
import {onCall} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {setGlobalOptions} from "firebase-functions/v2";

admin.initializeApp();

// choose region (fine to keep default; this is ok)
setGlobalOptions({region: "us-central1"});

const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASS = defineSecret("EMAIL_PASS");

export const subscribeEmail = onCall(
  {secrets: [EMAIL_USER, EMAIL_PASS]},
  async (request) => {
    const email = request.data?.email as string;

    if (!email || !email.includes("@")) {
      throw new Error("Invalid email");
    }

    // Save subscriber
    await admin.firestore().collection("subscribers").add({
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "popup",
    });

    // Send welcome email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER.value(),
        pass: EMAIL_PASS.value(),
      },
    });

    await transporter.sendMail({
      from: `Kuddles <${EMAIL_USER.value()}>`,
      to: email,
      subject: "Welcome to Kuddles 🎉",
      html: `
        <h2>Welcome to Kuddles</h2>
        <p>Thanks for subscribing to Kuddles.</p>
        <p>We’ll keep you posted with updates and early access.</p>
      `,
    });

    return {success: true};
  }
);
