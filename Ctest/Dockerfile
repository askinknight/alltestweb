FROM debian:latest

# ติดตั้งแพ็กเกจที่จำเป็น
RUN apt-get update && apt-get install -y \
    gcc \
    libmicrohttpd-dev \
    libmariadb-dev \
    default-libmysqlclient-dev

# กำหนดโฟลเดอร์ทำงานให้ตรงกับโค้ดของคุณ
WORKDIR /app

# คัดลอกโค้ดทั้งหมดเข้า container
COPY . .

# คอมไพล์ server.c
RUN gcc server.c -o server -lmicrohttpd -lmariadb -I/usr/include/mariadb

# กำหนดสิทธิ์ให้ไฟล์ `server` สามารถรันได้
RUN chmod +x server

# รันเซิร์ฟเวอร์
CMD ["./server"]
