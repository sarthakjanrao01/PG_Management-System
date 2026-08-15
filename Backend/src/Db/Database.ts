import app from "../app";
import env from "../util/validateEnv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import RegisterModel from "../Models/Register.model";

const port = env.PORT || 5000;

const seedSuperAdmin = async () => {
  try {
    const adminEmail = "admin@gmail.com";
    const existing = await RegisterModel.findOne({ email: adminEmail });
    if (!existing) {
      const passwordHashed = await bcrypt.hash("admin@1234", 10);
      await RegisterModel.create({
        name: "Super Admin",
        mobile_number: 9999999999,
        email: adminEmail,
        password: passwordHashed,
        role: "superadmin",
        isApproved: true,
      });
      console.log("✓ SuperAdmin account seeded successfully: admin@gmail.com / admin@1234");
    } else {
      // Ensure superadmin is approved and role is superadmin
      if (!existing.isApproved || existing.role !== "superadmin") {
        existing.isApproved = true;
        existing.role = "superadmin";
        await existing.save();
      }
    }
  } catch (err) {
    console.error("Error seeding SuperAdmin:", err);
  }
};

export const mongoDb = async () => {
  await mongoose
    .connect(env.MONGO_CONNECTION_STRING)
    .then(async () => {
      console.log("Connected to MongoDB");
      await seedSuperAdmin();

      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    })
    .catch(console.error);
};
