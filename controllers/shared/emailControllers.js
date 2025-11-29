const { db, pool } = require('../../config/DB-connection')
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const {
  EC2Client, CreateSecurityGroupCommand, AuthorizeSecurityGroupIngressCommand,
  AuthorizeSecurityGroupEgressCommand, RunInstancesCommand, DescribeInstancesCommand
} = require('@aws-sdk/client-ec2');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ORG_EMAIL,
    pass: process.env.ORG_EMAIL_PASS // App password for Gmail
  }
});

// Instead of AWS = require('aws-sdk')

const ec2Client = (region) =>
  new EC2Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });


// to read mails of the gmail account
const readMails = async (req, res) => {
  try {
    let allMessages = [];
    let nextPageToken = null;

    const authClient = await authorize();
    // Set up Gmail API with the OAuth2 client
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'label:INBOX',
        maxResults: 100, // Limit per page
        pageToken: nextPageToken // Use the nextPageToken for pagination
      });
      // console.log("response:", response)

      const messages = response.data.messages;
      allMessages = allMessages.concat(messages);

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    if (allMessages.length === 0) {
      return res.json({ message: 'No emails found in the INBOX' });
    }

    const emailPromises = allMessages.map(async message => {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      return email.data;
    });

    const emails = await Promise.all(emailPromises);
    // console.log('read mails: ', emails.length, new Date())

    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'An error occurred while fetching emails' });
  }

  const config = {
    imap: {
      user: 'testmail@nowitservices.com', // process.env.EMAIL,
      password: 'qdrp cbdx dytp ngez', // process.env.PASSWORD,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 3000
    }
  };

  // try {
  //   const connection = await Imap.connect(config);
  //   await connection.openBox('INBOX');

  //   const searchCriteria = ['ALL'];
  //   const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], struct: true };

  //   const messages = await connection.search(searchCriteria, fetchOptions);

  //   const emails = await Promise.all(messages.map(async (item) => {
  //     const all = item.parts.find(part => part.which === 'TEXT');
  //     const id = item.attributes.uid;
  //     const idHeader = `Imap-Id: ${id}\r\n`;

  //     const parsed = await simpleParser(idHeader + all.body);
  //     // console.log(parsed)
  //     console.log({
  //       subject: parsed.subject,
  //       from: parsed.from.text,
  //       date: parsed.date,
  //       text: parsed.text
  //     })
  //     return {
  //       subject: parsed.subject,
  //       from: parsed.from.text,
  //       date: parsed.date,
  //       text: parsed.text
  //     };
  //   }));

  //   res.json(emails);
  // } catch (error) {
  //   res.status(500).send('Error fetching emails: ' + error.message);
  // }

}

// Route to handle sending OTP via email
const sendOtpViaEmail = async (req, res, next) => {
  const { email } = req.body;

  // Generate a random OTP (4 digits)
  const otp = Math.floor(1000 + Math.random() * 9000);

  // Define email options
  const mailOptions = {
    from: 'testmail@nowitservices.com',
    to: email,
    subject: 'Your OTP for Verification',
    text: `Your OTP is: ${otp}`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
}

// Route to handle sending registration email
// Endpoint to send an automated registration email
const sendRegistrationEmail = async (req, res) => {
  const { email } = req.body;
  console.log(email)

  if (!email || !email.endsWith('@nowitservices.com')) {
    return res.status(400).send({ error: 'Email is required' });
  }

  // Check if the user is already registered (pseudo-code, replace with actual check)
  // const userRegistered = await checkUserRegistration(email);

  // if (userRegistered) {
  //   return res.status(200).send({ message: 'User is already registered' });
  // }

  const registrationLink = 'https://won-platform.web.app/';

  const mailOptions = {
    from: 'testmail@nowitservices.com', // process.env.EMAIL_USER,
    to: email,
    subject: 'Register to Our Platform',
    text: `Hello,
  
      We noticed you tried to contact us but are not registered on our platform. Please use the following link to register:
          
      ${registrationLink}
          
      Thank you,
      WON Platform Team`
  };

  const subject = 'Register to Our Platform'
  const message = `Hello,
  
      We noticed you tried to contact us but are not registered on our platform. Please use the following link to register:
          
      ${registrationLink}
          
      Thank you,
      WON Platform Team`

  const authClient = await authorize();
  // Set up Gmail API with the OAuth2 client
  async function sendEmail(auth, to, subject, body) {
    const gmail = google.gmail({ version: 'v1', auth });
    const rawMessage = [
      'Content-Type: text/plain; charset="UTF-8"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,
      `Subject: ${subject}\n\n`,
      `${body}`,
    ].join('');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return res.data;
  }

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('Error sending email:', error);
      }
      // console.log('Email sent:', info.response);
    });
    res.status(200).send({ message: 'Registration email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Failed to send email' });
  }
}

// Endpoint to send an automated registration email
const sendEmailToAnyone = async (req, res) => {
  const mailOptions = req.body;
  // console.log(mailOptions)

  if (!mailOptions) {
    return res.status(400).send({ error: 'Email and mailOptions are required ' });
  }

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('Error sending email:', error);
      }
      // console.log('Email sent:', info.response);
    });
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Failed to send email' });
  }
}

// api to get username by email id
const getUsernameByEmail = async (req, res) => {
  const { userMail } = req.body
  const query = `SELECT username FROM wonhubs.users WHERE email = '${userMail}'`
  connection.query(query, (error, result) => {
    if (error) {
      console.log(error);
    }
    res.send({ username: result[0].username })
  })
}

const recieveDemoRequest = async (req, res) => {
  const { email, companyName, description, firstName, lastName, phoneNumber, purpose } = req.body

  const mailOptions = {
    from: process.env.ORG_EMAIL,
    to: 'sales@nowitservices.com',
    subject: 'Demo Request',
    html: `<!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #de7309;
            color: white;
            padding: 20px;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
          }
          .logo {
            height: 40px;
            margin-right: 15px;
          }
          .content {
            padding: 20px;
            font-size: 14px;
            color: #333;
          }
          .field {
            margin-bottom: 12px;
          }
          .label {
            font-weight: bold;
            display: inline-block;
            width: 130px;
          }
          .value a {
            color: #003f7f;
            text-decoration: none;
          }
          .footer {
            padding: 15px;
            font-size: 12px;
            color: #666;
            background-color: #f0f0f0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img
              class="logo"
              src="https://res.cloudinary.com/drtguvwir/image/upload/v1723878315/WON-Platform-Images/eurmlmdcs6exyfbtkh9o.png"
              alt="WONHUBS Logo"
            />
            New Demo Request - WONHUBS
          </div>
          <div class="content">
            <p>Hello Team,</p>
            <p>A user has reached out for more information. Below are the submitted details:</p>

            <div class="field">
              <span class="label">Full Name:</span>
              <span class="value">${firstName} ${lastName}</span>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${email}">${email}</a></span>
            </div>
            <div class="field">
              <span class="label">Contact:</span>
              <span class="value">${phoneNumber}</span>
            </div>
            <div class="field">
              <span class="label">Organisation:</span>
              <span class="value">${companyName}</span>
            </div>
            <div class="field">
              <span class="label">Looking For:</span>
              <span class="value">${purpose?.value}</span>
            </div>
            <div class="field">
              <span class="label">Time to Contact:</span>
              <span class="value">${description}</span>
            </div>

            <p style="margin-top: 20px;">Please follow up with the user at your earliest convenience.</p>
          </div>
          <div class="footer">
            © 2025 WONHUBS. All rights reserved.
          </div>
        </div>
      </body>
    </html>
 `,
    text: `Email: ${email}\nCompany Name: ${companyName}\nDescription: ${description}\nFirst Name: ${firstName}\nLast Name: ${lastName}\nPhone Number: ${phoneNumber}\nPurpose: ${purpose}`
  }

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('Error sending email:', error);
      }
      // console.log('Email sent:', info.response);
    });
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Failed to send email' });
  }
}

const checkEmailExists = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ exists: false, error: 'Email is required' });
  }
  try {
    const query = `SELECT 1 FROM users WHERE email = '${email}' LIMIT 1`;
    const [users] = await db.execute(query)

    res.json({ exists: users.length > 0 });
  } catch (error) {
    console.log(error)
    res.status(500).json({ exists: false, error: 'Internal server error' });
  }
};

const groupEmailsCheck = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ exists: false, error: 'Email is required' });
  }
  try {
    const query = `SELECT 1 FROM group_names WHERE email = '${email}' LIMIT 1`;
    const [users] = await db.execute(query)

    res.json({ exists: users.length > 0 });
  } catch (error) {
    console.log(error)
    res.status(500).json({ exists: false, error: 'Internal server error' });
  }
};



// app.post('/api/security-groups', 
const createSecurityGroup = async (req, res) => {
  const { name, description, region, vpcId } = req.body;
  const client = ec2Client(region);

  try {
    const result = await client.send(
      new CreateSecurityGroupCommand({
        GroupName: name,
        Description: description,
        VpcId: vpcId,
      })
    );

    res.json({ groupId: result.GroupId });
  } catch (error) {
    console.error('Failed to create SG:', error);
    res.status(500).json({ error: 'Failed to create security group' });
  }
};


const createInboudOutboundRules = async (req, res) => {
  const securityGroupId = 'sg-0abc123def4567890';
  const client = ec2Client('your-region');

  try {
    await client.send(
      new AuthorizeSecurityGroupIngressCommand({
        GroupId: securityGroupId,
        IpPermissions: [
          {
            IpProtocol: 'tcp',
            FromPort: 22,
            ToPort: 22,
            IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'Allow SSH' }],
          },
          {
            IpProtocol: 'tcp',
            FromPort: 80,
            ToPort: 80,
            IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'Allow HTTP' }],
          },
          {
            IpProtocol: 'tcp',
            FromPort: 443,
            ToPort: 443,
            IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'Allow HTTPS' }],
          },
        ],
      })
    );

    await client.send(
      new AuthorizeSecurityGroupEgressCommand({
        GroupId: securityGroupId,
        IpPermissions: [
          {
            IpProtocol: '-1',
            IpRanges: [{ CidrIp: '0.0.0.0/0' }],
          },
        ],
      })
    );

    res.status(200).json({ message: 'Rules created successfully' });
  } catch (error) {
    console.error('Error setting SG rules:', error);
    res.status(500).json({ error: 'Failed to set rules' });
  }
};


const createEC2Instance = async (req, res) => {
  const {
    fullName,
    email,
    companyName,
    userCount,
    instanceType,
    region,
    appName,
    environment,
    storage,
    security_group,
    useCase,
  } = req.body;

  const client = ec2Client(region);

  const userDataScript = `
    #!/bin/bash
    sudo apt install openjdk-17-jdk -y
    sudo apt update -y
    sudo apt install -y git nodejs npm
    sudo apt install docker.io 
    sudo usermod -aG docker ubuntu
    git clone https://github.com/Kartheek5922/WON-HUB.git /opt/${appName}
    cd wonhub
    npm install --legacy-peer-deps
    npm run dev
  `;
  const userDataEncoded = Buffer.from(userDataScript).toString('base64');

  const params = {
    ImageId: process.env.AWS_AMI_ID,
    InstanceType: instanceType,
    MinCount: 1,
    MaxCount: 1,
    KeyName: 'YOUR_KEY_NAME', // Do not pass content of PEM file
    SecurityGroupIds: [security_group],
    UserData: userDataEncoded,
    BlockDeviceMappings: [
      {
        DeviceName: '/dev/xvda',
        Ebs: {
          VolumeSize: Number(storage),
          VolumeType: 'gp2',
        },
      },
    ],
    TagSpecifications: [
      {
        ResourceType: 'instance',
        Tags: [
          { Key: 'AppName', Value: appName },
          { Key: 'Environment', Value: environment },
          { Key: 'Company', Value: companyName },
        ],
      },
    ],
  };

  try {
    const result = await client.send(new RunInstancesCommand(params));
    const instance = result.Instances[0];
    res.status(201).json({ message: 'Instance launching', instanceId: instance.InstanceId });
  } catch (error) {
    console.error('Launch failed:', error);
    res.status(500).json({ error: 'EC2 launch failed' });
  }
};

async function checkStatus(instanceId, region) {
  const client = ec2Client(region);
  const result = await client.send(
    new DescribeInstancesCommand({ InstanceIds: [instanceId] })
  );
  return result.Reservations[0].Instances[0].State.Name;
}

// function to get emails in the  groups and Users
const getAllEmails = async (req, res) => {
  try {
    const query = `
      SELECT email FROM users
      UNION ALL
      SELECT email FROM group_names
    `;

    const [rows] = await db.execute(query);

    const emails = rows.map(r => r.email);

    res.json({
      emails,
      count: emails.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};




module.exports = {
  readMails,
  sendOtpViaEmail,
  sendRegistrationEmail,
  sendEmailToAnyone,
  getUsernameByEmail,
  recieveDemoRequest,
  createEC2Instance,
  checkEmailExists,
  groupEmailsCheck,
  getAllEmails
};