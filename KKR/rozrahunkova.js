const crypto = require("crypto");

class Device {
  constructor(name) {
    this.name = name;
    this.handshakeInfo = null;
    this.secretKey = null;
    this.sentData = null;
    this.receivedData = null;
  }

  // Генерація секретного ключа
  generateSecretKey() {
    return crypto.randomBytes(32);
  }

  // Рукостискання
  performHandshake(otherDevice) {
    console.log(`${this.name} рукостискання з ${otherDevice.name}`);
    this.handshakeInfo = { deviceID: Math.floor(Math.random() * 1000) + 1 };
    this.secretKey = this.generateSecretKey();
    console.log(
      `${this.name} - Згенеровано секретний ключ: ${this.secretKey.toString(
        "hex"
      )}`
    );
  }

  initiateHandshake(otherDevice) {
    this.performHandshake(otherDevice);
  }

  respondToHandshake(otherDevice) {
    // Виправлення: Відповідаючи на рукостискання, використовуйте той же секретний ключ
    this.handshakeInfo = otherDevice.handshakeInfo;
    this.secretKey = otherDevice.secretKey;
    console.log(
      `${this.name} відповідає на рукостискання від ${otherDevice.name}`
    );
  }

  // Перевірка рукостискання
  verifyHandshake(otherDevice) {
    return (
      this.handshakeInfo &&
      otherDevice.handshakeInfo &&
      this.handshakeInfo.deviceID === otherDevice.handshakeInfo.deviceID &&
      this.secretKey !== null &&
      otherDevice.secretKey !== null &&
      this.secretKey.equals(otherDevice.secretKey)
    );
  }

  // Шифрування даних
  encryptData(data) {
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      this.secretKey,
      Buffer.alloc(16, 0)
    );
    let encryptedData = cipher.update(data, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData;
  }

  // Розшифрування даних
  decryptData(encryptedData) {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.secretKey,
      Buffer.alloc(16, 0)
    );
    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf-8");
    return decryptedData;
  }

  // Обмін даними
  exchangeData(otherDevice, data) {
    if (this.verifyHandshake(otherDevice)) {
      console.log(`${this.name} обмінюється даними з ${otherDevice.name}`);
      this.sentData = data;
      const encryptedData = this.encryptData(data);
      otherDevice.receivedData = otherDevice.decryptData(encryptedData);
      console.log(
        `Дані обмінено: ${this.name} - ${this.sentData}, ${otherDevice.name} - ${otherDevice.receivedData}`
      );
    } else {
      console.log(
        `Помилка: не вдалося обмінятися даними. Рукостискання не встановлене.`
      );
    }
  }
}

const sharedCrypto = crypto;

const device1 = new Device("Пристрій 1");
const device2 = new Device("Пристрій 2");

// іцініалізація та відповідь на рукостискання
device1.initiateHandshake(device2);
device2.respondToHandshake(device1);

// Перевірка успішності рукостискання
if (device1.verifyHandshake(device2)) {
  console.log("Рукостискання успішне. З'єднання встановлене.");
  // Обмін даними
  device1.exchangeData(device2, "Секретна інформація");
} else {
  console.log("Помилка рукостискання. З'єднання не встановлене.");
}
