// public/oauth-redirect.js
if (window.location.hash.includes('access_token')) {
    const params = new URLSearchParams(window.location.hash.substring(1))
    const token = params.get('access_token')
    
    window.opener.postMessage({
      type: 'google-auth-response',
      token: token
    }, window.location.origin)
    
    window.close()
  }