/**
 * Creates SalesReferralCode entries for existing SalesTeamUsers.
 * Run: npm run link:sales-referrers
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SalesTeamUser from '../models/SalesTeamUser';
import SalesReferralCode from '../models/SalesReferralCode';

dotenv.config();

async function linkSalesReferrers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/valygo-admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const salesUsers = await SalesTeamUser.find({});
    let created = 0;
    let skipped = 0;

    for (const sales of salesUsers) {
      const existing = await SalesReferralCode.findOne({ referralCode: sales.referralCode });
      if (existing) {
        skipped++;
        continue;
      }
      await SalesReferralCode.create({
        referralCode: sales.referralCode,
        salesTeamUserId: sales._id,
      });
      created++;
      console.log(`Created SalesReferralCode for ${sales.email} (${sales.referralCode})`);
    }

    console.log(`Done. Created: ${created}, Skipped: ${skipped}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

linkSalesReferrers();
