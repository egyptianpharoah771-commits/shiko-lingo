import Admin from "./models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Admin Login Controller
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    // Create token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful",
      token,
    });

  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
