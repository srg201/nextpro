# 🔐 Двухфакторная Аутентификация и Подтверждение Email - Пошаговый Гайд

## 📋 Архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                    РЕГИСТРАЦИЯ (Sign Up)                        │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 1: Заполнить форму регистрации                              │
│ - Имя, Email, Пароль                                             │
│ Компонент: components/web/signup-form.tsx                        │
└──────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 2: Создать аккаунт через authClient.signUp.email()          │
│ - Посылается: { name, email, password }                          │
│ - Возвращается: { user, token }                                  │
└──────────────────────────────────────────────────────────────────┘
  ↓ (Если успешно)
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 3: Отправить OTP код на email                               │
│ - authClient.emailOtp.sendVerificationOtp({                      │
│     email,                                                        │
│     type: "email-verification"                                   │
│   })                                                              │
│ - Пользователь получает письмо с 6-значным кодом               │
└──────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 4: Редирект на страницу верификации                         │
│ - URL: /auth/verify-email?email=user@example.com               │
│ - Компонент: app/auth/verify-email/page.tsx                    │
└──────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 5: Ввести 6-значный OTP код                                 │
│ - Input OTP компонент: components/ui/input-otp.tsx              │
│ - Пользователь видит 6 полей ввода: [_] [_] [_] [_] [_] [_]   │
└──────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 6: Верифицировать OTP код                                   │
│ - authClient.emailOtp.verifyEmail({                              │
│     email,                                                        │
│     otp                                                           │
│   })                                                              │
│ - Если верно → Email подтвержден                                │
│ - Если неверно → Показать ошибку                                │
└──────────────────────────────────────────────────────────────────┘
  ↓ (Если успешно)
┌──────────────────────────────────────────────────────────────────┐
│ ✅ Аккаунт активирован! Редирект на главную страницу            │
└──────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    ВХОД (Sign In) с 2FA                          │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 1: Ввести Email и Пароль                                     │
│ Компонент: components/web/login-form.tsx                         │
└──────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 2: Проверить Email и Пароль                                 │
│ - authClient.signIn.email({ email, password })                  │
│ - Если валидны → Отправить OTP код                              │
│ - Если невалидны → Показать ошибку                              │
└──────────────────────────────────────────────────────────────────┘
  ↓ (Если успешно)
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 3: Отправить OTP код для 2FA                                │
│ - authClient.emailOtp.sendVerificationOtp({                      │
│     email,                                                        │
│     type: "sign-in"                                              │
│   })                                                              │
│ - Пользователь получает письмо с кодом                          │
└──────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 4: Редирект на страницу 2FA                                 │
│ - URL: /auth/login-2fa?email=user@example.com                  │
│ - Компонент: app/auth/login-2fa/page.tsx                       │
└──────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 5: Ввести OTP код для завершения входа                      │
│ - Input OTP компонент: components/ui/input-otp.tsx              │
└──────────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────────┐
│ Шаг 6: Верифицировать OTP код для 2FA                           │
│ - authClient.emailOtp.verifyEmail({                              │
│     email,                                                        │
│     otp                                                           │
│   })                                                              │
└──────────────────────────────────────────────────────────────────┘
  ↓ (Если успешно)
┌──────────────────────────────────────────────────────────────────┐
│ ✅ 2FA пройдена! Редирект на главную страницу                   │
└──────────────────────────────────────────────────────────────────┘
```

## 🔧 Установленные Компоненты

### 1. **Input OTP Компонент** `components/ui/input-otp.tsx`
```typescript
// Использование:
<InputOTP maxLength={6} value={otp} onChange={setOtp}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```
- **Особенности:**
  - 6 полей ввода
  - Автоматическое перемещение между полями
  - Визуальный курсор при активности
  - Кольцо фокуса для доступности

### 2. **Email OTP Verification Компонент** `components/web/email-otp-verification.tsx`
```typescript
// После регистрации
<EmailOTPVerification 
  email="user@example.com" 
  onSuccess={() => { /* ... */ }}
/>
```
- **Функции:**
  - Ввод OTP кода
  - Верификация кода
  - Переотправка кода
  - Обработка ошибок

### 3. **Login OTP Verification Компонент** `components/web/login-otp-verification.tsx`
```typescript
// При входе с 2FA
<LoginOTPVerification 
  email="user@example.com" 
  onSuccess={() => { /* ... */ }}
/>
```
- **Функции:**
  - Ввод OTP для 2FA
  - Верификация 2FA кода
  - Переотправка кода
  - Обработка ошибок при входе

## 📱 Страницы

### `/auth/verify-email?email=...`
- **Цель:** Верификация email после регистрации
- **Компонент:** `app/auth/verify-email/page.tsx`
- **Параметры:**
  - `email` - email адрес для верификации
- **Поток:**
  1. Пользователь видит сообщение "Мы отправили код на ваш email"
  2. Пользователь вводит 6-значный код
  3. Нажимает "Verify Email"
  4. Если верно → Редирект на главную
  5. Если неверно → Показать ошибку

### `/auth/login-2fa?email=...`
- **Цель:** Двухфакторная аутентификация при входе
- **Компонент:** `app/auth/login-2fa/page.tsx`
- **Параметры:**
  - `email` - email адрес для 2FA
- **Поток:**
  1. Пользователь видит "Enter the code sent to your email"
  2. Пользователь вводит код из письма
  3. Нажимает "Verify Code"
  4. Если верно → Полный вход в систему
  5. Если неверно → Попробовать снова

## 🔌 API Методы

### `authClient.signUp.email(data, callbacks)`
**Для:** Создание нового аккаунта

```typescript
await authClient.signUp.email(
  { 
    name: "John", 
    email: "john@example.com", 
    password: "SecurePass123" 
  },
  {
    onRequest: () => {}, // При начале запроса
    onSuccess: () => {}, // При успехе
    onError: (ctx) => {} // При ошибке
  }
);
```

### `authClient.emailOtp.sendVerificationOtp(options)`
**Для:** Отправка OTP кода на email

```typescript
// Для верификации email после регистрации
await authClient.emailOtp.sendVerificationOtp({
  email: "john@example.com",
  type: "email-verification"
});

// Для 2FA при входе
await authClient.emailOtp.sendVerificationOtp({
  email: "john@example.com",
  type: "sign-in"
});
```

### `authClient.emailOtp.verifyEmail(data)`
**Для:** Верификация OTP кода

```typescript
const response = await authClient.emailOtp.verifyEmail({
  email: "john@example.com",
  otp: "123456"
});

if (response.error) {
  console.log("Неверный код:", response.error.message);
} else {
  console.log("Email верифицирован!");
}
```

## 📂 Структура Файлов

```
nextpro/
├── app/auth/
│   ├── verify-email/
│   │   └── page.tsx              ← Страница верификации email
│   ├── login-2fa/
│   │   └── page.tsx              ← Страница 2FA при входе
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── components/
│   ├── ui/
│   │   └── input-otp.tsx         ← OTP Input компонент
│   └── web/
│       ├── login-form.tsx        ← Форма входа
│       ├── signup-form.tsx       ← Форма регистрации
│       ├── email-otp-verification.tsx   ← Верификация email
│       └── login-otp-verification.tsx   ← Верификация 2FA
├── lib/
│   └── auth-client.ts            ← Конфигурация authClient с emailOtp
└── docs/
    └── 2FA_EMAIL_OTP_GUIDE.md    ← Этот файл
```

## 🔒 Безопасность

1. **OTP Коды:**
   - 6-значные коды
   - Срок действия (обычно 15-30 минут)
   - Отправляются по защищенному email

2. **Пароли:**
   - Минимум 8 символов
   - Требуют заглавную букву
   - Требуют строчную букву
   - Требуют цифру

3. **Tokens:**
   - JWT токены после верификации
   - Хранятся в secure cookies
   - Передаются через HTTPS только

## 🧪 Тестирование

### Сценарий 1: Регистрация с Верификацией Email
```
1. Перейти на /auth/signup
2. Заполнить форму:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPass123"
3. Нажать "Sign Up"
4. Ожидать redirect на /auth/verify-email?email=test@example.com
5. Открыть письмо и скопировать 6-значный код
6. Вставить код в Input OTP
7. Нажать "Verify Email"
8. Ожидать redirect на главную страницу
```

### Сценарий 2: Вход с 2FA
```
1. Перейти на /auth/login
2. Ввести:
   - Email: "test@example.com"
   - Password: "TestPass123"
3. Нажать "Sign In"
4. Ожидать redirect на /auth/login-2fa?email=test@example.com
5. Открыть письмо и скопировать код
6. Вставить код в Input OTP
7. Нажать "Verify Code"
8. Ожидать redirect на главную страницу
```

## 📚 Документация Better Auth

- [Email OTP Plugin](https://better-auth.com/docs/plugins/email-otp)
- [Better Auth Client](https://better-auth.com/docs/concepts/client)
- [Callbacks и Callbacks](https://better-auth.com/docs/concepts/callbacks)

## 🚀 Будущие Улучшения

- [ ] SMS OTP вместо email
- [ ] TOTP (Google Authenticator)
- [ ] Backup codes
- [ ] Remember device на 30 дней
- [ ] Rate limiting для OTP попыток
- [ ] Логирование попыток входа
