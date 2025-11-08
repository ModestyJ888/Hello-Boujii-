const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // User and Membership Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  membershipTier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipTier',
    required: [true, 'Membership tier is required']
  },
  
  // Stripe Information
  stripeCustomerId: {
    type: String,
    required: [true, 'Stripe customer ID is required'],
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    required: [true, 'Stripe subscription ID is required'],
    unique: true,
    index: true
  },
  stripePriceId: {
    type: String,
    required: [true, 'Stripe price ID is required']
  },
  
  // Subscription Details
  status: {
    type: String,
    enum: [
      'active',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'past_due',
      'trialing',
      'unpaid',
      'paused'
    ],
    required: [true, 'Status is required'],
    index: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: [true, 'Billing cycle is required']
  },
  
  // Pricing Information
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    match: [/^[A-Z]{3}$/, 'Currency must be a 3-letter code']
  },
  
  // Trial Information
  trialStart: {
    type: Date,
    default: null
  },
  trialEnd: {
    type: Date,
    default: null
  },
  isTrialActive: {
    type: Boolean,
    default: false
  },
  
  // Billing Dates
  currentPeriodStart: {
    type: Date,
    required: [true, 'Current period start is required']
  },
  currentPeriodEnd: {
    type: Date,
    required: [true, 'Current period end is required']
  },
  nextBillingDate: {
    type: Date,
    default: null
  },
  
  // Cancellation Information
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    default: null
  },
  
  // Payment Information
  lastPaymentDate: {
    type: Date,
    default: null
  },
  lastPaymentAmount: {
    type: Number,
    default: null
  },
  lastPaymentStatus: {
    type: String,
    enum: ['succeeded', 'failed', 'pending', 'canceled'],
    default: null
  },
  
  // Failed Payment Tracking
  failedPaymentCount: {
    type: Number,
    default: 0,
    min: [0, 'Failed payment count cannot be negative']
  },
  lastFailedPaymentDate: {
    type: Date,
    default: null
  },
  
  // Discount and Coupon Information
  discount: {
    couponId: {
      type: String,
      default: null
    },
    couponCode: {
      type: String,
      default: null
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    validUntil: {
      type: Date,
      default: null
    }
  },
  
  // Subscription History
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'canceled', 'reactivated', 'paused', 'resumed', 'upgraded', 'downgraded'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }],
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ createdAt: -1 });

// Virtual for days until next billing
subscriptionSchema.virtual('daysUntilNextBilling').get(function() {
  if (!this.nextBillingDate) return null;
  
  const now = new Date();
  const nextBilling = new Date(this.nextBillingDate);
  const diffTime = nextBilling - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for trial days remaining
subscriptionSchema.virtual('trialDaysRemaining').get(function() {
  if (!this.isTrialActive || !this.trialEnd) return 0;
  
  const now = new Date();
  const trialEnd = new Date(this.trialEnd);
  const diffTime = trialEnd - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for formatted amount
subscriptionSchema.virtual('formattedAmount').get(function() {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  });
  return formatter.format(this.amount);
});

// Virtual for subscription age in days
subscriptionSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update updatedAt
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to add history entry on status change
subscriptionSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.history.push({
      action: 'updated',
      timestamp: new Date(),
      details: {
        statusChanged: {
          from: this._original?.status,
          to: this.status
        }
      }
    });
  }
  next();
});

// Post-init middleware to store original values
subscriptionSchema.post('init', function() {
  this._original = this.toObject();
});

// Instance method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return ['active', 'trialing'].includes(this.status);
};

// Instance method to check if subscription is in trial
subscriptionSchema.methods.isInTrial = function() {
  return this.status === 'trialing' && 
         this.isTrialActive && 
         this.trialEnd && 
         new Date() < this.trialEnd;
};

// Instance method to check if subscription is expiring soon
subscriptionSchema.methods.isExpiringSoon = function(days = 7) {
  if (!this.currentPeriodEnd) return false;
  
  const now = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  
  return this.currentPeriodEnd <= expirationDate && this.currentPeriodEnd > now;
};

// Instance method to add history entry
subscriptionSchema.methods.addHistoryEntry = function(action, details = {}, performedBy = null) {
  this.history.push({
    action,
    timestamp: new Date(),
    details,
    performedBy
  });
};

// Instance method to calculate next billing amount
subscriptionSchema.methods.getNextBillingAmount = function() {
  let amount = this.amount;
  
  // Apply discount if valid
  if (this.discount.validUntil && new Date() < this.discount.validUntil) {
    if (this.discount.discountPercentage > 0) {
      amount = amount * (1 - this.discount.discountPercentage / 100);
    } else if (this.discount.discountAmount > 0) {
      amount = Math.max(0, amount - this.discount.discountAmount);
    }
  }
  
  return Math.round(amount * 100) / 100; // Round to 2 decimal places
};

// Static method to find active subscriptions
subscriptionSchema.statics.findActive = function() {
  return this.find({ status: { $in: ['active', 'trialing'] } });
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiring = function(days = 7) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  
  return this.find({
    status: 'active',
    currentPeriodEnd: { $lte: expirationDate, $gte: new Date() }
  });
};

// Static method to find subscriptions by user
subscriptionSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to find failed payments
subscriptionSchema.statics.findFailedPayments = function() {
  return this.find({
    status: 'past_due',
    failedPaymentCount: { $gt: 0 }
  });
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
