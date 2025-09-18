#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment from root .env file
const loadRootEnv = () => {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
        return {};
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};

    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                env[key.trim()] = valueParts.join('=').trim();
            }
        }
    });

    return env;
};

// Generate backend .env from root config
const generateBackendEnv = (rootEnv) => {
    const backendPort = rootEnv.BACKEND_PORT || rootEnv.API_PORT || '5003';
    const frontendPort = rootEnv.FRONTEND_PORT || '3000';

    return `# Server Configuration (Auto-generated from root .env)
PORT=${backendPort}
NODE_ENV=${rootEnv.NODE_ENV || 'development'}

# CORS Configuration
CORS_ORIGIN=http://localhost:${frontendPort}

# Upload Configuration
MAX_FILE_SIZE=${rootEnv.MAX_FILE_SIZE || '200'}
UPLOAD_PATH=${rootEnv.UPLOAD_PATH || 'uploads/upload'}
DOWNLOAD_PATH=${rootEnv.DOWNLOAD_PATH || 'uploads/download'}

# Cleanup Configuration
CLEANUP_INTERVAL_MINUTES=${rootEnv.CLEANUP_INTERVAL_MINUTES || '10'}
MAX_AGE_HOURS=${rootEnv.MAX_AGE_HOURS || '1'}
DELETION_DELAY_MINUTES=${rootEnv.DELETION_DELAY_MINUTES || '1'}
`;
};

// Generate frontend .env from root config
const generateFrontendEnv = (rootEnv) => {
    const apiPort = rootEnv.BACKEND_PORT || rootEnv.API_PORT || '5003';
    const apiHost = rootEnv.API_HOST || 'localhost';
    const frontendPort = rootEnv.FRONTEND_PORT || '3000';

    return `# Frontend Configuration (Auto-generated from root .env)
# Backend API Configuration
API_HOST=${apiHost}
API_PORT=${apiPort}
API_URL=http://${apiHost}:${apiPort}

# Frontend Dev Server
FRONTEND_PORT=${frontendPort}

# Production Configuration
${rootEnv.PROD_API_URL ? `PROD_API_URL=${rootEnv.PROD_API_URL}` : '# PROD_API_URL=https://api.yourdomain.com'}
`;
};

// Main execution
const main = () => {
    console.log('🔧 Setting up environment files from root .env...');

    // Check if root .env exists
    const rootEnvPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(rootEnvPath)) {
        console.log('❌ Root .env file not found. Creating from .env.example...');
        const examplePath = path.join(__dirname, '..', '.env.example');
        if (fs.existsSync(examplePath)) {
            fs.copyFileSync(examplePath, rootEnvPath);
            console.log('✅ Created .env from .env.example');
        } else {
            console.log('❌ .env.example not found either!');
            return;
        }
    }

    const rootEnv = loadRootEnv();

    // Generate backend .env
    const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
    const backendEnvContent = generateBackendEnv(rootEnv);
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ Generated backend/.env');

    // Generate frontend .env
    const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
    const frontendEnvContent = generateFrontendEnv(rootEnv);
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Generated frontend/.env');

    console.log('');
    console.log('🎯 Configuration Summary:');
    console.log(`📱 Frontend Port: ${rootEnv.FRONTEND_PORT || '3000'}`);
    console.log(`🔗 Backend Port:  ${rootEnv.BACKEND_PORT || rootEnv.API_PORT || '5003'}`);
    console.log(`🌍 Environment:   ${rootEnv.NODE_ENV || 'development'}`);
    console.log('');
    console.log('💡 To change ports, edit root .env file and run: npm run setup:env');
};

if (require.main === module) {
    main();
}

module.exports = { loadRootEnv, generateBackendEnv, generateFrontendEnv };