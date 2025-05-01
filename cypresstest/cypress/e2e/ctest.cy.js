describe('Login and Register Test', () => {
  it('should show login page and login successfully', () => {
    // เข้าสู่หน้า login
    cy.visit('http://localhost:7071', { timeout: 10000 });

    // กรอกข้อมูลในฟอร์ม login
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('testpassword');
    cy.get('button[type="submit"]').click();

    // ปิดการแสดง alert เพื่อไม่ให้หยุดการทดสอบ
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Login successful!');  // ปรับข้อความ alert ตามที่แสดงในระบบ
      return true;  // ปิดการแสดง alert
    });

    // ตรวจสอบว่า redirect ไปที่หน้า /home หลังจาก login สำเร็จ
    cy.url().should('include', '/home');
  });

  it('should show error alert for invalid login', () => {
    // เข้าสู่หน้า login
    cy.visit('http://localhost:7071', { timeout: 10000 });

    // กรอกข้อมูลผิดเพื่อทดสอบ login
    cy.get('input[name="username"]').type('wronguser');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // ปิดการแสดง alert เพื่อไม่ให้หยุดการทดสอบ
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Invalid login credentials!');
    });
  });

  it('should show session expired alert and redirect to login page', () => {
    // เข้าถึงหน้า /home โดยไม่ล็อกอินหรือ session หมดอายุ
    cy.visit('http://localhost:7071/home', { failOnStatusCode: false, timeout: 10000 });

    // ตรวจสอบว่าแสดง alert เกี่ยวกับ session expired
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.contains('Session expired! Please login again.');
    });

    // ตรวจสอบว่า URL เปลี่ยนไปที่หน้า login
    cy.url().should('include', '/');
  });

  it('should show register page and register successfully', () => {
    // เข้าสู่หน้า register
    cy.visit('http://localhost:7071/register', { timeout: 10000 });

    // กรอกข้อมูลสำหรับการลงทะเบียน
    cy.get('input[name="username"]').type('newuser');
    cy.get('input[name="password"]').type('newpassword');
    cy.get('button[type="submit"]').click();

    // ปิดการแสดง alert เพื่อไม่ให้หยุดการทดสอบ
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Registration successful!');
    });

    // ตรวจสอบว่า redirect ไปที่หน้า login หลังจากลงทะเบียนสำเร็จ
    cy.url().should('include', '/login');
  });
});
