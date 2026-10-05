import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB connected: ${uri.replace(/\/\/.*@/, '//***@')}`);
      return;
    } catch (err) {
      console.warn(`Could not reach MongoDB at configured URI (${err.message}).`);
      if (process.env.USE_MEMORY_FALLBACK !== 'true') throw err;
    }
  }
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri('flowlens'));
  console.log('Using in-memory MongoDB (demo mode: data is lost on restart). Set MONGODB_URI for persistence.');
}
