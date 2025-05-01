FROM python:3.9-slim

WORKDIR /app

# ติดตั้ง Flask และ dependencies ที่จำเป็น
RUN pip install --no-cache-dir flask werkzeug

COPY . .

EXPOSE 8888

CMD ["python", "app.py"]
