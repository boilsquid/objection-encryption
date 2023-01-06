const crypto = require('crypto');

const generateIv = () => {
  return crypto.randomBytes(16);
}

module.exports = (key) => {
  const encrypt = (str) => {
    const iv = generateIv()
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
    let enc1 = cipher.update(str, 'utf8');
    let enc2 = cipher.final();
  
    return `enc:v1:${iv.toString('base64')}:${Buffer.concat([enc1, enc2, cipher.getAuthTag()]).toString("base64")}`;
  };
  
  const decrypt = (enc) => {
    const parts = enc.split(':');
    const iv = Buffer.from(parts[2], 'base64');
    const encValue = Buffer.from(parts[3], 'base64')
    const tag = encValue.subarray(encValue.length - 16);
    const cipherText = encValue.subarray(0, encValue.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    let str = decipher.update(cipherText, null, 'utf8');
    str += decipher.final('utf8');
    return str;
  };
  
  return {
    encrypt, 
    decrypt
  };
}