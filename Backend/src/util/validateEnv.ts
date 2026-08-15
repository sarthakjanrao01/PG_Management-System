import { cleanEnv, port, str } from 'envalid';

export default cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
    PORT: port({ default: 5000 }),
    JWT_SECRET: str(),
    SESSION_SECRET: str(),
    RAZORPAY_KEY_ID: str({ default: "" }),
    RAZORPAY_SECRET: str({ default: "" }),
    FRONTEND_URL: str({ default: "" }),
});