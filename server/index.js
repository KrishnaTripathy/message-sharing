const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const EmployeeModel = require('./models/Employee');
const SecretModel = require('./models/Secret'); 
const app = express();
app.use(express.json());
app.use(cors());

app.use(session({
    secret: 'mySecureSessionKey_123!@#',
    resave: false,
    saveUninitialized: true,
}));

// Handle MongoDB connection properly
mongoose.connect("mongodb://127.0.0.1:27017/employee")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await EmployeeModel.findOne({ email });
  
      if (user) {
        const result = await bcrypt.compare(password, user.password);
  
        if (result) {
          // Initialize req.session if not already defined
          req.session = req.session || {};
          
          req.session.userId = user._id; // Store user ID in session
          res.json('Success');
        } else {
          res.json('The password is incorrect');
        }
      } else {
        res.json('No record existed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await EmployeeModel.create({ email, password: hashedPassword });
    res.json(newUser);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/home', async (req, res) => {
  const { secret, username } = req.body;

  try {
    // Create a new 'Secret' document
    const secretDocument = await SecretModel.create({ secret, username });

    // Get the ObjectId of the created secret
    const secretId = secretDocument._id;

    // Assuming `userId` is obtained from the session
    const userId = req.session.userId;

    // Update the user's document in MongoDB with the ObjectId of the new secret
    if (userId) {
      await EmployeeModel.findByIdAndUpdate(userId, { $push: { secrets: secretId } });
    }

    // Fetch all secrets from the database
    const allSecrets = await SecretModel.find();

    res.json({ secret: secret, allSecrets: allSecrets });
  } catch (error) {
    console.error('Error posting secret:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/home', async (req, res) => {
  try {
    const allSecrets = await SecretModel.find();

    res.json({ allSecrets });
  } catch (error) {
    console.error('Error fetching secrets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/secrets', async (req, res) => {
  try {
      const userId = req.session.userId;
      const userSecrets = await EmployeeModel.findOne({ _id: userId }, 'secrets');

      console.log('User Secrets:', userSecrets); // Log the userSecrets to the console

      res.json({ secrets: userSecrets ? userSecrets.secrets : [] });
  } catch (error) {
      console.error('Error fetching secrets:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});





app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
