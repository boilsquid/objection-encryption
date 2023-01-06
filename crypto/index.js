const crypto = require('crypto');

const generateIv = () => {
  return crypto.randomBytes(16);
}

module.exports = (key, algorithm) => {
  
  const encrypt = (str) => {
    const iv = generateIv()
    const cipher = crypto.createCipheriv(algorithm, key, iv);
  
    let enc1 = cipher.update(str, 'utf8');
    let enc2 = cipher.final();
    let cipherText = algorithm === 'aes-256-gcm' ? Buffer.concat([enc1, enc2, cipher.getAuthTag()]) : Buffer.concat([enc1, enc2])
    return `enc:v1:${iv.toString('base64')}:${cipherText.toString("base64")}`;
  };
  
  const decrypt = (enc) => {
    let cipherText;
    
    const parts = enc.split(':');
    const iv = Buffer.from(parts[2], 'base64');
    const encValue = Buffer.from(parts[3], 'base64')
    const decipher = crypto.createDecipheriv(algorithm, key, iv);;

    if (algorithm === 'aes-256-gcm') {
      authTag = encValue.subarray(encValue.length - 16);
      cipherText = encValue.subarray(0, encValue.length - 16);
      decipher.setAuthTag(authTag);
    } else {
      cipherText = encValue;

    }

    let str = decipher.update(cipherText, null, 'utf8');
    str += decipher.final('utf8');
    return str;
  };
  
  return {
    encrypt, 
    decrypt
  };
}