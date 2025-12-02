/**
 * Environment Variables Validation
 * Validates required environment variables at startup
 */

const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const optionalEnvVars = {
    PORT: 3000,
    NODE_ENV: 'development',
    JWT_EXPIRES_IN: '7d',
    FRONTEND_URL: '*',
  };
  
  export const validateEnv = () => {
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
  
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:');
      missing.forEach((key) => console.error(`   - ${key}`));
      console.error(
        '\n💡 Please check your .env file or environment configuration.'
      );
      process.exit(1);
    }
  
    // Set default values for optional env vars
    Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
      if (!process.env[key]) {
        process.env[key] = defaultValue;
      }
    });
  
    console.log('✅ Environment variables validated');
  };
  