#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read environment file
const loadEnv = (envPath) => {
    if (!fs.existsSync(envPath)) {
        console.log(`⚠️  Environment file not found: ${envPath}`);
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

// Update HTML meta tags
const updateHtmlMetaTags = (htmlPath, env) => {
    if (!fs.existsSync(htmlPath)) {
        console.log(`❌ HTML file not found: ${htmlPath}`);
        return;
    }

    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Update or add meta tags
    const metaTags = {
        'api-host': env.API_HOST || 'localhost',
        'api-port': env.API_PORT || '5002',
        'api-url': env.API_URL || `http://${env.API_HOST || 'localhost'}:${env.API_PORT || '5002'}`,
        'prod-api-url': env.PROD_API_URL || ''
    };

    Object.entries(metaTags).forEach(([name, content]) => {
        const metaRegex = new RegExp(`<meta name="${name}" content="[^"]*">`, 'g');
        const newMetaTag = `<meta name="${name}" content="${content}">`;

        if (htmlContent.match(metaRegex)) {
            htmlContent = htmlContent.replace(metaRegex, newMetaTag);
            console.log(`✅ Updated meta tag: ${name} = ${content}`);
        } else {
            // Add new meta tag after title
            const titleRegex = /<title>.*<\/title>/;
            htmlContent = htmlContent.replace(titleRegex, (match) => {
                return `${match}\n\n    <!-- Environment Configuration -->\n    ${newMetaTag}`;
            });
            console.log(`➕ Added meta tag: ${name} = ${content}`);
        }
    });

    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`✅ Updated HTML file: ${htmlPath}`);
};

// Main execution
const main = () => {
    const frontendDir = path.join(__dirname, '..');
    const envPath = path.join(frontendDir, '.env');
    const htmlPath = path.join(frontendDir, 'public', 'index.html');

    console.log('🔧 Updating frontend environment configuration...');

    const env = loadEnv(envPath);
    updateHtmlMetaTags(htmlPath, env);

    console.log('✅ Environment configuration updated!');
};

if (require.main === module) {
    main();
}

module.exports = { loadEnv, updateHtmlMetaTags };