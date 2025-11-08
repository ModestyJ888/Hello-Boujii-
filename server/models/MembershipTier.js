const mongoose = require('mongoose');

const membershipTierSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Membership tier name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters'],
    default: ''
  },
  
  // Pricing Information
  price: {
    monthly: {
      amount: {
        type: Number,
        required: [true, 'Monthly price is required'],
        min: [0, 'Price cannot be negative']
      },
      currency: {
        type: String,
        required: true,
        default: 'USD',
        uppercase: true,
        match: [/^[A-Z]{3}$/, 'Currency must be a 3-letter code']
      },
      stripeProductId: {
        type: String,
        default: null
      },
      stripePriceId: {
        type: String,
        default: null
      }
    },
    yearly: {
      amount: {
        type: Number,
        min: [0, 'Price cannot be negative'],
        default: null
      },
      currency: {
        type: String,
        default: 'USD',
        uppercase: true,
        match: [/^[A-Z]{3}$/, 'Currency must be a 3-letter code']
      },
      stripeProductId: {
        type: String,
        default: null
      },
      stripePriceId: {
        type: String,
        default: null
      },
      discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%'],
        default: 0
      }
    }
  },
  
  // Trial Information
  trialPeriod: {
    enabled: {
      type: Boolean,
      default: false
    },
    days: {
      type: Number,
      min: [1, 'Trial period must be at least 1 day'],
      max: [365, 'Trial period cannot exceed 365 days'],
      default: 7
    }
  },
  
  // Features and Benefits
  features: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Feature name cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Feature description cannot exceed 500 characters'],
      default: ''
    },
    included: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: null // null means unlimited
    },
    category: {
      type: String,
      enum: ['social_media', 'content', 'analytics', 'support', 'storage', 'api', 'other'],
      default: 'other'
    }
  }],
  
  // Social Media Platform Access
  socialMediaAccess: {
    instagram: {
      enabled: { type: Boolean, default: false },
      features: [String], // e.g., ['posts', 'stories', 'analytics']
      limits: {
        postsPerMonth: { type: Number, default: null },
        storiesPerMonth: { type: Number, default: null }
      }
    },
    facebook: {
      enabled: { type: Boolean, default: false },
      features: [String],
      limits: {
        postsPerMonth: { type: Number, default: null },
        pagesManaged: { type: Number, default: 1 }
      }
    },
    twitter: {
      enabled: { type: Boolean, default: false },
      features: [String],
      limits: {
        tweetsPerMonth: { type: Number, default: null },
        accountsManaged: { type: Number, default: 1 }
      }
    },
    youtube: {
      enabled: { type: Boolean, default: false },
      features: [String],
      limits: {
        videosPerMonth: { type: Number, default: null },
        channelsManaged: { type: Number, default: 1 }
      }
    },
    tiktok: {
      enabled: { type: Boolean, default: false },
      features: [String],
      limits: {
        videosPerMonth: { type: Number, default: null }
      }
    },
    linkedin: {
      enabled: { type: Boolean, default: false },
      features: [String],
      limits: {
        postsPerMonth: { type: Number, default: null }
      }
    }
  },
  
  // Content Management Limits
  contentLimits: {
    storage: {
      amount: { type: Number, default: null }, // in MB, null = unlimited
      unit: { type: String, default: 'MB', enum: ['MB', 'GB', 'TB'] }
    },
    uploads: {
      maxFileSize: { type: Number, default: 10 }, // in MB
      allowedTypes: {
        type: [String],
        default: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi']
      }
    },
    posts: {
      perMonth: { type: Number, default: null }, // null = unlimited
      scheduled: { type: Number, default: null }
    }
  },
  
  // Support and Priority
  support: {
    level: {
      type: String,
      enum: ['basic', 'priority', 'premium', 'dedicated'],
      default: 'basic'
    },
    responseTime: {
      type: String,
      default: '48 hours'
    },
    channels: {
      type: [String],
      enum: ['email', 'chat', 'phone', 'video'],
      default: ['email']
    }
  },
  
  // Tier Configuration
  level: {
    type: Number,
    required: [true, 'Tier level is required'],
    min: [1, 'Level must be at least 1'],
    unique: true
  },
  color: {
    type: String,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color'],
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: null
  },
  badge: {
    type: String,
    default: null
  },
  
  // Status and Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  subscriberCount: {
    type: Number,
    default: 0,
    min: [0, 'Subscriber count cannot be negative']
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
membershipTierSchema.index({ slug: 1 });
membershipTierSchema.index({ level: 1 });
membershipTierSchema.index({ isActive: 1, isVisible: 1 });
membershipTierSchema.index({ 'price.monthly.amount': 1 });

// Virtual for yearly savings
membershipTierSchema.virtual('yearlySavings').get(function() {
  if (!this.price.yearly.amount || !this.price.monthly.amount) {
    return 0;
  }
  
  const monthlyTotal = this.price.monthly.amount * 12;
  const savings = monthlyTotal - this.price.yearly.amount;
  const percentage = (savings / monthlyTotal) * 100;
  
  return {
    amount: savings,
    percentage: Math.round(percentage)
  };
});

// Virtual for formatted monthly price
membershipTierSchema.virtual('formattedMonthlyPrice').get(function() {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.price.monthly.currency
  });
  return formatter.format(this.price.monthly.amount);
});

// Virtual for formatted yearly price
membershipTierSchema.virtual('formattedYearlyPrice').get(function() {
  if (!this.price.yearly.amount) return null;
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.price.yearly.currency
  });
  return formatter.format(this.price.yearly.amount);
});

// Pre-save middleware to update updatedAt
membershipTierSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to generate slug from name if not provided
membershipTierSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Instance method to check if user has access to feature
membershipTierSchema.methods.hasFeature = function(featureName) {
  return this.features.some(feature => 
    feature.name.toLowerCase() === featureName.toLowerCase() && feature.included
  );
};

// Instance method to get feature limit
membershipTierSchema.methods.getFeatureLimit = function(featureName) {
  const feature = this.features.find(f => 
    f.name.toLowerCase() === featureName.toLowerCase()
  );
  return feature ? feature.limit : null;
};

// Instance method to check social media platform access
membershipTierSchema.methods.hasSocialMediaAccess = function(platform) {
  return this.socialMediaAccess[platform] && this.socialMediaAccess[platform].enabled;
};

// Static method to find active tiers
membershipTierSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ level: 1 });
};

// Static method to find visible tiers
membershipTierSchema.statics.findVisible = function() {
  return this.find({ isActive: true, isVisible: true }).sort({ level: 1 });
};

// Static method to find tier by slug
membershipTierSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase(), isActive: true });
};

module.exports = mongoose.model('MembershipTier', membershipTierSchema);
