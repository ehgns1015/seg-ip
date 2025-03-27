module.exports = {
  apps: [
    {
      name: "seg-ip",
      script: "npm",
      args: "start",
      cwd: "/home/segadmin/Desktop/seg-ip",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
