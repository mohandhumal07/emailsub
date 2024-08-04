const express = require("express");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: "sql12.freesqldatabase.com",
  user: "sql12723969",
  password: "3WupNDq2dM",
  database: "sql12723969"
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "macdhumal@gmail.com",
    pass: "guuk esmk nzfs qopz"
  }
});

app.post('/subscribe', (req, res) => {
  const { email, action } = req.body;

  if (!email || !action) {
    return res.status(400).json({ message: 'Email and action are required' });
  }

  if (action === 'subscribe') {
    // Check if email already exists
    connection.query('SELECT * FROM subscribers WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length > 0) {
        console.log('Email already subscribed:', email);
        return res.status(400).json({ message: 'Email already subscribed' });
      }

      
      connection.query('INSERT INTO subscribers (email) VALUES (?)', [email], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        
        transporter.sendMail({
          from: 'macdhumal@gmail.com',
          to: email,
          subject: 'Welcome!',
          text: 'Thank you for subscribing to our newsletter.'
        }, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
            return res.status(500).json({ message: 'Error sending email' });
          }
          res.status(200).json({ message: 'Subscription successful' });
        });
      });
    });

  } else if (action === 'unsubscribe') {
    
    connection.query('SELECT * FROM subscribers WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        console.log('Email not found in subscription list:', email);
        return res.status(400).json({ message: 'Email not found in subscription list' });
      }

      
      connection.query('DELETE FROM subscribers WHERE email = ?', [email], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        
        transporter.sendMail({
          from: 'macdhumal@gmail.com',
          to: email,
          subject: 'Sorry to see you go',
          text: 'We are sorry to see you unsubscribe from our newsletter.'
        }, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
            return res.status(500).json({ message: 'Error sending email' });
          }
          res.status(200).json({ message: 'Unsubscription successful' });
        });
      });
    });
  } else {
    res.status(400).json({ message: 'Invalid action' });
  }
});

app.listen(9000, () => { console.log("ready @ 9000");});