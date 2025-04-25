export const htmlRedirect = (redirectUrl: string): string => {
  return `
      <html>
        <head><title>Redirecting...</title></head>
        <body>
          <script>window.location = "${redirectUrl}";</script>
        </body>
      </html>
    `;
};
