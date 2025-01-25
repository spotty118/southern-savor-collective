# JavaScript Module MIME Type Debugging Guide

## Current Setup Analysis

The project uses Vite with TypeScript and React, which requires proper MIME type handling for:
- `.tsx` files during development
- `.js` files in production build
- External module scripts

## Common MIME Type Issues & Solutions

### 1. Development Server (Vite)

Vite automatically handles MIME types correctly with:
```javascript
// vite.config.ts
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  }
})
```

If you encounter MIME type errors during development:
- Ensure Vite is running (`npm run dev`)
- Check Network tab in DevTools for correct content-type headers:
  - `.tsx` files: `application/typescript`
  - `.js` files: `application/javascript`

### Understanding "application/octet-stream" Errors

If you see this error:
```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

This specific error occurs when:
1. The server defaults to sending files as "application/octet-stream"
2. The server's MIME type mappings are missing or incorrect
3. The module file extension isn't recognized

Immediate solutions:
1. Add explicit MIME type mappings in your server configuration
2. Ensure .js and .mjs extensions are properly configured
3. Verify the server isn't overriding MIME types with a default_type directive

### 2. Production Build Server Configuration

When deploying the production build, configure your server:

```nginx
# Nginx example
location / {
    # Remove or modify default type if present
    # default_type application/octet-stream;
    
    # Explicitly set JavaScript MIME types
    types {
        application/javascript js mjs;
        text/javascript js mjs;  # Fallback for older browsers
    }
}
```

```apache
# Apache example
# Remove any DefaultType directive if present
# DefaultType application/octet-stream

# Set correct MIME types
AddType application/javascript .js
AddType application/javascript .mjs
```

### 3. Common Browser Console Errors

Different error messages indicate specific issues:

```
Failed to load module script: Expected MIME type 'application/javascript' but received 'text/plain'
```
- Server is serving files as plain text
- Missing MIME type configuration

```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "application/octet-stream"
```
- Server is using default octet-stream type
- MIME type mappings not configured

### 4. TypeScript Import Resolution

Current configuration in tsconfig.json handles module imports correctly with path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## HTML Spec Compliance

Modern browsers enforce strict MIME type checking for ES modules as per the HTML specification:
1. Modules MUST be served with `Content-Type: application/javascript`
2. This is a security feature that cannot be disabled
3. The spec requires this to prevent security vulnerabilities
4. No fallback MIME types are allowed for modules

## Security Considerations

1. Always use `type="module"` for ES modules
2. Maintain proper CORS headers for cross-origin scripts
3. Use `crossorigin` attribute for external module scripts
4. Avoid inline module scripts without proper CSP headers
5. Don't attempt to bypass MIME type checking

## Testing Module Loading

To verify proper loading:
1. Use browser DevTools Network tab
2. Check Response Headers for correct Content-Type
3. Verify no CORS issues in Console
4. Ensure all import paths are correct

## Common Fixes Checklist

- [ ] Development server running properly
- [ ] Correct file extensions (.js, .tsx)
- [ ] Server MIME type configuration explicitly set
- [ ] No default_type overrides
- [ ] CORS headers for cross-origin resources
- [ ] Browser cache cleared
- [ ] Import paths using correct aliases
- [ ] No syntax errors in module code