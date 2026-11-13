# Авторизация в NextPro

Better Auth работает **внутри Convex** (`convex/auth.ts`). Next.js только проксирует запросы `/api/auth/*` в Convex (`app/api/auth/[...all]/route.ts`).

## Сценарии

### Регистрация
1. `/auth/signup` → `authClient.signUp.email()`.
2. Сервер создаёт пользователя с `emailVerified: false` **без сессии** и сам отправляет 6-значный код (`emailVerification.sendOnSignUp`).
3. Email сохраняется в `sessionStorage` (не в URL), переход на `/auth/verify-email`.
4. `authClient.emailOtp.verifyEmail()` → email подтверждён, сессия создаётся автоматически (`autoSignInAfterVerification`).

Если email уже занят, сервер отвечает так же, как при успехе (чтобы нельзя было узнать, зарегистрирован ли адрес), а владельцу приходит письмо «кто-то пытался зарегистрироваться».

### Вход (пароль + двухфакторная аутентификация)
1. `authClient.signIn.email()`.
2. Если email не подтверждён → `403 EMAIL_NOT_VERIFIED`, сервер отправляет новый код, форма переводит на `/auth/verify-email`. **Без подтверждения войти нельзя.**
3. Если пароль верный, сервер **не выдаёт сессию**, а отвечает `{ twoFactorRedirect: true }` и ставит временную cookie `two_factor` (10 минут).
4. Форма вызывает `authClient.twoFactor.sendOtp()` (код на почту, живёт 5 минут) и переводит на `/auth/two-factor`.
5. `authClient.twoFactor.verifyOtp({ code, trustDevice })` → сессия выдаётся только сейчас.
6. Галочка «Trust this device for 30 days» ставит подписанную cookie: на этом устройстве код не спрашивается 30 дней.

2FA **обязательна для всех**: включается при регистрации (`databaseHooks.user.create`), отключить нельзя (`/two-factor/disable` закрыт). Вход по одному только коду из письма (`/sign-in/email-otp`) тоже закрыт, иначе он обходил бы пароль.

### Забыли пароль
1. `/auth/forgot-password` → `authClient.emailOtp.requestPasswordReset({ email })`. Ответ всегда `success`, даже если аккаунта нет.
2. Код + новый пароль → `authClient.emailOtp.resetPassword({ email, otp, password })`.
3. Все сессии пользователя отзываются, приходит письмо «пароль изменён».

### Выход
Кнопка «Log out» в навбаре → `authClient.signOut()` → редирект на главную.

## Защита

| Что | Как |
|---|---|
| Пароль | 8–128 символов, заглавная, строчная, цифра. Проверяется на клиенте **и на сервере** (hook в `convex/auth.ts`), включая сброс пароля |
| OTP | 6 цифр, хранится в БД **хешированным**, 5 неверных попыток → код аннулируется. Подтверждение email и сброс пароля — 10 минут, код входа (2FA) — 5 минут |
| 2FA | Сессия выдаётся только после кода из письма; `verify-email` запрещён для уже подтверждённых аккаунтов (иначе код подтверждения давал бы вход без пароля) |
| Перебор | Rate limit в БД Convex: вход 5/мин, регистрация 3/мин, проверка кода 5/мин, отправка кода 3/мин (то же для 2FA) |
| IP для rate limit | Next передаёт IP клиента в заголовке, подписанном `AUTH_PROXY_SECRET`; без верного секрета заголовок игнорируется |
| Перечисление аккаунтов | Регистрация и сброс пароля не раскрывают, существует ли email |
| Сессия | HttpOnly cookie, 7 дней, продлевается раз в сутки |

## Переменные окружения

**Convex** (`npx convex env set ...`):
- `BETTER_AUTH_SECRET`, `SITE_URL`
- `RESEND_API_KEY`
- `AUTH_PROXY_SECRET` — то же значение, что в `.env.local`
- `EMAIL_FROM` — отправитель с вашего домена (по умолчанию `onboarding@resend.dev`)
- `EMAIL_OVERRIDE_TO` — **только для dev**: все письма уходят на этот адрес (тестовый отправитель Resend доставляет только владельцу аккаунта). В production не задавать.

**Next.js** (`.env.local`): `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_PROXY_SECRET`.

## Файлы

```
convex/auth.ts                      конфиг Better Auth (правила, лимиты, OTP)
convex/email.ts                     отправка писем через Resend
convex/http.ts                      роуты + проверка подписанного IP
app/api/auth/[...all]/route.ts      прокси Next → Convex
app/schemas/auth.ts                 zod-схемы (общие для клиента и сервера)
components/web/signup-form.tsx
components/web/login-form.tsx
components/web/email-otp-verification.tsx
components/web/forgot-password-form.tsx
components/web/two-factor-verification.tsx   страница ввода кода 2FA
components/web/otp-field.tsx
lib/auth-errors.ts                  понятные сообщения об ошибках
```

## Версии

`better-auth` закреплён на `1.7.21`: в 1.7.22 проверка OTP делает запрос, который не поддерживает адаптер `@convex-dev/better-auth@0.13.0`. Перед обновлением проверьте совместимость.
