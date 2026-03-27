const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();

const fs = require('fs');
const out = `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\nVAPID_SUBJECT=mailto:kitrileysagusay45@gmail.com`;
fs.writeFileSync('vapid.txt', out);
console.log('VAPID keys written to vapid.txt');
