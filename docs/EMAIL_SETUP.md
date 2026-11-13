# 📧 Настройка Email OTP - Пошаговая Инструкция

## 🚀 Быстрый Старт с Resend (Рекомендуется)

### Шаг 1: Установить пакет Resend

```bash
pnpm add resend
```

### Шаг 2: Получить API ключ

1. Перейти на https://resend.com
2. Создать аккаунт (если нет)
3. Перейти в API Keys: https://resend.com/api-keys
4. Создать новый ключ
5. Скопировать ключ (выглядит как `re_xxxxxxxxxxxxx`)

### Шаг 3: Добавить переменную окружения

Better Auth работает внутри Convex (`convex/auth.ts`), поэтому ключ нужно задать в окружении **Convex**, а не только в `.env.local`:

```bash
npx convex env set RESEND_API_KEY re_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Шаг 4: Sender Email

По умолчанию письма отправляются с `onboarding@resend.dev`. В этом тестовом режиме Resend доставляет письма **только на email, с которым вы зарегистрировались в Resend**.

Для разработки можно перенаправить все письма на свой адрес (в теме будет указан исходный получатель):

```bash
npx convex env set EMAIL_OVERRIDE_TO you@example.com
```

Чтобы отправлять письма на любые адреса, верифицируйте свой домен в Resend, удалите `EMAIL_OVERRIDE_TO` (`npx convex env remove EMAIL_OVERRIDE_TO`) и задайте:

```bash
npx convex env set EMAIL_FROM "noreply@yourdomain.com"
```

## 🧪 Тестирование

### Локальное тестирование:

1. Установить зависимости:
```bash
pnpm install
```

2. Убедиться, что `RESEND_API_KEY` в `.env.local`

3. Запустить dev сервер:
```bash
pnpm dev
```

4. Перейти на http://localhost:3000/auth/signup

5. Заполнить форму:
   - Name: Test User
   - Email: ваш реальный email
   - Password: TestPass123

6. Нажать "Sign Up"

7. Проверить вашу почту на письмо с кодом

8. Скопировать код из письма

9. Вернуться в браузер и вставить код

10. Нажать "Verify Email"

## 📧 Альтернативные Email Провайдеры

### Option 1: Gmail SMTP

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD, // App password, не обычный пароль!
  },
});

async sendVerificationOTP({ email, code, type }) {
  await transporter.sendMail({
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: "Your verification code",
    html: `<h1>${code}</h1>`,
  });
}
```

### Option 2: SendGrid

```typescript
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async sendVerificationOTP({ email, code, type }) {
  await sgMail.send({
    to: email,
    from: "noreply@yourdomain.com",
    subject: "Your verification code",
    html: `<h1>${code}</h1>`,
  });
}
```

### Option 3: AWS SES

```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({ region: "us-east-1" });

async sendVerificationOTP({ email, code, type }) {
  const command = new SendEmailCommand({
    Source: "noreply@yourdomain.com",
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Your verification code" },
      Body: { Html: { Data: `<h1>${code}</h1>` } },
    },
  });

  await client.send(command);
}
```

## 🔍 Troubleshooting

### Письма не приходят

**Проверить:**

1. ✅ Правильный API ключ в `.env.local`
2. ✅ Email адрес верифицирован в Resend
3. ✅ From email совпадает с registered domain
4. ✅ Посмотреть в spam/junk папке
5. ✅ Перезагрузить dev сервер после изменения `.env.local`

### Ошибка: "RESEND_API_KEY is not set"

```
Решение: Добавить RESEND_API_KEY в .env.local и перезагрузить сервер
```

### Ошибка: "Invalid email address"

```
Решение: Email адрес не верифицирован в Resend
Нужно: Перейти в Resend → Verified Senders → добавить email
```

### Ошибка при отправке OTP

```
Проверить:
1. RESEND_API_KEY валидный
2. Email sender зарегистрирован
3. Network соединение доступно
4. Resend сервис работает (проверить статус)
```

## 📝 Email Шаблон (Кастомизация)

Обновить HTML шаблон в `lib/auth-server.ts`:

```typescript
html: `
  <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
    <h2>Verify Your Email</h2>
    <p>Your verification code:</p>
    
    <div style="
      background: #f0f0f0;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
    ">
      <h1 style="
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 8px;
        margin: 0;
      ">
        ${code}
      </h1>
    </div>
    
    <p>Code expires in <strong>15 minutes</strong></p>
    <p style="color: #666; font-size: 12px;">
      If you didn't request this, ignore this email.
    </p>
  </div>
`,
```

## 🚀 Production Deployment

### Vercel + Resend

1. Установить переменную в Vercel:
   - Project Settings → Environment Variables
   - Добавить `RESEND_API_KEY`
   - Значение: скопировать из Resend

2. Redeploy проект

3. Тестировать на production URL

## ✅ Checklist

- [ ] Установлен `pnpm add resend`
- [ ] Создан аккаунт на https://resend.com
- [ ] Получен RESEND_API_KEY
- [ ] Добавлен ключ в `.env.local`
- [ ] Email sender верифицирован в Resend
- [ ] Dev сервер перезагружен
- [ ] Отправлено тестовое письмо
- [ ] Код получен и верифицирован
- [ ] Тестирование завершено успешно ✨

## 📚 Дополнительно

- [Resend Documentation](https://resend.com/docs)
- [Better Auth Email OTP](https://better-auth.com/docs/plugins/email-otp)
- [Email Best Practices](https://www.emailonacid.com/resource/guide-to-email-best-practices/)
