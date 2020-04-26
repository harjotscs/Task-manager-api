const nodemailer=require('nodemailer')

  let transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS 
    }
  });


  
  const welcomeEmail=(async(email,name)=>{
    let info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: email, 
        subject: `Welcome ${name}`, 
        text: `Hi ${name}, I Loved that You Signed Up For this app, Thanks for your time `, // plain text body
        // html: "<b>Hello world?</b>" 
      });
    
      console.log("Message sent: %s", info.messageId);
      
  })

  const goodByeEmail=(async(email,name)=>{
    let info = await transporter.sendMail({
        from: 'coderharjot@gmail.com',
        to: email, 
        subject: `Good Bye ${name}`, 
        text: `Hi ${name}, I Loved that You Spent a Lot of time with this app this is last email to tell you that your account is cancelled as per your request `, // plain text body
        // html: "<b>Hello world?</b>" 
      });
    
      console.log("Message sent: %s", info.messageId);
  })
  
  module.exports={
      welcomeEmail,
      goodByeEmail
  }
