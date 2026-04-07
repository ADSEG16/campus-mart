const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Product = require("./product.model");

const DEFAULT_USER_SETTINGS = Object.freeze({
  emailNotifications: true,
  inAppAlerts: true,
  marketing: false,
  twoFactor: true,
});

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
    isVerified: user.isVerified,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    studentIdUrl: user.studentIdUrl,
    profileImageUrl: user.profileImageUrl,
    bio: user.bio,
    settings: {
      ...DEFAULT_USER_SETTINGS,
      ...(user.settings || {}),
    },
    watchlist: Array.isArray(user.watchlist)
      ? user.watchlist
          .map((item) => String(item?._id || item || ""))
          .filter(Boolean)
      : [],
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
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
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
    settings: {
      emailNotifications: {
        type: Boolean,
        default: DEFAULT_USER_SETTINGS.emailNotifications,
      },
      inAppAlerts: {
        type: Boolean,
        default: DEFAULT_USER_SETTINGS.inAppAlerts,
      },
      marketing: {
        type: Boolean,
        default: DEFAULT_USER_SETTINGS.marketing,
      },
      twoFactor: {
        type: Boolean,
        default: DEFAULT_USER_SETTINGS.twoFactor,
      },
    },
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    profileImageUrl: {
      type: String,
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
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetTokenExpiresAt: {
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

const cascadeDeleteSellerListings = async (userId) => {
  if (!userId) return;

  await Product.deleteMany({ sellerId: userId });
};

userSchema.pre("findOneAndDelete", async function () {
  const user = await this.model.findOne(this.getFilter()).select("_id");
  if (user?._id) {
    await cascadeDeleteSellerListings(user._id);
  }
});

userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await cascadeDeleteSellerListings(this._id);
  },
);

userSchema.pre(
  "deleteOne",
  { document: false, query: true },
  async function () {
    const user = await this.model.findOne(this.getFilter()).select("_id");
    if (user?._id) {
      await cascadeDeleteSellerListings(user._id);
    }
  },
);

userSchema.set("toJSON", {
  transform: (doc, ret) => sanitizeUserDocument(ret),
});

userSchema.set("toObject", {
  transform: (doc, ret) => sanitizeUserDocument(ret),
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

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
