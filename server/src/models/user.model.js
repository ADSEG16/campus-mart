const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const sanitizeUserDocument = (userDoc) => {
  if (!userDoc) return null;

  const user = userDoc.toObject
    ? userDoc.toObject({ transform: false })
    : userDoc;

  return {
    _id: user._id,
    fullName: user.fullName,
    department: user.department,
    email: user.email,
    graduationYear: user.graduationYear,
    role: user.role,
    verificationStatus: user.verificationStatus,
    studentIdUrl: user.studentIdUrl,
    profileImageUrl: user.profileImageUrl,
    bio: user.bio,
    trustScore: user.trustScore,
    flagged: user.flagged,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    department: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
      unique: true,
      // Keeping the specific UG email validation from Cloudinary branch
      match: [/^[^\s@]+@st\.ug\.edu\.gh$/i, "Email must be a valid UG address"],
    },
    graduationYear: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Ensures password isn't returned in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Integrated verificationStatus from Cloudinary branch
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    // Added isVerified boolean from dev branch for quick logic checks
    isVerified: {
      type: Boolean,
      default: false,
    },
    studentIdUrl: {
      type: String,
      default: null,
      trim: true,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
      trim: true,
    },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    profileImageUrl: {
      type: String, // Cloudinary URL will be stored here
      default: null,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    emailVerificationTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

userSchema.set("toJSON", {
  transform: (doc, ret) => sanitizeUserDocument(ret),
});

userSchema.set("toObject", {
  transform: (doc, ret) => sanitizeUserDocument(ret),
});

// --- Security Middleware from Dev Branch ---

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.sanitizeUser = function () {
  return sanitizeUserDocument(this);
};

userSchema.statics.sanitizeUser = function (userDoc) {
  return sanitizeUserDocument(userDoc);
};

module.exports = mongoose.model("User", userSchema);
