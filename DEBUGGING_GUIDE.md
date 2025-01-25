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

### 2. Production Build

When deploying the production build:

1. Verify server configuration for correct MIME types:
```nginx
# Nginx example
location / {
    types {
        application/javascript js mjs;
    }
}
```

```apache
# Apache example
AddType application/javascript .js .mjs
```

2. Check external CDN script:
```html
<script src="https://cdn.gpteng.co/gptengineer.js" type="module" crossorigin></script>
```
- Verify the CDN serves with `Content-Type: application/javascript`
- The `crossorigin` attribute is correctly set

### 3. Browser Console Error Messages

If you see errors like:
```
Failed to load module script: Expected MIME type 'application/javascript' but received 'text/plain'
```

Solutions in order of priority:
1. Check development server is running
2. Verify file extensions are correct (.js/.tsx)
3. Check server MIME type configuration
4. Clear browser cache and reload

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

## Security Considerations

1. Always use `type="module"` for ES modules
2. Maintain proper CORS headers for cross-origin scripts
3. Use `crossorigin` attribute for external module scripts
4. Avoid inline module scripts without proper CSP headers

## Testing Module Loading

To verify proper loading:
1. Use browser DevTools Network tab
2. Check Response Headers for correct Content-Type
3. Verify no CORS issues in Console
4. Ensure all import paths are correct

## Common Fixes Checklist

- [ ] Development server running properly
- [ ] Correct file extensions (.js, .tsx)
- [ ] Server MIME type configuration
- [ ] CORS headers for cross-origin resources
- [ ] Browser cache cleared
- [ ] Import paths using correct aliases
- [ ] No syntax errors in module code