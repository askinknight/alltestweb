# ใช้ Node.js image
FROM node:16

# กำหนด working directory
WORKDIR /app

# คัดลอก package.json และ package-lock.json มา
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์ทั้งหมดจากเครื่อง local ไปยัง container
COPY . .

# เปิดพอร์ตที่เว็บจะใช้งาน
EXPOSE 80

# รันคำสั่งเพื่อเริ่มต้นเซิร์ฟเวอร์
CMD ["node", "app.js"]
