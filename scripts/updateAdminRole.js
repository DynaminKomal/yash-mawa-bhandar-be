const mongoose = require('mongoose');

const uri = 'mongodb+srv://komal:komiv2826@atlascluster.qouur0w.mongodb.net/yash-mawa-bhandar';

async function updateAdminRole() {
  try {
    await mongoose.connect(uri);
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin.yashmawabhandar@gmail.com' },
      { $set: { role: 'admin' } }
    );
    console.log('Update result:', result);
    
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'admin.yashmawabhandar@gmail.com' });
    console.log('Updated User:', user);
    process.exit(0);
  } catch (err) {
    console.error('Error updating user role:', err);
    process.exit(1);
  }
}

updateAdminRole();
