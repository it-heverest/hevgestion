module.exports = {
  apps: [
    {
      name: "my-frontend",
      // On Windows, we need to call the shell and tell IT to run npm
      script: "cmd.exe",
      args: "/c npm run dev",
      watch: false,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
