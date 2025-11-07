const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { error } = require('console');

const JWT_SECRET = 'kaj2h19829@#@(*#31o2hjadkjdhaoijdpoawjj1231241j@&#@(!@idja'

// *** Edit your MongoDB connection string here ***
mongoose.connect('mongodb+srv://yay:yaynayyay@cluster0.gkrp1mm.mongodb.net/?appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection failed:', err))

const app = express();
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());

app.post('/api/change-password', async (req, res) => {
    const { token, newpassword: plainTextPassword } = req.body;

    if(!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password' });
    }

    if(plainTextPassword.length < 5) {
        return res.json({ 
            status: 'error', 
            error: 'Password too short. Should be atleast 6 characters.' 
        });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET); 

        const _id = user.id;
        
        const password = await bcrypt.hash(plainTextPassword, 10);

        await User.updateOne(
            { _id },
            { $set: { password } }
        );
        res.json({ status: 'ok' });
    } catch (err) {
        res.json({ status: 'error', error: ':))' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).lean();

    if(!user) {
        return res.json({ status: 'error', error: 'Invalid username/password' });
    }

    if(await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ 
            id: user._id,
            username: user.username
        }, JWT_SECRET);

        return res.json({ status: 'ok', data: token });
    }
    
    res.json({ status: 'error', error: 'Invalid username/password' });
});

app.post('/api/register', async (req, res) => {

    console.log('📥 Received registration request:', req.body);
    const { username, password: plainTextPassword } = req.body;
    
    if(!username || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Invalid username' });
    }

    if(!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password' });
    }

    if(plainTextPassword.length < 5) {
        return res.json({ 
            status: 'error', 
            error: 'Password too short. Should be atleast 6 characters.' 
        });
    }

    const password = await bcrypt.hash(plainTextPassword, 10);
    
    try {
        const response = await User.create({ username, password });
        console.log('✅ User registered successfully:', response);
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ status: 'error', error: 'Username already exists' });
        }
        throw error;
    }
    res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});